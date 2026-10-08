namespace BusinessPlatform.Application.Services.Turnstile
{
    public interface ITurnstileService
    {
        Task<bool> ValidateAsync(string token);
    }
}
