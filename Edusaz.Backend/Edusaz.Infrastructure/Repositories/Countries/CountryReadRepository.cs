using Edusaz.Application.Abstracts.Repositories.Countries;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;

namespace Edusaz.Infrastructure.Repositories.Countries;

public class CountryReadRepository : ReadRepository<Country>, ICountryReadRepository
{
    public CountryReadRepository(EdusazDbContext context) : base(context)
    {
    }
}
