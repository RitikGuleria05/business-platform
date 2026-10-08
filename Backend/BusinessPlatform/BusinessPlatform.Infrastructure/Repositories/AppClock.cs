using BusinessPlatform.Application.Interfaces.Common;
using Microsoft.Extensions.Configuration;

namespace BusinessPlatform.Infrastructure.Repositories
{
    public class AppClock : IAppClock
    {
        private readonly TimeZoneInfo _businessTimeZone;

        public AppClock(IConfiguration configuration)
        {
            var timeZoneId = configuration["Application:TimeZone"]
                ?? throw new InvalidOperationException(
                    "Application timezone is not configured.");

            _businessTimeZone =
                TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }

        public DateTime UtcNow => DateTime.UtcNow;

        public DateTime BusinessNow => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow,_businessTimeZone);

        public DateTime BusinessToday => BusinessNow.Date;

        public DateTime ToUtc(DateTime businessTime)
        {
            return TimeZoneInfo.ConvertTimeToUtc(DateTime.SpecifyKind(businessTime,DateTimeKind.Unspecified),
                _businessTimeZone);
        }

        public DateTime ToBusinessTime(DateTime utcTime)
        {
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.SpecifyKind(utcTime,DateTimeKind.Utc),_businessTimeZone);
        }
    }
}
