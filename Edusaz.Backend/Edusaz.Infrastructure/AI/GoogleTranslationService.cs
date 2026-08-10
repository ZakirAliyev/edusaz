using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Edusaz.Application.Abstracts.AI;
using Microsoft.Extensions.Configuration;

namespace Edusaz.Infrastructure.AI;

public class GoogleTranslationService : ITranslationAIService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    private static readonly Dictionary<string, string> LanguageCodeMap = new()
    {
        { "Azerbaijani", "az" }, { "English", "en" }, { "Russian", "ru" },
        { "Turkish", "tr" }, { "German", "de" }, { "French", "fr" },
        { "Spanish", "es" }, { "Italian", "it" }, { "Arabic", "ar" },
        { "Chinese", "zh-CN" }, { "Portuguese", "pt" }, { "Dutch", "nl" },
        { "Swedish", "sv" }, { "Norwegian", "no" }, { "Finnish", "fi" },
        { "Danish", "da" }, { "Greek", "el" }, { "Hungarian", "hu" },
        { "Czech", "cs" }, { "Romanian", "ro" }, { "Bulgarian", "bg" },
        { "Croatian", "hr" }, { "Slovak", "sk" }, { "Ukrainian", "uk" },
        { "Georgian", "ka" }, { "Armenian", "hy" }, { "Kazakh", "kk" },
        { "Uzbek", "uz" }, { "Japanese", "ja" }, { "Korean", "ko" },
        { "Hindi", "hi" }
    };

    public GoogleTranslationService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _httpClient = httpClientFactory.CreateClient("GoogleTranslate");
        _apiKey = configuration["GoogleTranslate:ApiKey"] ?? throw new InvalidOperationException("Google Translate API key is not configured.");
    }

    public async Task<string> TranslateAsync(string text, string targetLanguageName)
    {
        if (string.IsNullOrWhiteSpace(text)) return text;

        // Resolve language name to Google language code
        if (!LanguageCodeMap.TryGetValue(targetLanguageName, out var targetCode))
        {
            // Try lowercase match
            var found = LanguageCodeMap.FirstOrDefault(kv =>
                kv.Key.Equals(targetLanguageName, StringComparison.OrdinalIgnoreCase));
            targetCode = found.Value ?? targetLanguageName.ToLower().Substring(0, Math.Min(2, targetLanguageName.Length));
        }

        try
        {
            var requestBody = new
            {
                q = text,
                source = "az",
                target = targetCode,
                format = "text"
            };

            var url = $"https://translation.googleapis.com/language/translate/v2?key={_apiKey}";
            var response = await _httpClient.PostAsJsonAsync(url, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                Console.Error.WriteLine($"[GoogleTranslate] Error {response.StatusCode}: {error}");
                return text;
            }

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var translated = doc.RootElement
                .GetProperty("data")
                .GetProperty("translations")[0]
                .GetProperty("translatedText")
                .GetString();

            return translated ?? text;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[GoogleTranslate] Exception: {ex.Message}");
            return text;
        }
    }
}
