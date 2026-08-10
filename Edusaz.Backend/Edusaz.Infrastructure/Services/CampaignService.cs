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

public class CampaignService : ICampaignService
{
    private readonly EdusazDbContext _context;

    public CampaignService(EdusazDbContext context)
    {
        _context = context;
    }

    public async Task<List<CampaignDto>> GetAllCampaignsAsync(string lang = "en", Guid? universityId = null)
    {
        var targetLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == lang)
                         ?? await _context.Languages.FirstOrDefaultAsync(x => x.Code == "en");

        var query = _context.Campaigns
            .Include(x => x.Translations).ThenInclude(t => t.Language)
            .AsNoTracking();

        if (universityId.HasValue && universityId.Value != Guid.Empty)
        {
            query = query.Where(c => c.UniversityId == universityId.Value);
        }

        var campaigns = await query.ToListAsync();
        return campaigns.Select(c => MapToDto(c, targetLang?.Id)).ToList();
    }

    public async Task<CampaignDto?> GetCampaignByIdAsync(Guid id, string lang = "en")
    {
        var targetLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == lang)
                         ?? await _context.Languages.FirstOrDefaultAsync(x => x.Code == "en");

        var campaign = await _context.Campaigns
            .Include(x => x.Translations).ThenInclude(t => t.Language)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        return campaign == null ? null : MapToDto(campaign, targetLang?.Id);
    }

    public async Task<CampaignDto> CreateCampaignAsync(CreateCampaignDto dto)
    {
        var enLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == "en");
        var azLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == "az");
        var trLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == "tr");

        var campaign = new Campaign
        {
            Id = Guid.NewGuid(),
            UniversityId = dto.UniversityId,
            Title = dto.Title,
            TargetRegion = dto.TargetRegion,
            TargetCountry = dto.TargetCountry,
            Budget = dto.Budget,
            Reach = dto.Reach,
            DailyApplications = dto.DailyApplications,
            Status = dto.Status ?? "Active",
            CampaignType = dto.CampaignType ?? "Global Recruitment",
            Translations = new List<CampaignTranslation>()
        };

        if (azLang != null && !string.IsNullOrEmpty(dto.TitleAz))
        {
            campaign.Translations.Add(new CampaignTranslation
            {
                Id = Guid.NewGuid(), LanguageId = azLang.Id, Title = dto.TitleAz, Description = dto.DescriptionAz
            });
        }
        if (enLang != null && !string.IsNullOrEmpty(dto.TitleEn))
        {
            campaign.Translations.Add(new CampaignTranslation
            {
                Id = Guid.NewGuid(), LanguageId = enLang.Id, Title = dto.TitleEn, Description = dto.DescriptionEn
            });
        }
        if (trLang != null && !string.IsNullOrEmpty(dto.TitleTr))
        {
            campaign.Translations.Add(new CampaignTranslation
            {
                Id = Guid.NewGuid(), LanguageId = trLang.Id, Title = dto.TitleTr, Description = dto.DescriptionTr
            });
        }

        await _context.Campaigns.AddAsync(campaign);
        await _context.SaveChangesAsync();

        return MapToDto(campaign, azLang?.Id);
    }

    public async Task<CampaignDto> UpdateCampaignAsync(Guid id, CreateCampaignDto dto)
    {
        var campaign = await _context.Campaigns
            .Include(x => x.Translations)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (campaign == null) throw new KeyNotFoundException("Campaign not found.");

        campaign.Title = dto.Title;
        campaign.TargetRegion = dto.TargetRegion;
        campaign.TargetCountry = dto.TargetCountry;
        campaign.Budget = dto.Budget;
        campaign.Reach = dto.Reach;
        campaign.DailyApplications = dto.DailyApplications;
        campaign.Status = dto.Status ?? campaign.Status;
        campaign.CampaignType = dto.CampaignType ?? campaign.CampaignType;

        var azLang = await _context.Languages.FirstOrDefaultAsync(x => x.Code == "az");
        if (azLang != null && !string.IsNullOrEmpty(dto.TitleAz))
        {
            var azTr = campaign.Translations.FirstOrDefault(t => t.LanguageId == azLang.Id);
            if (azTr != null)
            {
                azTr.Title = dto.TitleAz;
                azTr.Description = dto.DescriptionAz;
            }
            else
            {
                campaign.Translations.Add(new CampaignTranslation { Id = Guid.NewGuid(), LanguageId = azLang.Id, Title = dto.TitleAz, Description = dto.DescriptionAz });
            }
        }

        await _context.SaveChangesAsync();
        return MapToDto(campaign, azLang?.Id);
    }

    public async Task<bool> DeleteCampaignAsync(Guid id)
    {
        var campaign = await _context.Campaigns.FirstOrDefaultAsync(x => x.Id == id);
        if (campaign == null) return false;

        _context.Campaigns.Remove(campaign);
        await _context.SaveChangesAsync();
        return true;
    }

    private static CampaignDto MapToDto(Campaign c, Guid? langId)
    {
        var translation = c.Translations.FirstOrDefault(x => x.LanguageId == langId)
                          ?? c.Translations.FirstOrDefault();

        var dto = new CampaignDto
        {
            Id = c.Id,
            UniversityId = c.UniversityId,
            Title = translation?.Title ?? c.Title,
            TargetRegion = c.TargetRegion,
            TargetCountry = c.TargetCountry,
            Budget = c.Budget,
            Reach = c.Reach,
            DailyApplications = c.DailyApplications,
            Status = c.Status,
            CampaignType = c.CampaignType
        };

        foreach (var t in c.Translations)
        {
            if (t.Language != null)
            {
                dto.Translations[t.Language.Code] = new CampaignTranslationDto
                {
                    Title = t.Title,
                    Description = t.Description
                };
            }
        }

        return dto;
    }
}
