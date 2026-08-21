using Edusaz.Application.Abstracts.Repositories.UniversityMedias;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;

namespace Edusaz.Infrastructure.Repositories.UniversityMedias;

public class UniversityMediaReadRepository : ReadRepository<UniversityMedia>, IUniversityMediaReadRepository
{
    public UniversityMediaReadRepository(EdusazDbContext context) : base(context)
    {
    }
}
