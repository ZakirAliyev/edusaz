using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.Infrastructure.Services;

public class TeamMemberService : ITeamMemberService
{
    private readonly EdusazDbContext _context;

    public TeamMemberService(EdusazDbContext context)
    {
        _context = context;
    }

    public async Task<List<TeamMemberDto>> GetTeamMembersAsync(Guid? universityId = null)
    {
        var query = _context.TeamMembers.Where(t => !t.IsDeleted);

        if (universityId.HasValue)
        {
            query = query.Where(t => t.UniversityId == universityId.Value || t.UniversityId == null);
        }

        var members = await query.OrderByDescending(t => t.CreatedDate).ToListAsync();

        return members.Select(m => new TeamMemberDto
        {
            Id = m.Id,
            UniversityId = m.UniversityId,
            FullName = m.FullName,
            Email = m.Email,
            Role = m.Role,
            Status = m.Status,
            CanViewPrograms = m.CanViewPrograms,
            CanCreatePrograms = m.CanCreatePrograms,
            CanEditPrograms = m.CanEditPrograms,
            CanDeletePrograms = m.CanDeletePrograms,
            CanViewScholarships = m.CanViewScholarships,
            CanCreateScholarships = m.CanCreateScholarships,
            CanEditScholarships = m.CanEditScholarships,
            CanDeleteScholarships = m.CanDeleteScholarships,
            CanViewCampaigns = m.CanViewCampaigns,
            CanCreateCampaigns = m.CanCreateCampaigns,
            CanEditCampaigns = m.CanEditCampaigns,
            CanDeleteCampaigns = m.CanDeleteCampaigns,
            CanEditProfile = m.CanEditProfile,
            CreatedDate = m.CreatedDate
        }).ToList();
    }

    public async Task<TeamMemberDto?> GetByIdAsync(Guid id)
    {
        var m = await _context.TeamMembers.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
        if (m == null) return null;

        return new TeamMemberDto
        {
            Id = m.Id,
            UniversityId = m.UniversityId,
            FullName = m.FullName,
            Email = m.Email,
            Role = m.Role,
            Status = m.Status,
            CanViewPrograms = m.CanViewPrograms,
            CanCreatePrograms = m.CanCreatePrograms,
            CanEditPrograms = m.CanEditPrograms,
            CanDeletePrograms = m.CanDeletePrograms,
            CanViewScholarships = m.CanViewScholarships,
            CanCreateScholarships = m.CanCreateScholarships,
            CanEditScholarships = m.CanEditScholarships,
            CanDeleteScholarships = m.CanDeleteScholarships,
            CanViewCampaigns = m.CanViewCampaigns,
            CanCreateCampaigns = m.CanCreateCampaigns,
            CanEditCampaigns = m.CanEditCampaigns,
            CanDeleteCampaigns = m.CanDeleteCampaigns,
            CanEditProfile = m.CanEditProfile,
            CreatedDate = m.CreatedDate
        };
    }

