using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface IUniversityService
{
    Task<List<UniversityDto>> GetAllUniversitiesAsync(string langCode);
    Task<UniversityDto> GetUniversityByIdAsync(Guid id, string langCode);
    Task<UniversityDto> CreateUniversityAsync(CreateUniversityDto dto);
}
