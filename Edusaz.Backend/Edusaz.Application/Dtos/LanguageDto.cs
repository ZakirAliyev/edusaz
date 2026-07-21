using System;

namespace Edusaz.Application.Dtos;

public class LanguageDto
{
    public Guid Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public bool IsActive { get; set; }
}

public class CreateLanguageDto
{
    public string Code { get; set; }
    public string Name { get; set; }
}
