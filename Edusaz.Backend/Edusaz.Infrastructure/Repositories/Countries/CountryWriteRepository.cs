using Edusaz.Application.Abstracts.Repositories.Countries;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;

namespace Edusaz.Infrastructure.Repositories.Countries;

public class CountryWriteRepository : WriteRepository<Country>, ICountryWriteRepository
{
    public CountryWriteRepository(EdusazDbContext context) : base(context)
    {
    }
}
