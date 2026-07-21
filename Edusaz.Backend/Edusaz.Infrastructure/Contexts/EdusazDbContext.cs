using System;
using System.Threading;
using System.Threading.Tasks;
using Edusaz.Domain.Entities;
using Edusaz.Domain.Entities.Common;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.Infrastructure.Contexts;

public class EdusazDbContext : IdentityDbContext<User, Role, Guid>
{
    public EdusazDbContext(DbContextOptions<EdusazDbContext> options) : base(options) { }

    public DbSet<Language> Languages { get; set; }
    public DbSet<University> Universities { get; set; }
    public DbSet<UniversityTranslation> UniversityTranslations { get; set; }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedDate = DateTime.UtcNow;
                entry.Entity.LastUpdatedDate = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.LastUpdatedDate = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
