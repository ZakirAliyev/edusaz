using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface IHiddenTalentService
{
    Task<HiddenTalentDetailDto> SubmitTalentAsync(CreateHiddenTalentDto dto);
    Task<List<HiddenTalentListDto>> GetAllSubmissionsAsync(string? status, string? search);
    Task<HiddenTalentDetailDto?> GetSubmissionByIdAsync(Guid id);
    Task<bool> UpdateStatusAsync(Guid id, UpdateTalentStatusDto dto);
    Task<bool> DeleteSubmissionAsync(Guid id);
}
