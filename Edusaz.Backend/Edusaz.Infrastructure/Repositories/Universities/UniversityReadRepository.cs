using Edusaz.Application.Abstracts.Repositories.Universities;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;

namespace Edusaz.Infrastructure.Repositories.Universities;

public class UniversityReadRepository : ReadRepository<University>, IUniversityReadRepository
{
    public UniversityReadRepository(EdusazDbContext context) : base(context)
    {
    }
}
