using System.Threading.Tasks;
using Edusaz.Application.Abstracts.AI;

namespace Edusaz.Infrastructure.AI;

public class MockTranslationAIService : ITranslationAIService
{
    public Task<string> TranslateAsync(string text, string targetLanguageName)
    {
        // Mock translation logic for now
        // In reality, here we would call OpenAI API or Google Cloud Translation API
        return Task.FromResult($"{text} ({targetLanguageName} translation)");
    }
}
