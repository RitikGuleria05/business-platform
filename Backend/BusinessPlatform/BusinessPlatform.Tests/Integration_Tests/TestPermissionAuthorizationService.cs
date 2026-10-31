
using BusinessPlatform.Application.Interfaces;

namespace BusinessPlatform.Tests.Integration_Tests;

public sealed class TestPermissionAuthorizationService
    : IPermissionAuthorizationService
{
    private readonly bool _allowed;

    public TestPermissionAuthorizationService(bool allowed)
    {
        _allowed = allowed;
    }

    public Task<bool> HasPermissionAsync(
        Guid userId,
        string permission)
    {
        return Task.FromResult(_allowed);
    }
}