    public async Task<TeamMemberDto> CreateTeamMemberAsync(CreateTeamMemberDto dto)
    {
        var entity = new TeamMember
        {
            Id = Guid.NewGuid(),
            UniversityId = dto.UniversityId,
            FullName = dto.FullName,
            Email = dto.Email,
            Role = dto.Role,
            Status = dto.Status ?? "Active",
            CanViewPrograms = dto.CanViewPrograms,
            CanCreatePrograms = dto.CanCreatePrograms,
            CanEditPrograms = dto.CanEditPrograms,
            CanDeletePrograms = dto.CanDeletePrograms,
            CanViewScholarships = dto.CanViewScholarships,
            CanCreateScholarships = dto.CanCreateScholarships,
            CanEditScholarships = dto.CanEditScholarships,
            CanDeleteScholarships = dto.CanDeleteScholarships,
            CanViewCampaigns = dto.CanViewCampaigns,
            CanCreateCampaigns = dto.CanCreateCampaigns,
            CanEditCampaigns = dto.CanEditCampaigns,
            CanDeleteCampaigns = dto.CanDeleteCampaigns,
            CanEditProfile = dto.CanEditProfile
        };

        await _context.TeamMembers.AddAsync(entity);
        await _context.SaveChangesAsync();

        return new TeamMemberDto
        {
            Id = entity.Id,
            UniversityId = entity.UniversityId,
            FullName = entity.FullName,
            Email = entity.Email,
            Role = entity.Role,
            Status = entity.Status,
            CanViewPrograms = entity.CanViewPrograms,
            CanCreatePrograms = entity.CanCreatePrograms,
            CanEditPrograms = entity.CanEditPrograms,
            CanDeletePrograms = entity.CanDeletePrograms,
            CanViewScholarships = entity.CanViewScholarships,
            CanCreateScholarships = entity.CanCreateScholarships,
            CanEditScholarships = entity.CanEditScholarships,
            CanDeleteScholarships = entity.CanDeleteScholarships,
            CanViewCampaigns = entity.CanViewCampaigns,
            CanCreateCampaigns = entity.CanCreateCampaigns,
            CanEditCampaigns = entity.CanEditCampaigns,
            CanDeleteCampaigns = entity.CanDeleteCampaigns,
            CanEditProfile = entity.CanEditProfile,
            CreatedDate = entity.CreatedDate
        };
    }

    public async Task<TeamMemberDto> UpdateTeamMemberAsync(Guid id, CreateTeamMemberDto dto)
    {
        var entity = await _context.TeamMembers.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
        if (entity == null) throw new Exception("Team member not found.");

        entity.FullName = dto.FullName;
        entity.Email = dto.Email;
        entity.Role = dto.Role;
        entity.Status = dto.Status ?? entity.Status;
        entity.CanViewPrograms = dto.CanViewPrograms;
        entity.CanCreatePrograms = dto.CanCreatePrograms;
        entity.CanEditPrograms = dto.CanEditPrograms;
        entity.CanDeletePrograms = dto.CanDeletePrograms;
        entity.CanViewScholarships = dto.CanViewScholarships;
        entity.CanCreateScholarships = dto.CanCreateScholarships;
        entity.CanEditScholarships = dto.CanEditScholarships;
        entity.CanDeleteScholarships = dto.CanDeleteScholarships;
        entity.CanViewCampaigns = dto.CanViewCampaigns;
        entity.CanCreateCampaigns = dto.CanCreateCampaigns;
        entity.CanEditCampaigns = dto.CanEditCampaigns;
        entity.CanDeleteCampaigns = dto.CanDeleteCampaigns;
        entity.CanEditProfile = dto.CanEditProfile;

        await _context.SaveChangesAsync();

        return new TeamMemberDto
        {
            Id = entity.Id,
            UniversityId = entity.UniversityId,
            FullName = entity.FullName,
            Email = entity.Email,
            Role = entity.Role,
            Status = entity.Status,
            CanViewPrograms = entity.CanViewPrograms,
            CanCreatePrograms = entity.CanCreatePrograms,
            CanEditPrograms = entity.CanEditPrograms,
            CanDeletePrograms = entity.CanDeletePrograms,
            CanViewScholarships = entity.CanViewScholarships,
            CanCreateScholarships = entity.CanCreateScholarships,
            CanEditScholarships = entity.CanEditScholarships,
            CanDeleteScholarships = entity.CanDeleteScholarships,
            CanViewCampaigns = entity.CanViewCampaigns,
            CanCreateCampaigns = entity.CanCreateCampaigns,
            CanEditCampaigns = entity.CanEditCampaigns,
            CanDeleteCampaigns = entity.CanDeleteCampaigns,
            CanEditProfile = entity.CanEditProfile,
            CreatedDate = entity.CreatedDate
        };
    }

    public async Task<bool> DeleteTeamMemberAsync(Guid id)
    {
        var entity = await _context.TeamMembers.FirstOrDefaultAsync(t => t.Id == id && !t.IsDeleted);
        if (entity == null) return false;

        entity.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }
}
