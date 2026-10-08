using System.Net.Http.Json;
using BusinessPlatform.Application.Services.Turnstile;
using Microsoft.Extensions.Options;

public class TurnstileService : ITurnstileService
{
    private const string SiteVerifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private readonly HttpClient _httpClient;
    private readonly TurnstileOptions _options;

    public TurnstileService(HttpClient httpClient, IOptions<TurnstileOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<bool> ValidateAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        if (token.Length > 2048)
        {
            return false;
        }

        var request = new
        {
            secret = _options.SecretKey,
            response = token
        };

        try
        {
            var response = await _httpClient.PostAsJsonAsync(
                SiteVerifyUrl,
                request
            );

            if (!response.IsSuccessStatusCode)
            {
                return false;
            }

            var result =  await response.Content.ReadFromJsonAsync<TurnstileResponse>();

            return result?.Success == true;
        }
        catch
        {
            return false;
        }
    }
}