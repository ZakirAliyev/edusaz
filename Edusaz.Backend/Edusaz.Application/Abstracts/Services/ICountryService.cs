using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface ICountryService
{
    Task<List<CountryDto>> GetAllCountriesAsync(string lang = "en");
    Task<CountryDto?> GetCountryByIdAsync(Guid id, string lang = "en");
    Task<CountryDto?> GetCountryByCodeOrIdAsync(string codeOrId, string lang = "en");
    Task<List<UniversityDto>> GetUniversitiesByCountryIdAsync(Guid countryId, string lang = "en");
    Task<CountryDto> CreateCountryAsync(CreateCountryDto dto);
    Task<CountryDto> UpdateCountryAsync(Guid id, CreateCountryDto dto);
    Task<bool> DeleteCountryAsync(Guid id);
}
