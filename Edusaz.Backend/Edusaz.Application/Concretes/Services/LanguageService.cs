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

        return languages.Select(x => new LanguageDto
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            IsActive = x.IsActive
        }).ToList();
    }
}
