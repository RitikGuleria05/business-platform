using BusinessPlatform.Application.DTOs;
using BusinessPlatform.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BusinessPlatform.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }


        [HttpPost("register")]
        public async Task<IActionResult> Registor(RegisterRequest request)
        {
            await _authService.RegistorAsync(request);

            return Ok(new
            {
                message = "User registered successfully"
            });
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);

            Response.Cookies.Append(
                "refreshToken",
                result.RefreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,// make it none for production level
                    Path = "/api/auth",
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

            return Ok(new LoginResponse
            {
                Token = result.Token,
                UserName = result.UserName,
                Role = result.Role
            });
        }


        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return Unauthorized(new
                {
                    message = "Refresh token not found"
                });
            }

            var result = await _authService.RefreshTokenAsync(refreshToken);

            Response.Cookies.Append(
                "refreshToken",
                result.RefreshToken,
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.Lax,// same here
                    Path = "/api/auth",
                    Expires =
                        DateTimeOffset.UtcNow.AddDays(7)
                });

            return Ok(new LoginResponse
            {
                Token = result.Token,
                UserName = result.UserName,
                Role = result.Role
            });
        }


        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (!string.IsNullOrWhiteSpace(refreshToken))
            {
                await _authService.LogoutAsync(refreshToken);
            }

            Response.Cookies.Delete(
                "refreshToken",
                new CookieOptions
                {
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Path = "/api/auth"
                });

            return Ok(new
            {
                message = "Logged out successfully"
            });
        }


        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            var userIdClaim = User.FindFirst("id")?.Value;

            if (!Guid.TryParse(
                    userIdClaim,
                    out var userId))
            {
                return Unauthorized();
            }

            await _authService.ChangePasswordAsync(userId,request);

            return Ok(new
            {
                message = "Password changed successfully"
            });
        }


        [HttpGet("permissions")]
        [Authorize]
        public async Task<IActionResult> GetPermissions()
        {
            var userId = Guid.Parse(User.FindFirst("id")!.Value);

            var permissions = await _authService.GetUserPermissionsAsync(userId);

            return Ok(permissions);
        }
        // i will make a mobile app of this if i have some time left
        //  fix the date time issue the serevr date time is incorrect use your own custom date whcih is accurate in all envirments
    }
}
