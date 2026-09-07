using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Edusaz.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ILogger<PaymentsController> _logger;

    public PaymentsController(ILogger<PaymentsController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Server-to-server callback endpoint for ePoint payment gateway.
    /// Handles both POST and GET notifications.
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

        return Ok(new
        {
            status = "success",
            message = "ePoint callback received successfully",
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Result endpoint for payment gateways (ePoint result_url).
    /// </summary>
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

        return Ok(new
        {
            status = "success",
            message = "ePoint result received successfully",
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Webhook endpoint alias for payment status notifications.
    /// </summary>
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

        return Ok(new
        {
            status = "success",
            message = "Webhook received successfully",
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Fallback success endpoint on backend that redirects to frontend success page if accessed in browser.
    /// </summary>
    [HttpGet("success")]
    public IActionResult SuccessRedirect()
    {
        var redirectUrl = "https://edusaz.com/payment/success" + Request.QueryString.Value;
        return Redirect(redirectUrl);
    }

    /// <summary>
    /// Fallback fail endpoint on backend that redirects to frontend fail page if accessed in browser.
    /// </summary>
    [HttpGet("fail")]
    public IActionResult FailRedirect()
    {
        var redirectUrl = "https://edusaz.com/payment/fail" + Request.QueryString.Value;
        return Redirect(redirectUrl);
    }
}
