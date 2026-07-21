using System;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Repositories;
using Edusaz.Domain.Entities.Common;
using Edusaz.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.Infrastructure.Repositories;

public class WriteRepository<T> : IWriteRepository<T> where T : BaseEntity, new()
{
    private readonly EdusazDbContext _context;

    public WriteRepository(EdusazDbContext context)
    {
        _context = context;
    }

    public DbSet<T> Table => _context.Set<T>();

    public async Task AddAsync(T entity)
    {
        await Table.AddAsync(entity);
    }

    public async Task<int> CommitAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public DbContext GetDbContext()
    {
        return _context;
    }

    public async Task HardDeleteAsync(T entity)
    {
        Table.Remove(entity);
        await Task.CompletedTask;
    }

    public async Task SoftDeleteAsync(T entity)
    {
        entity.IsDeleted = true;
        entity.DeletedDate = DateTime.UtcNow;
        _context.Update(entity);
        await Task.CompletedTask;
    }

    public async Task<T> UpdateAsync(T entity)
    {
        Table.Update(entity);
        return await Task.FromResult(entity);
    }
}
