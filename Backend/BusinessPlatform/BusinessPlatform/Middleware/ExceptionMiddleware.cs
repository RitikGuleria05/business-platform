using BusinessPlatform.API.Models;
using BusinessPlatform.Domain.Exceptions;
using System.Text.Json;

namespace BusinessPlatform.API.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            int statusCode;
            string message;

            switch (exception)
            {
                case NotFoundException:
                    statusCode = StatusCodes.Status404NotFound;
                    message = exception.Message;
                    break;

                case BadRequestException:
                    statusCode = StatusCodes.Status400BadRequest;
                    message = exception.Message;
                    break;

                case UnauthorizedException:
                    statusCode = StatusCodes.Status401Unauthorized;
                    message = exception.Message;
                    break;

                case ForbiddenException:
                    statusCode = StatusCodes.Status403Forbidden;
                    message = exception.Message;
                    break;


                //default:
                //    statusCode = StatusCodes.Status500InternalServerError;
                //    message = "An unexpected error occurred.";
                //    break; for the prductions

                default:
                    statusCode = StatusCodes.Status500InternalServerError;

                #if DEBUG
                    message = exception.Message;
                #else
                    message = "An unexpected error occurred.";
                #endif

                   break;
            }

            context.Response.StatusCode = statusCode;

            var response = new ErrorResponse
            {
                StatusCode = statusCode,
                Message = message
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
