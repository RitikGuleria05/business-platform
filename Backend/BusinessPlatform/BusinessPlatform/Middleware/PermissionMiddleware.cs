using BusinessPlatform.API.Attributes;
using BusinessPlatform.Application.Interfaces;

namespace BusinessPlatform.API.Middleware
{
    public class PermissionMiddleware
    {

        private readonly RequestDelegate _next;

        public PermissionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context,IPermissionService permissionService)
        {

            if (context.User.Identity?.IsAuthenticated == true)
            {

                var endpoint = context.GetEndpoint();

                var permission = endpoint?.Metadata.GetMetadata<PermissionAttribute>();

                if (permission != null)
                {

                    var userId =
                    context.User
                    .FindFirst("id")
                    ?.Value;

                    bool allowed =  await permissionService.HasPermissionAsync(Guid.Parse(userId!), permission.Permission);

                    if (!allowed)
                    {
                        context.Response.StatusCode = 403;
                        return;
                    }
                }

            }
            await _next(context);

        }

    }
}
