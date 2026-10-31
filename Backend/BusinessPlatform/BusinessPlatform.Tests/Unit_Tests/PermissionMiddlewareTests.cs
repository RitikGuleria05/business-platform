
using System.Security.Claims;
using BusinessPlatform.API.Attributes;
using BusinessPlatform.API.Middleware;
using BusinessPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;

namespace BusinessPlatform.Tests.Unit_Tests;

public class PermissionMiddlewareTests
{
    private readonly Mock<IPermissionAuthorizationService> _permissionService = new();

    [Fact]
    public async Task InvokeAsync_WhenUserHasPermission_CallsNextMiddleware()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var context = CreateAuthenticatedContext(userId);
        SetPermissionEndpoint(context, "product.read");

        _permissionService
            .Setup(x => x.HasPermissionAsync(userId, "product.read"))
            .ReturnsAsync(true);

        var nextCalled = false;

        RequestDelegate next = _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new PermissionMiddleware(next);

        // Act
        await middleware.InvokeAsync(context, _permissionService.Object);

        // Assert
        Assert.True(nextCalled);
        Assert.NotEqual(StatusCodes.Status403Forbidden, context.Response.StatusCode);
    }

    [Fact]
    public async Task InvokeAsync_WhenUserLacksPermission_ReturnsForbidden()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var context = CreateAuthenticatedContext(userId);
        SetPermissionEndpoint(context, "product.delete");

        _permissionService
            .Setup(x => x.HasPermissionAsync(userId, "product.delete"))
            .ReturnsAsync(false);

        var nextCalled = false;

        RequestDelegate next = _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new PermissionMiddleware(next);

        // Act
        await middleware.InvokeAsync(context, _permissionService.Object);

        // Assert
        Assert.Equal(StatusCodes.Status403Forbidden, context.Response.StatusCode);
        Assert.False(nextCalled);
    }

    [Fact]
    public async Task InvokeAsync_WhenEndpointHasNoPermissionAttribute_CallsNextMiddleware()
    {
        // Arrange
        var context = CreateAuthenticatedContext(Guid.NewGuid());

        context.SetEndpoint(new Endpoint(_ => Task.CompletedTask,new EndpointMetadataCollection(),"Endpoint without permission"));

        var nextCalled = false;

        RequestDelegate next = _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new PermissionMiddleware(next);

        // Act
        await middleware.InvokeAsync(context, _permissionService.Object);

        // Assert
        Assert.True(nextCalled);

        _permissionService.Verify(x => x.HasPermissionAsync(It.IsAny<Guid>(),It.IsAny<string>()),Times.Never);
    }

    [Fact]
    public async Task InvokeAsync_WhenUserIsUnauthenticated_CallsNextMiddleware()
    {
        // Arrange
        var context = new DefaultHttpContext();

        context.User = new ClaimsPrincipal(new ClaimsIdentity());

        SetPermissionEndpoint(context, "product.read");

        var nextCalled = false;

        RequestDelegate next = _ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new PermissionMiddleware(next);

        // Act
        await middleware.InvokeAsync(context, _permissionService.Object);

        // Assert
        Assert.True(nextCalled);

        _permissionService.Verify(x => x.HasPermissionAsync(It.IsAny<Guid>(), It.IsAny<string>()),Times.Never);
    }

    private static DefaultHttpContext CreateAuthenticatedContext(Guid userId)
    {
        var context = new DefaultHttpContext();

        var claims = new[]
        {
            new Claim("id", userId.ToString())
        };

        context.User = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuthentication"));

        return context;
    }

    private static void SetPermissionEndpoint(HttpContext context,string permission)
    {
        context.SetEndpoint(new Endpoint(_ => Task.CompletedTask,new EndpointMetadataCollection(new PermissionAttribute(permission)), "Endpoint requiring permission"));
    }
}
