using Edusaz.Application.Abstracts.Repositories.Languages;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;

namespace Edusaz.Infrastructure.Repositories.Languages;

public class LanguageReadRepository : ReadRepository<Language>, ILanguageReadRepository
{
    public LanguageReadRepository(EdusazDbContext context) : base(context)
    {
    }
}
