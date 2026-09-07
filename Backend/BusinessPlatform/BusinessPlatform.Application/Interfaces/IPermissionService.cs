namespace BusinessPlatform.Application.Interfaces
{
    public interface IPermissionService
    {
        // used in the permission middleware
        Task<bool> HasPermissionAsync(Guid userId, string permission);
    }
}
