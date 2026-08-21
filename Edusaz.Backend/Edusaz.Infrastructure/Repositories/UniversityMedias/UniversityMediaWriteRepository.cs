using Edusaz.Application.Abstracts.Repositories.UniversityMedias;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;

namespace Edusaz.Infrastructure.Repositories.UniversityMedias;

public class UniversityMediaWriteRepository : WriteRepository<UniversityMedia>, IUniversityMediaWriteRepository
{
    public UniversityMediaWriteRepository(EdusazDbContext context) : base(context)
    {
    }
}
