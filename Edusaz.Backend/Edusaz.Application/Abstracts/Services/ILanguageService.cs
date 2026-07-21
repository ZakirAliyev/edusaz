using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Edusaz.Application.Dtos;

namespace Edusaz.Application.Abstracts.Services;

public interface ILanguageService
{
    Task<List<LanguageDto>> GetAllActiveLanguagesAsync();
    Task<LanguageDto> CreateLanguageAsync(CreateLanguageDto dto);
}
