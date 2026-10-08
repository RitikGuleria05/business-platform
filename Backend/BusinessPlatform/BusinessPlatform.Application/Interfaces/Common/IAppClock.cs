namespace BusinessPlatform.Application.Interfaces.Common
{
    public interface IAppClock
    {
        DateTime UtcNow { get; }

        DateTime BusinessNow { get; }

        DateTime BusinessToday { get; }

        DateTime ToUtc(DateTime businessTime);

        DateTime ToBusinessTime(DateTime utcTime);
    }
}
