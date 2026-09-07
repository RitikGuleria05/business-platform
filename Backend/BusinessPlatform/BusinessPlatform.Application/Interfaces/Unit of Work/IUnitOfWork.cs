namespace BusinessPlatform.Application.Interfaces.Unit_of_Work
{
    public interface IUnitOfWork
    {
        Task BeginTransactionAsync();

        Task CommitTransactionAsync();

        Task RollbackTransactionAsync();

        Task SaveChangesAsync();
    }
}
