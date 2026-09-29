using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Edusaz.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.API.Security;

/// <summary>Role lists for [Authorize(Roles = ...)].</summary>
public static class AccessRoles
{
    public const string SuperAdmin = "SuperAdmin";
    public const string UniversityStaff = "SuperAdmin,UniversityAdmin";
}

/// <summary>
/// Helpers that answer "who is calling and what may they touch", based only on the signed JWT
/// (plus the user's current university link in the database).
/// </summary>
public static class CallerAccess
{
    public static string GetEmail(this ClaimsPrincipal user) =>
        user.FindFirst(ClaimTypes.Email)?.Value
        ?? user.FindFirst("email")?.Value
        ?? user.FindFirst(ClaimTypes.Name)?.Value
        ?? "";

    public static bool HasRole(this ClaimsPrincipal user, string role) =>
        user.Claims.Any(c => (c.Type == ClaimTypes.Role || c.Type == "role")
                             && string.Equals(c.Value, role, StringComparison.OrdinalIgnoreCase));

    public static bool IsSuperAdmin(this ClaimsPrincipal user) => user.HasRole(AccessRoles.SuperAdmin);

    /// <summary>Only a SuperAdmin may act on behalf of another email; everyone else gets their own.</summary>
    public static string ResolveTargetEmail(this ClaimsPrincipal user, string? requestedEmail)
    {
        var own = user.GetEmail();
        if (string.IsNullOrWhiteSpace(requestedEmail)) return own;
        return user.IsSuperAdmin() ? requestedEmail.Trim() : own;
    }

    /// <summary>The university the caller administers, read from the database so re-linking takes effect immediately.</summary>
    public static async Task<Guid?> GetUniversityIdAsync(this ClaimsPrincipal user, EdusazDbContext db)
    {
        var email = user.GetEmail();
        if (string.IsNullOrWhiteSpace(email)) return null;
        var normalized = email.Trim().ToUpperInvariant();
        return await db.Users
            .Where(u => u.NormalizedEmail == normalized)
            .Select(u => u.UniversityId)
            .FirstOrDefaultAsync();
    }

    /// <summary>SuperAdmin, or a UniversityAdmin linked to exactly this university.</summary>
    public static async Task<bool> CanManageUniversityAsync(this ClaimsPrincipal user, EdusazDbContext db, Guid? universityId)
    {
        if (user.IsSuperAdmin()) return true;
        if (!user.HasRole("UniversityAdmin") || universityId is null || universityId == Guid.Empty) return false;
        return await user.GetUniversityIdAsync(db) == universityId;
    }
}
