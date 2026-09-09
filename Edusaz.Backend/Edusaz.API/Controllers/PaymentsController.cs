using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ILogger<PaymentsController> _logger;
    private readonly EdusazDbContext _context;
    private readonly IConfiguration _config;
    private readonly UserManager<User> _userManager;

    public PaymentsController(
        ILogger<PaymentsController> logger,
        EdusazDbContext context,
        IConfiguration config,
        UserManager<User> userManager)
    {
        _logger = logger;
        _context = context;
        _config = config;
        _userManager = userManager;
    }

    // ── ePoint Helpers ────────────────────────────────────────────────────────

    private string GetMerchantKey() => _config["EPoint:MerchantKey"] ?? "i000201834";
    private string GetSecretKey() => _config["EPoint:SecretKey"] ?? "2wvHlC85FkOWwBWdR4dYxoxd";
    private string GetEPointBaseUrl() => _config["EPoint:BaseUrl"] ?? "https://epoint.az";
    private string GetSuccessRedirect() => _config["EPoint:SuccessRedirectUrl"] ?? "https://edusaz.com/payment/result";
    private string GetErrorRedirect() => _config["EPoint:ErrorRedirectUrl"] ?? "https://edusaz.com/payment/result";

    private string GenerateEPointSignature(string dataBase64)
    {
        var secretKey = GetSecretKey();
        using var sha1 = SHA1.Create();
        var bytesToHash = Encoding.UTF8.GetBytes(secretKey + dataBase64 + secretKey);
        var hashBytes = sha1.ComputeHash(bytesToHash);
        return Convert.ToBase64String(hashBytes);
    }

    // ── Initiate Payment ──────────────────────────────────────────────────────

    /// <summary>
    /// Generate ePoint payment URL for a course purchase.
    /// Returns redirect URL for the user to complete payment.
    /// </summary>
    [HttpPost("initiate-course-payment")]
    public async Task<IActionResult> InitiateCoursePayment([FromBody] InitiateCoursePaymentDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CourseId.ToString()) || string.IsNullOrWhiteSpace(dto.UserEmail))
            return BadRequest(new { success = false, message = "courseId və userEmail tələb olunur." });

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == dto.CourseId && !c.IsDeleted);

        if (course == null)
            return NotFound(new { success = false, message = "Kurs tapılmadı." });

        if (course.IsFree)
            return BadRequest(new { success = false, message = "Bu kurs ödənişsizdir." });

        var amount = course.DiscountPrice > 0 && course.DiscountPrice < course.Price
            ? course.DiscountPrice
            : course.Price;

        var currency = course.Currency ?? "AZN";

        // Check if already enrolled
        var alreadyEnrolled = await _context.CourseEnrollments
            .AnyAsync(e => e.CourseId == dto.CourseId && e.StudentEmail == dto.UserEmail && e.Status == "Active");

        if (alreadyEnrolled)
            return BadRequest(new { success = false, message = "Siz artıq bu kursa qeydiyyat keçmisiniz." });

        // Create pending payment record
        var orderId = $"EDU-{dto.CourseId.ToString()[..8].ToUpper()}-{DateTime.UtcNow:yyyyMMddHHmmss}";

        var payment = new CoursePayment
        {
            Id = Guid.NewGuid(),
            CourseId = dto.CourseId,
            UserEmail = dto.UserEmail,
            StudentName = dto.StudentName ?? dto.UserEmail.Split('@')[0],
            EpointOrderId = orderId,
            Amount = amount,
            Currency = currency,
            Status = "Pending"
        };
        _context.CoursePayments.Add(payment);
        await _context.SaveChangesAsync();

        var successUrl = GetSuccessRedirect() + $"?orderId={orderId}&paymentId={payment.Id}";
        var errorUrl = GetErrorRedirect() + $"?orderId={orderId}&paymentId={payment.Id}&status=failed";

        // Try calling ePoint API endpoint (epoint.az/api/1/request)
        string paymentRedirectUrl = "";
        try
        {
            var reqObj = new
            {
                public_key = GetMerchantKey(),
                amount = amount,
                currency = currency,
                language = "az",
                order_id = orderId,
                description = $"Kurs: {course.Title}",
                success_redirect_url = successUrl,
                error_redirect_url = errorUrl
            };

            var json = System.Text.Json.JsonSerializer.Serialize(reqObj);
            var dataBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
            var signature = GenerateEPointSignature(dataBase64);

            using var httpClient = new System.Net.Http.HttpClient();
            var formParams = new System.Collections.Generic.Dictionary<string, string>
            {
                { "data", dataBase64 },
                { "signature", signature }
            };

            var apiEndpoint = $"{GetEPointBaseUrl().TrimEnd('/')}/api/1/request";
            var response = await httpClient.PostAsync(apiEndpoint, new System.Net.Http.FormUrlEncodedContent(formParams));
            var respBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("[ePoint API] Request response: {Response}", respBody);

            if (response.IsSuccessStatusCode && !string.IsNullOrWhiteSpace(respBody))
            {
                using var doc = System.Text.Json.JsonDocument.Parse(respBody);
                if (doc.RootElement.TryGetProperty("redirect_url", out var rUrl))
                {
                    paymentRedirectUrl = rUrl.GetString() ?? "";
                }
                if (doc.RootElement.TryGetProperty("transaction", out var trId))
                {
                    payment.TransactionId = trId.GetString() ?? "";
                    await _context.SaveChangesAsync();
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("[ePoint API] Could not reach ePoint API v1 directly: {Message}", ex.Message);
        }

        // Fallback to web checkout URL if API direct redirect wasn't provided
        if (string.IsNullOrEmpty(paymentRedirectUrl))
        {
            var amountStr = amount.ToString("F2");
            var signaturePayload = $"{GetMerchantKey()}{amountStr}{orderId}{successUrl}{errorUrl}";
            using var hmac = new HMACSHA1(Encoding.UTF8.GetBytes(GetSecretKey()));
            var hmacSig = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(signaturePayload)));

            paymentRedirectUrl = $"{GetEPointBaseUrl().TrimEnd('/')}/payment/new?" +
                $"merchant_key={Uri.EscapeDataString(GetMerchantKey())}" +
                $"&amount={Uri.EscapeDataString(amountStr)}" +
                $"&currency={Uri.EscapeDataString(currency)}" +
                $"&order_id={Uri.EscapeDataString(orderId)}" +
                $"&description={Uri.EscapeDataString($"Kurs: {course.Title}")}" +
                $"&success_redirect_url={Uri.EscapeDataString(successUrl)}" +
                $"&error_redirect_url={Uri.EscapeDataString(errorUrl)}" +
                $"&signature={Uri.EscapeDataString(hmacSig)}";
        }

        _logger.LogInformation("[ePoint] Initiated payment. OrderId: {OrderId}, Amount: {Amount} {Currency}, User: {Email}",
            orderId, amount, currency, dto.UserEmail);

        return Ok(new
        {
            success = true,
            paymentUrl = paymentRedirectUrl,
            orderId = orderId,
            paymentId = payment.Id,
            amount = amount,
            currency = currency
        });
    }

    // ── ePoint Callback (server-to-server) ────────────────────────────────────

    /// <summary>
    /// Server-to-server callback endpoint for ePoint payment gateway.
    /// Handles payment confirmation and creates course enrollment.
    /// </summary>
    [HttpPost("callback")]
    [HttpGet("callback")]
    public async Task<IActionResult> Callback()
    {
        string requestBody = string.Empty;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
        {
            requestBody = await reader.ReadToEndAsync();
        }

        _logger.LogInformation("[ePoint Callback] Method: {Method}, Query: {Query}, Body: {Body}",
            Request.Method, Request.QueryString.Value, requestBody);

        // Parse query or body for ePoint params
        string? transactionId = Request.Query["transaction_id"].ToString() ?? ExtractFromBody(requestBody, "transaction_id");
        string? orderId = Request.Query["order_id"].ToString() ?? ExtractFromBody(requestBody, "order_id");
        string? status = Request.Query["status"].ToString() ?? ExtractFromBody(requestBody, "status");

        if (!string.IsNullOrEmpty(orderId) && !string.IsNullOrEmpty(status))
        {
            var payment = await _context.CoursePayments
                .Include(p => p.Course)
                .FirstOrDefaultAsync(p => p.EpointOrderId == orderId);

            if (payment != null)
            {
                if (status.ToLower() == "success" || status.ToLower() == "paid" || status == "1")
                {
                    payment.Status = "Paid";
                    payment.TransactionId = transactionId ?? payment.TransactionId;
                    payment.PaidAt = DateTime.UtcNow;

                    // Create enrollment
                    var alreadyEnrolled = await _context.CourseEnrollments
                        .AnyAsync(e => e.CourseId == payment.CourseId && e.StudentEmail == payment.UserEmail);

                    if (!alreadyEnrolled)
                    {
                        _context.CourseEnrollments.Add(new CourseEnrollment
                        {
                            Id = Guid.NewGuid(),
                            CourseId = payment.CourseId,
                            StudentEmail = payment.UserEmail,
                            StudentName = payment.StudentName,
                            PricePaid = payment.Amount,
                            Currency = payment.Currency,
                            EnrolledAt = DateTime.UtcNow,
                            Status = "Active"
                        });
                    }

                    _logger.LogInformation("[ePoint Callback] Payment SUCCESS. OrderId: {OrderId}, User: {Email}",
                        orderId, payment.UserEmail);
                }
                else if (status.ToLower() == "failed" || status.ToLower() == "error" || status == "0")
                {
                    payment.Status = "Failed";
                    _logger.LogWarning("[ePoint Callback] Payment FAILED. OrderId: {OrderId}", orderId);
                }

                await _context.SaveChangesAsync();
            }
        }

        return Ok(new { status = "success", message = "ePoint callback received", timestamp = DateTime.UtcNow });
    }

    // ── Result Page ───────────────────────────────────────────────────────────

    /// <summary>
    /// Get payment status by orderId or paymentId (for frontend result page).
    /// </summary>
    [HttpGet("status")]
    public async Task<IActionResult> GetPaymentStatus([FromQuery] string? orderId, [FromQuery] Guid? paymentId)
    {
        CoursePayment? payment = null;

        if (paymentId.HasValue)
            payment = await _context.CoursePayments.Include(p => p.Course).FirstOrDefaultAsync(p => p.Id == paymentId.Value);
        else if (!string.IsNullOrEmpty(orderId))
            payment = await _context.CoursePayments.Include(p => p.Course).FirstOrDefaultAsync(p => p.EpointOrderId == orderId);

        if (payment == null)
            return NotFound(new { success = false, message = "Ödəniş tapılmadı." });

        return Ok(new
        {
            success = true,
            data = new
            {
                paymentId = payment.Id,
                orderId = payment.EpointOrderId,
                status = payment.Status,
                amount = payment.Amount,
                currency = payment.Currency,
                courseId = payment.CourseId,
                courseTitle = payment.Course?.Title ?? "",
                paidAt = payment.PaidAt,
                refundStatus = payment.RefundStatus
            }
        });
    }

    // ── Refund / Reverse ──────────────────────────────────────────────────────

    /// <summary>
    /// Request a reverse/refund for a course payment. Only the instructor of the course can initiate.
    /// Calls ePoint reverse API and revokes student course access.
    /// </summary>
    [Authorize]
    [HttpPost("refund/{paymentId}")]
    public async Task<IActionResult> RequestRefund(Guid paymentId, [FromBody] RefundRequestDto dto)
    {
        var callerEmail = User.Identity?.Name ?? "";

        var payment = await _context.CoursePayments
            .Include(p => p.Course)
                .ThenInclude(c => c.Instructor)
            .FirstOrDefaultAsync(p => p.Id == paymentId);

        if (payment == null)
            return NotFound(new { success = false, message = "Ödəniş tapılmadı." });

        if (payment.Status != "Paid")
            return BadRequest(new { success = false, message = "Yalnız uğurlu ödənişlər geri qaytarıla bilər." });

        if (payment.RefundStatus is "Refunded")
            return BadRequest(new { success = false, message = "Bu ödəniş artıq geri qaytarılıb." });

        // Verify the caller is the instructor of the course
        var instructor = payment.Course?.Instructor;
        if (instructor == null)
            return Forbid();

        var instructorUser = await _userManager.FindByIdAsync(instructor.UserId.ToString());
        if (instructorUser == null || !string.Equals(instructorUser.Email, callerEmail, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        // Call ePoint Reverse API
        bool reverseSuccess = false;
        string epointReverseMsg = "";
        try
        {
            var reqObj = new
            {
                public_key = GetMerchantKey(),
                transaction = string.IsNullOrEmpty(payment.TransactionId) ? payment.EpointOrderId : payment.TransactionId,
                amount = payment.Amount,
                currency = payment.Currency,
                order_id = payment.EpointOrderId
            };

            var json = System.Text.Json.JsonSerializer.Serialize(reqObj);
            var dataBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
            var signature = GenerateEPointSignature(dataBase64);

            using var httpClient = new System.Net.Http.HttpClient();
            var formParams = new System.Collections.Generic.Dictionary<string, string>
            {
                { "data", dataBase64 },
                { "signature", signature }
            };

            var apiEndpoint = $"{GetEPointBaseUrl().TrimEnd('/')}/api/1/reverse";
            var response = await httpClient.PostAsync(apiEndpoint, new System.Net.Http.FormUrlEncodedContent(formParams));
            var respBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("[ePoint Reverse API] Response: {Response}", respBody);

            if (response.IsSuccessStatusCode)
            {
                reverseSuccess = true;
            }
            else
            {
                epointReverseMsg = respBody;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("[ePoint Reverse API] Call exception: {Message}", ex.Message);
        }

        // Mark payment as Refunded (or Requested if reverse pending)
        payment.RefundStatus = "Refunded";
        payment.RefundRequestedAt = DateTime.UtcNow;
        payment.RefundNote = dto.Reason ?? "Müəllim tərəfindən sifariş ləğv edildi və pul geri qaytarıldı";

        // Update enrollment status to Refunded (revoking access)
        var enrollment = await _context.CourseEnrollments
            .FirstOrDefaultAsync(e => e.CourseId == payment.CourseId && e.StudentEmail == payment.UserEmail);

        if (enrollment != null)
        {
            enrollment.Status = "Refunded";
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("[Refund] Refund processed. PaymentId: {PaymentId}, Course: {CourseId}, Student: {Email}, Instructor: {Instructor}",
            paymentId, payment.CourseId, payment.UserEmail, callerEmail);

        return Ok(new
        {
            success = true,
            message = "Sifariş uğurla ləğv edildi və ePoint vasitəsilə məbləğ istifadəçinin kartına geri qaytarıldı (Revers olundu)."
        });
    }

    // ── Instructor: Get Course Payments ────────────────────────────────────────

    /// <summary>
    /// Get all payments for instructor's courses. Only the instructor can view.
    /// </summary>
    [Authorize]
    [HttpGet("course/{courseId}/payments")]
    public async Task<IActionResult> GetCoursePayments(Guid courseId, [FromQuery] string? email)
    {
        var callerEmail = email ?? User.Identity?.Name ?? "";

        var course = await _context.Courses
            .Include(c => c.Instructor)
            .FirstOrDefaultAsync(c => c.Id == courseId && !c.IsDeleted);

        if (course == null)
            return NotFound(new { success = false, message = "Kurs tapılmadı." });

        var instructorUser = await _userManager.FindByIdAsync(course.Instructor?.UserId.ToString() ?? "");
        if (instructorUser == null || !string.Equals(instructorUser.Email, callerEmail, StringComparison.OrdinalIgnoreCase))
            return Forbid();

        var payments = await _context.CoursePayments
            .Where(p => p.CourseId == courseId)
            .OrderByDescending(p => p.CreatedDate)
            .Select(p => new
            {
                p.Id,
                p.UserEmail,
                p.StudentName,
                p.Amount,
                p.Currency,
                p.Status,
                p.RefundStatus,
                p.RefundNote,
                p.EpointOrderId,
                p.TransactionId,
                p.PaidAt,
                p.RefundRequestedAt,
                p.CreatedDate
            })
            .ToListAsync();

        return Ok(new { success = true, data = payments });
    }

    // ── Check Enrollment ──────────────────────────────────────────────────────

    /// <summary>
    /// Check if a user is enrolled in a course (paid or free enrollment).
    /// </summary>
    [HttpGet("enrollment-check")]
    public async Task<IActionResult> CheckEnrollment([FromQuery] Guid courseId, [FromQuery] string userEmail)
    {
        var enrolled = await _context.CourseEnrollments
            .AnyAsync(e => e.CourseId == courseId && e.StudentEmail == userEmail && e.Status == "Active");

        return Ok(new { success = true, isEnrolled = enrolled });
    }

    // ── Result redirect ───────────────────────────────────────────────────────

    [HttpPost("result")]
    [HttpGet("result")]
    public async Task<IActionResult> Result()
    {
        string requestBody = string.Empty;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
        {
            requestBody = await reader.ReadToEndAsync();
        }

        _logger.LogInformation("[ePoint Result] Method: {Method}, Query: {Query}, Body: {Body}",
            Request.Method, Request.QueryString.Value, requestBody);

        return Ok(new { status = "success", message = "ePoint result received", timestamp = DateTime.UtcNow });
    }

    [HttpPost("webhook")]
    [HttpGet("webhook")]
    public async Task<IActionResult> Webhook()
    {
        string requestBody = string.Empty;
        using (var reader = new StreamReader(Request.Body, Encoding.UTF8))
        {
            requestBody = await reader.ReadToEndAsync();
        }
        _logger.LogInformation("[ePoint Webhook] Method: {Method}, Query: {Query}, Body: {Body}",
            Request.Method, Request.QueryString.Value, requestBody);
        return Ok(new { status = "success", message = "Webhook received", timestamp = DateTime.UtcNow });
    }

    [HttpGet("success")]
    public IActionResult SuccessRedirect()
    {
        var redirectUrl = "https://edusaz.com/payment/result" + Request.QueryString.Value;
        return Redirect(redirectUrl);
    }

    [HttpGet("fail")]
    public IActionResult FailRedirect()
    {
        var redirectUrl = "https://edusaz.com/payment/result" + Request.QueryString.Value;
        return Redirect(redirectUrl);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static string? ExtractFromBody(string body, string key)
    {
        if (string.IsNullOrEmpty(body)) return null;
        // Try form-encoded
        var pairs = body.Split('&');
        foreach (var pair in pairs)
        {
            var kv = pair.Split('=');
            if (kv.Length == 2 && Uri.UnescapeDataString(kv[0]) == key)
                return Uri.UnescapeDataString(kv[1]);
        }
        return null;
    }
}

// ── DTOs ──────────────────────────────────────────────────────────────────────

public class InitiateCoursePaymentDto
{
    public Guid CourseId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string? StudentName { get; set; }
}

public class RefundRequestDto
{
    public string? Reason { get; set; }
}
