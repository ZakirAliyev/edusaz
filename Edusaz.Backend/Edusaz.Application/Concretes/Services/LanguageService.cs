using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.Repositories.Languages;
using Edusaz.Application.Abstracts.Services;
using Edusaz.Application.Dtos;
using Edusaz.Domain.Entities;

namespace Edusaz.Application.Concretes.Services;

public class LanguageService : ILanguageService
{
    private readonly ILanguageReadRepository _languageReadRepository;
    private readonly ILanguageWriteRepository _languageWriteRepository;

    public LanguageService(ILanguageReadRepository languageReadRepository, ILanguageWriteRepository languageWriteRepository)
    {
        _languageReadRepository = languageReadRepository;
        _languageWriteRepository = languageWriteRepository;
    }

    public async Task<LanguageDto> CreateLanguageAsync(CreateLanguageDto dto)
    {
        var language = new Language
        {
            Code = dto.Code,
            Name = dto.Name,
            IsActive = true
        };

        await _languageWriteRepository.AddAsync(language);
        await _languageWriteRepository.CommitAsync();

        return new LanguageDto
        {
            Id = language.Id,
            Code = language.Code,
            Name = language.Name,
            IsActive = language.IsActive
        };
    }

    public async Task<List<LanguageDto>> GetAllActiveLanguagesAsync()
    {
        var languages = await _languageReadRepository.GetAllAsync(x => x.IsActive && !x.IsDeleted);

        var defaultLangs = new[]
        {
            new Language { Id = Guid.NewGuid(), Code = "az", Name = "Azərbaycanca", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "en", Name = "English", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "tr", Name = "Türkçe", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "ru", Name = "Русский", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "de", Name = "Deutsch", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "fr", Name = "Français", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "es", Name = "Español", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "it", Name = "Italiano", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "ar", Name = "العربية", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "zh", Name = "中文", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "pt", Name = "Português", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "pl", Name = "Polski", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "nl", Name = "Nederlands", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "se", Name = "Svenska", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "no", Name = "Norsk", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "fi", Name = "Suomi", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "dk", Name = "Dansk", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "gr", Name = "Ελληνικά", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "hu", Name = "Magyar", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "cz", Name = "Čeština", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "ro", Name = "Română", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "bg", Name = "Български", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "hr", Name = "Hrvatski", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "sk", Name = "Slovenčina", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "ua", Name = "Українська", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "ge", Name = "ქართული", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "am", Name = "Հայերեն", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "kz", Name = "Қазақша", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "uz", Name = "Oʻzbekcha", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "jp", Name = "日本語", IsActive = true },
            new Language { Id = Guid.NewGuid(), Code = "kr", Name = "한국어", IsActive = true }
        };


        bool hasAdded = false;
        foreach (var lang in defaultLangs)
        {
            if (!languages.Any(x => x.Code.Equals(lang.Code, StringComparison.OrdinalIgnoreCase)))
            {
                await _languageWriteRepository.AddAsync(lang);
                hasAdded = true;
            }
        }

        if (hasAdded)
        {
            await _languageWriteRepository.CommitAsync();
            languages = await _languageReadRepository.GetAllAsync(x => x.IsActive && !x.IsDeleted);
        }


        var flagMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "az", "🇦🇿" }, { "en", "🇬🇧" }, { "tr", "🇹🇷" }, { "ru", "🇷🇺" },
            { "de", "🇩🇪" }, { "fr", "🇫🇷" }, { "es", "🇪🇸" }, { "it", "🇮🇹" },
            { "ar", "🇸🇦" }, { "zh", "🇨🇳" }, { "pt", "🇵🇹" }, { "pl", "🇵🇱" },
            { "nl", "🇳🇱" }, { "se", "🇸🇪" }, { "no", "🇳🇴" }, { "fi", "🇫🇮" },
            { "dk", "🇩🇰" }, { "gr", "🇬🇷" }, { "hu", "🇭🇺" }, { "cz", "🇨🇿" },
            { "ro", "🇷🇴" }, { "bg", "🇧🇬" }, { "hr", "🇭🇷" }, { "sk", "🇸🇰" },
            { "ua", "🇺🇦" }, { "ge", "🇬🇪" }, { "am", "🇦🇲" }, { "kz", "🇰🇿" },
            { "uz", "🇺🇿" }, { "jp", "🇯🇵" }, { "kr", "🇰🇷" }
        };

        return languages.Select(x => new LanguageDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            Flag = flagMap.TryGetValue(x.Code, out var flag) ? flag : "🌐",
            IsActive = x.IsActive
        }).ToList();
    }


}
