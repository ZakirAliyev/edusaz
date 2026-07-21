using System.Threading.Tasks;

namespace Edusaz.Application.Abstracts.AI;

public interface ITranslationAIService
{
    Task<string> TranslateAsync(string text, string targetLanguageName);
}
