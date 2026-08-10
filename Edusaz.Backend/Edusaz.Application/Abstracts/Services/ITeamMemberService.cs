using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface ITeamMemberService
{
    Task<List<TeamMemberDto>> GetTeamMembersAsync(Guid? universityId = null);
    Task<TeamMemberDto?> GetByIdAsync(Guid id);
    Task<TeamMemberDto> CreateTeamMemberAsync(CreateTeamMemberDto dto);
    Task<TeamMemberDto> UpdateTeamMemberAsync(Guid id, CreateTeamMemberDto dto);
    Task<bool> DeleteTeamMemberAsync(Guid id);
}
