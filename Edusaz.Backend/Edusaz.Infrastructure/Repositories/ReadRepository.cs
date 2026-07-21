using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Repositories;
using Edusaz.Domain.Entities.Common;
using Edusaz.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.Infrastructure.Repositories;

public class ReadRepository<T> : IReadRepository<T> where T : BaseEntity, new()
{
    private readonly EdusazDbContext _context;
    public ReadRepository(EdusazDbContext context)
    {
        _context = context;
    }

    public DbSet<T> Table => _context.Set<T>();

    public async Task<IList<T>> GetAllAsync(Expression<Func<T, bool>>? predicate = null, Func<IQueryable<T>, IQueryable<T>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool enableTracking = false)
    {
        IQueryable<T> queryable = Table;
        if (!enableTracking) queryable = queryable.AsNoTracking();
        if (include is null) { } else queryable = include(queryable);
        if (predicate is null) { } else queryable = queryable.Where(predicate);
        if (orderBy is null) { } else queryable = orderBy(queryable);
        return await queryable.ToListAsync();
    }

    public async Task<T> GetAsync(Expression<Func<T, bool>> predicate, Func<IQueryable<T>, IQueryable<T>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, bool enableTracking = false)
    {
        IQueryable<T> queryable = Table;
        if (!enableTracking) queryable = queryable.AsNoTracking();
        if (include is null) { } else queryable = include(queryable);
        queryable = queryable.Where(predicate);
        if (orderBy is null) { } else queryable = orderBy(queryable);
        return await queryable.FirstOrDefaultAsync();
    }

    public async Task<T> GetByIdAsync(string id, bool enableTracking = false)
    {
        IQueryable<T> queryable = Table;
        if (!enableTracking) queryable = queryable.AsNoTracking();
        return await queryable.FirstOrDefaultAsync(data => data.Id == Guid.Parse(id));
    }

    public async Task<int> GetCountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        Table.AsNoTracking();
        if (predicate is not null) Table.Where(predicate);
        return await Table.CountAsync();
    }

    public async Task<List<T>> GetPagedAsync(Expression<Func<T, bool>>? predicate = null, Func<IQueryable<T>, IQueryable<T>>? include = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, int page = 1, int pageSize = 10, bool enableTracking = false)
    {
        IQueryable<T> queryable = Table;
        if (!enableTracking) queryable = queryable.AsNoTracking();
        if (include is null) { } else queryable = include(queryable);
        if (predicate is null) { } else queryable = queryable.Where(predicate);
        if (orderBy is null) { } else queryable = orderBy(queryable);
        return await queryable.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    }

    public IQueryable<T> Query() => Table;
}
