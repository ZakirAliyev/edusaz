using Edusaz.Application.Abstracts.Repositories.Languages;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;

namespace Edusaz.Infrastructure.Repositories.Languages;

public class LanguageWriteRepository : WriteRepository<Language>, ILanguageWriteRepository
{
    public LanguageWriteRepository(EdusazDbContext context) : base(context)
    {
    }
}
