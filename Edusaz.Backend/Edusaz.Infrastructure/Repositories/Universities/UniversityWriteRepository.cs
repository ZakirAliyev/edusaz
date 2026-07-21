using Edusaz.Application.Abstracts.Repositories.Universities;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;

namespace Edusaz.Infrastructure.Repositories.Universities;

public class UniversityWriteRepository : WriteRepository<University>, IUniversityWriteRepository
{
    public UniversityWriteRepository(EdusazDbContext context) : base(context)
    {
    }
}
