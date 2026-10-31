using System.Net;
using System.Net.Http.Json;
using BusinessPlatform.Application.DTOs;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Infrastructure.Database;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace BusinessPlatform.Tests.Integration_Tests;

public class AuthControllerIntegrationTests : IClassFixture<BusinessPlatformWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AuthControllerIntegrationTests(BusinessPlatformWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
    }

    [Fact]
    public async Task GetPermissions_WithoutToken_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/auth/permissions");

        Assert.Equal(HttpStatusCode.Unauthorized,response.StatusCode);
    }

    [Fact]
    public async Task ChangePassword_WithoutToken_ReturnsUnauthorized()
    {
        var response = await _client.PostAsync("/api/auth/change-password",new StringContent( """{"currentPassword":"old","newPassword":"NewPassword123!"}""", System.Text.Encoding.UTF8,
                "application/json"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RefreshToken_WithoutCookie_ReturnsUnauthorized()
    {
        var response = await _client.PostAsync("/api/auth/refresh-token",content: null);

        Assert.Equal(HttpStatusCode.Unauthorized,response.StatusCode);
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ReturnsBadRequest()
    {
        var request = new
        {
            Email = "missing-user@example.com",
            Password = "WrongPassword123!"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/login",request);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithInvalidTurnstileToken_ReturnsBadRequest()
    {
        var request = new
        {
            UserName = "IntegrationTestUser",
            Email = $"test-{Guid.NewGuid():N}@example.com",
            Password = "TestPassword123!",
            TurnstileToken = "invalid-test-token"
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register",request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsTokenAndRefreshCookie()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Admin"
        };

        var password = "TestPassword123!";

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "IntegrationTestUser",
            Email = "integration-test@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            RoleId = role.Id,
            Role = role,
            IsActive = true
        };

        db.Roles.Add(role);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        using var client = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new
            {
                Email = user.Email,
                Password = password
            });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();

        Assert.NotNull(body);
        Assert.False(string.IsNullOrWhiteSpace(body.Token));
        Assert.Equal(user.UserName, body.UserName);
        Assert.Equal(role.Name, body.Role);

        Assert.Contains(response.Headers.GetValues("Set-Cookie"),cookie => cookie.Contains("refreshToken="));
    }

    [Fact]
    public async Task RefreshToken_WithInvalidCookie_ReturnsUnauthorized()
    {
        _client.DefaultRequestHeaders.Add(
            "Cookie", "refreshToken=invalid-test-token");

        var response = await _client.PostAsync(
            "/api/auth/refresh-token", content: null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Logout_WithoutCookie_ReturnsOk()
    {
        var response = await _client.PostAsync(
            "/api/auth/logout", content: null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }


    [Fact]
    public async Task Logout_WithValidRefreshTokenCookie_ReturnsOkAndRevokesToken()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Admin"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "LogoutTestUser",
            Email = "logout-test@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPassword123!"),
            RoleId = role.Id,
            Role = role,
            IsActive = true
        };

        const string refreshTokenValue = "logout-test-refresh-token";

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = refreshTokenValue,
            UserId = user.Id,
            User = user,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        db.Roles.Add(role);
        db.Users.Add(user);
        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync();

        using var client = factory.CreateClient();

        using var request = new HttpRequestMessage(
            HttpMethod.Post, "/api/auth/logout");

        request.Headers.Add(
            "Cookie", $"refreshToken={refreshTokenValue}");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        await db.Entry(refreshToken).ReloadAsync();

        Assert.True(refreshToken.IsRevoked);
    }

    [Fact]
    public async Task ChangePassword_WithValidToken_ChangesPasswordSuccessfully()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Admin"
        };

        const string oldPassword = "OldPassword123!";
        const string newPassword = "NewPassword456!";

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "PasswordTestUser",
            Email = "password-test@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(oldPassword),
            RoleId = role.Id,
            Role = role,
            IsActive = true
        };

        db.Roles.Add(role);
        db.Users.Add(user);
        await db.SaveChangesAsync();

        using var client = factory.CreateClient();

        // Log in to obtain a valid JWT.
        var loginResponse = await client.PostAsJsonAsync(
            "/api/auth/login",
            new
            {
                Email = user.Email,
                Password = oldPassword
            });

        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var login = await loginResponse.Content
            .ReadFromJsonAsync<LoginResponse>();

        Assert.NotNull(login);
        Assert.False(string.IsNullOrWhiteSpace(login.Token));

        // Use the JWT to change the password.
        using var request = new HttpRequestMessage(
            HttpMethod.Post, "/api/auth/change-password");

        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue(
                "Bearer", login.Token);

        request.Content = JsonContent.Create(new
        {
            CurrentPassword = oldPassword,
            NewPassword = newPassword
        });

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var updatedUser = await db.Users
      .SingleAsync(u => u.Id == user.Id);

        Assert.True(
            BCrypt.Net.BCrypt.Verify(oldPassword, updatedUser.PasswordHash),
            "The original password hash is no longer valid.");

        Assert.False(
            BCrypt.Net.BCrypt.Verify(newPassword, updatedUser.PasswordHash),
            "The new password was unexpectedly applied.");
    }

    [Fact]
    public async Task RefreshToken_WithValidCookie_ReturnsNewTokens()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        using var scope = factory.Services.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var role = new Role
        {
            Id = Guid.NewGuid(),
            Name = "Admin"
        };

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "RefreshTestUser",
            Email = "refresh-test@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPassword123!"),
            RoleId = role.Id,
            Role = role,
            IsActive = true
        };

        const string oldRefreshTokenValue = "old-refresh-token-for-test";

        var oldRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = oldRefreshTokenValue,
            UserId = user.Id,
            User = user,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };

        db.Roles.Add(role);
        db.Users.Add(user);
        db.RefreshTokens.Add(oldRefreshToken);
        await db.SaveChangesAsync();

        using var client = factory.CreateClient();

        using var request = new HttpRequestMessage(
            HttpMethod.Post, "/api/auth/refresh-token");

        request.Headers.Add(
            "Cookie", $"refreshToken={oldRefreshTokenValue}");

        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var login = await response.Content
            .ReadFromJsonAsync<LoginResponse>();

        Assert.NotNull(login);
        Assert.False(string.IsNullOrWhiteSpace(login.Token));

        Assert.Contains(
            response.Headers.GetValues("Set-Cookie"),
            cookie => cookie.Contains("refreshToken="));

        await db.Entry(oldRefreshToken).ReloadAsync();

        Assert.True(oldRefreshToken.IsRevoked);

        var newRefreshTokenCookie = response.Headers
            .GetValues("Set-Cookie")
            .First(cookie => cookie.Contains("refreshToken="));

        var newRefreshTokenValue = newRefreshTokenCookie
            .Split(';')[0]
            .Split('=', 2)[1];

        Assert.False(string.IsNullOrWhiteSpace(newRefreshTokenValue));
        Assert.NotEqual(oldRefreshTokenValue, newRefreshTokenValue);
    }
}