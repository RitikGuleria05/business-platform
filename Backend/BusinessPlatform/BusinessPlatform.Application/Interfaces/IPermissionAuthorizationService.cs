namespace BusinessPlatform.Application.Interfaces
{
    public interface IPermissionAuthorizationService
    {
        // used in the permission middleware
        Task<bool> HasPermissionAsync(Guid userId, string permission);
    }
}
