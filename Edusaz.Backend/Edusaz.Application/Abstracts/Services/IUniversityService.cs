using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface IUniversityService
{
    Task<List<UniversityDto>> GetAllUniversitiesAsync(string langCode = "en", Guid? countryId = null);
    Task<UniversityDto?> GetUniversityByIdAsync(Guid id, string langCode = "en");
    Task<UniversityDto> CreateUniversityAsync(CreateUniversityDto dto);
    Task<UniversityDto> UpdateUniversityAsync(Guid id, CreateUniversityDto dto);
    Task<bool> DeleteUniversityAsync(Guid id);
    Task<bool> ApproveUniversityAsync(Guid id);
}
