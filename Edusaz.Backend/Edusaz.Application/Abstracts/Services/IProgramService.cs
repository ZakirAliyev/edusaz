using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface IProgramService
{
    Task<List<ProgramDto>> GetAllProgramsAsync(
        string lang = "en", 
        Guid? countryId = null, 
        string? field = null, 
        string? search = null, 
        Guid? universityId = null);

    Task<ProgramDto?> GetProgramByIdAsync(Guid id, string lang = "en");
    Task<ProgramDto> CreateProgramAsync(CreateProgramDto dto);
    Task<bool> DeleteProgramAsync(Guid id);
    Task<ProgramDto> UpdateProgramAsync(Guid id, CreateProgramDto dto);
}
