using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Domain.Entities;
using Edusaz.Infrastructure.Contexts;
using Microsoft.EntityFrameworkCore;

namespace Edusaz.Infrastructure.Services;

public class HiddenTalentService : IHiddenTalentService
{
    private readonly EdusazDbContext _context;

    public HiddenTalentService(EdusazDbContext context)
    {
        _context = context;
    }

    public async Task<HiddenTalentDetailDto> SubmitTalentAsync(CreateHiddenTalentDto dto)
    {
        var entity = new HiddenTalent
        {
            Id = Guid.NewGuid(),
            Status = "New",
            FirstName = dto.FirstName?.Trim() ?? string.Empty,
            LastName = dto.LastName?.Trim() ?? string.Empty,
            Phone = dto.Phone?.Trim() ?? string.Empty,
            Email = dto.Email?.Trim() ?? string.Empty,
            Age = dto.Age?.Trim(),
            CityCountry = dto.CityCountry?.Trim(),
            SocialLinks = dto.SocialLinks?.Trim(),
            SkillName = dto.SkillName?.Trim() ?? string.Empty,
            ExperienceDuration = dto.ExperienceDuration?.Trim(),
            SkillLevel = dto.SkillLevel?.Trim(),
            WhereUsed = dto.WhereUsed?.Trim(),
            WhatCreated = dto.WhatCreated?.Trim(),
            IdeaDescription = dto.IdeaDescription?.Trim(),
            ProblemSolved = dto.ProblemSolved?.Trim(),
            TargetAudience = dto.TargetAudience?.Trim(),
            CurrentProgress = dto.CurrentProgress?.Trim(),
            MainGoal = dto.MainGoal?.Trim(),
            DynamicCategoryQuestion = dto.DynamicCategoryQuestion?.Trim(),
            DynamicCategoryAnswer = dto.DynamicCategoryAnswer?.Trim(),
            VoiceNoteUrl = dto.VoiceNoteUrl?.Trim(),
            VideoUrl = dto.VideoUrl?.Trim(),
            UploadedFilesJson = dto.UploadedFilesJson?.Trim(),
            EstimatedInvestment = dto.EstimatedInvestment?.Trim(),
            CustomInvestmentAmount = dto.CustomInvestmentAmount?.Trim(),
            NeededSupportTypes = dto.NeededSupportTypes?.Trim(),
            OtherNeeds = dto.OtherNeeds?.Trim(),
            TeamStatus = dto.TeamStatus?.Trim() ?? "Solo",
            TeamSize = dto.TeamSize,
            TeamRoles = dto.TeamRoles?.Trim(),
            TeamNotes = dto.TeamNotes?.Trim(),
            OneYearVision = dto.OneYearVision?.Trim(),
            WantIncome = dto.WantIncome?.Trim(),
            WantBusiness = dto.WantBusiness?.Trim(),
            UltimateAmbition = dto.UltimateAmbition?.Trim()
        };

        await _context.HiddenTalents.AddAsync(entity);
        await _context.SaveChangesAsync();

        return MapToDetailDto(entity);
    }

    public async Task<List<HiddenTalentListDto>> GetAllSubmissionsAsync(string? status, string? search)
    {
        var query = _context.HiddenTalents
            .Where(x => !x.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && !status.Equals("All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(x => x.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x =>
                x.FirstName.ToLower().Contains(s) ||
                x.LastName.ToLower().Contains(s) ||
                x.Email.ToLower().Contains(s) ||
                x.Phone.ToLower().Contains(s) ||
                x.SkillName.ToLower().Contains(s) ||
                (x.IdeaDescription != null && x.IdeaDescription.ToLower().Contains(s))
            );
        }

        var list = await query
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync();

        return list.Select(MapToListDto).ToList();
    }

    public async Task<HiddenTalentDetailDto?> GetSubmissionByIdAsync(Guid id)
    {
        var item = await _context.HiddenTalents
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);

        return item == null ? null : MapToDetailDto(item);
    }

    public async Task<bool> UpdateStatusAsync(Guid id, UpdateTalentStatusDto dto)
    {
        var item = await _context.HiddenTalents.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (item == null) return false;

        item.Status = dto.Status ?? item.Status;
        if (dto.AdminNotes != null)
        {
            item.AdminNotes = dto.AdminNotes;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteSubmissionAsync(Guid id)
    {
        var item = await _context.HiddenTalents.FirstOrDefaultAsync(x => x.Id == id && !x.IsDeleted);
        if (item == null) return false;

        item.IsDeleted = true;
        await _context.SaveChangesAsync();
        return true;
    }

    private static HiddenTalentListDto MapToListDto(HiddenTalent entity)
    {
        int filesCount = 0;
        if (!string.IsNullOrEmpty(entity.UploadedFilesJson))
        {
            try
            {
                using var doc = JsonDocument.Parse(entity.UploadedFilesJson);
                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                {
                    filesCount = doc.RootElement.GetArrayLength();
                }
            }
            catch { }
        }

        return new HiddenTalentListDto
        {
            Id = entity.Id,
            CreatedDate = entity.CreatedDate,
            Status = entity.Status,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Email = entity.Email,
            Phone = entity.Phone,
            CityCountry = entity.CityCountry,
            SkillName = entity.SkillName,
            SkillLevel = entity.SkillLevel,
            IdeaDescription = entity.IdeaDescription,
            EstimatedInvestment = entity.EstimatedInvestment,
            VoiceNoteUrl = entity.VoiceNoteUrl,
            VideoUrl = entity.VideoUrl,
            FilesCount = filesCount
        };
    }

    private static HiddenTalentDetailDto MapToDetailDto(HiddenTalent entity)
    {
        return new HiddenTalentDetailDto
        {
            Id = entity.Id,
            CreatedDate = entity.CreatedDate,
            LastUpdatedDate = entity.LastUpdatedDate,
            Status = entity.Status,
            AdminNotes = entity.AdminNotes,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Phone = entity.Phone,
            Email = entity.Email,
            Age = entity.Age,
            CityCountry = entity.CityCountry,
            SocialLinks = entity.SocialLinks,
            SkillName = entity.SkillName,
            ExperienceDuration = entity.ExperienceDuration,
            SkillLevel = entity.SkillLevel,
            WhereUsed = entity.WhereUsed,
            WhatCreated = entity.WhatCreated,
            IdeaDescription = entity.IdeaDescription,
            ProblemSolved = entity.ProblemSolved,
            TargetAudience = entity.TargetAudience,
            CurrentProgress = entity.CurrentProgress,
            MainGoal = entity.MainGoal,
            DynamicCategoryQuestion = entity.DynamicCategoryQuestion,
            DynamicCategoryAnswer = entity.DynamicCategoryAnswer,
            VoiceNoteUrl = entity.VoiceNoteUrl,
            VideoUrl = entity.VideoUrl,
            UploadedFilesJson = entity.UploadedFilesJson,
            EstimatedInvestment = entity.EstimatedInvestment,
            CustomInvestmentAmount = entity.CustomInvestmentAmount,
            NeededSupportTypes = entity.NeededSupportTypes,
            OtherNeeds = entity.OtherNeeds,
            TeamStatus = entity.TeamStatus,
            TeamSize = entity.TeamSize,
            TeamRoles = entity.TeamRoles,
            TeamNotes = entity.TeamNotes,
            OneYearVision = entity.OneYearVision,
            WantIncome = entity.WantIncome,
            WantBusiness = entity.WantBusiness,
            UltimateAmbition = entity.UltimateAmbition
        };
    }
}
