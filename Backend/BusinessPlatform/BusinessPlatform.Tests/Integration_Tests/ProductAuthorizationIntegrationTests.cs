
using System.Net;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace BusinessPlatform.Tests.Integration_Tests;

public class ProductAuthorizationIntegrationTests : IClassFixture<BusinessPlatformWebApplicationFactory>
{
    private readonly BusinessPlatformWebApplicationFactory _factory;
    private readonly HttpClient _client;

    private const string JwtKey = "IntegrationTestKey-AtLeast32CharactersLong!";

    public ProductAuthorizationIntegrationTests(BusinessPlatformWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
    }

    [Fact]
    public async Task GetProducts_WithoutToken_ReturnsUnauthorized()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/product");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetProducts_WithoutPermission_ReturnsForbidden()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        factory.SetPermissionResult(false);

        using var client = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

        var token = TestJwtTokenGenerator.GenerateToken(
            Guid.NewGuid(), JwtKey);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/product");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetProducts_WithPermission_ReachesController()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        factory.SetPermissionResult(true);

        using var client = factory.CreateClient(
            new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });

        var token = TestJwtTokenGenerator.GenerateToken(
            Guid.NewGuid(), JwtKey);

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/product");

        Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetProducts_WithInvalidToken_ReturnsUnauthorized()
    {
        using var factory = new BusinessPlatformWebApplicationFactory();
        using var client = factory.CreateClient();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "not-a-valid-jwt");

        var response = await client.GetAsync("/api/product");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
