
using BusinessPlatform.Application.Services;
using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Application.DTOs;
using Moq;
using Xunit;
using BusinessPlatform.Application.DTOs.Permission;

namespace BusinessPlatform.Tests.Unit_Tests;

public class PermissionServiceTests
{
    private readonly Mock<IPermissionRepository> _permissionRepository = new();
    private readonly Mock<IModuleRepository> _moduleRepository = new();

    private PermissionService CreateService()
    {
        return new PermissionService(
            _permissionRepository.Object,
            _moduleRepository.Object
        );
    }

    [Fact]
    public async Task GetAllAsync_ReturnsPermissions()
    {
        // Arrange
        var module = new Module
        {
            Id = Guid.NewGuid(),
            Name = "Products"
        };

        var permissions = new List<Permission>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "product.read",
                ModuleId = module.Id,
                Module = module
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "product.write",
                ModuleId = module.Id,
                Module = module
            }
        };

        _permissionRepository
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(permissions);

        var service = CreateService();

        // Act
        var result = await service.GetAllAsync();

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Equal("product.read", result[0].Name);
        Assert.Equal("Products", result[0].ModuleName);
        Assert.Equal("product.write", result[1].Name);
    }

    [Fact]
    public async Task GetByIdAsync_WhenPermissionDoesNotExist_ThrowsException()
    {
        // Arrange
        var permissionId = Guid.NewGuid();

        _permissionRepository
            .Setup(x => x.GetByIdAsync(permissionId))
            .ReturnsAsync((Permission?)null);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.GetByIdAsync(permissionId)
        );

        // Assert
        Assert.Equal("Permission not found.", exception.Message);
    }

    [Fact]
    public async Task GetByIdAsync_WhenPermissionExists_ReturnsPermission()
    {
        // Arrange
        var module = new Module
        {
            Id = Guid.NewGuid(),
            Name = "Sales"
        };

        var permission = new Permission
        {
            Id = Guid.NewGuid(),
            Name = "sales.read",
            ModuleId = module.Id,
            Module = module
        };

        _permissionRepository
            .Setup(x => x.GetByIdAsync(permission.Id))
            .ReturnsAsync(permission);

        var service = CreateService();

        // Act
        var result = await service.GetByIdAsync(permission.Id);

        // Assert
        Assert.Equal(permission.Id, result.Id);
        Assert.Equal("sales.read", result.Name);
        Assert.Equal("Sales", result.ModuleName);
    }

    [Fact]
    public async Task CreateAsync_WhenPermissionAlreadyExists_ThrowsException()
    {
        // Arrange
        var request = new CreatePermissionRequest
        {
            Name = "product.read",
            ModuleId = Guid.NewGuid()
        };

        _permissionRepository
            .Setup(x => x.GetByNameAsync(request.Name))
            .ReturnsAsync(new Permission
            {
                Id = Guid.NewGuid(),
                Name = request.Name
            });

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.CreateAsync(request)
        );

        // Assert
        Assert.Equal("Permission already exists.", exception.Message);

        _permissionRepository.Verify(
            x => x.AddAsync(It.IsAny<Permission>()),
            Times.Never
        );
    }

    [Fact]
    public async Task CreateAsync_WhenModuleDoesNotExist_ThrowsException()
    {
        // Arrange
        var request = new CreatePermissionRequest
        {
            Name = "product.read",
            ModuleId = Guid.NewGuid()
        };

        _permissionRepository
            .Setup(x => x.GetByNameAsync(request.Name))
            .ReturnsAsync((Permission?)null);

        _moduleRepository
            .Setup(x => x.GetByIdAsync(request.ModuleId))
            .ReturnsAsync((Module?)null);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.CreateAsync(request)
        );

        // Assert
        Assert.Equal("Module not found.", exception.Message);

        _permissionRepository.Verify(
            x => x.AddAsync(It.IsAny<Permission>()),
            Times.Never
        );
    }

    [Fact]
    public async Task CreateAsync_WhenRequestIsValid_CreatesPermission()
    {
        // Arrange
        var module = new Module
        {
            Id = Guid.NewGuid(),
            Name = "Products"
        };

        var request = new CreatePermissionRequest
        {
            Name = "  product.read  ",
            ModuleId = module.Id
        };

        _permissionRepository
            .Setup(x => x.GetByNameAsync(request.Name))
            .ReturnsAsync((Permission?)null);

        _moduleRepository
            .Setup(x => x.GetByIdAsync(module.Id))
            .ReturnsAsync(module);

        var service = CreateService();

        // Act
        var result = await service.CreateAsync(request);

        // Assert
        Assert.Equal("product.read", result.Name);
        Assert.Equal(module.Id, result.ModuleId);
        Assert.Equal("Products", result.ModuleName);

        _permissionRepository.Verify(
            x => x.AddAsync(It.Is<Permission>(permission =>
                permission.Name == "product.read" &&
                permission.ModuleId == module.Id
            )),
            Times.Once
        );

        _permissionRepository.Verify(
            x => x.SaveChangesAsync(),
            Times.Once
        );
    }

    [Fact]
    public async Task UpdateAsync_WhenPermissionDoesNotExist_ThrowsException()
    {
        // Arrange
        var permissionId = Guid.NewGuid();

        var request = new UpdatePermissionRequest
        {
            Name = "product.write",
            ModuleId = Guid.NewGuid()
        };

        _permissionRepository
            .Setup(x => x.GetByIdAsync(permissionId))
            .ReturnsAsync((Permission?)null);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.UpdateAsync(permissionId, request)
        );

        // Assert
        Assert.Equal("Permission not found.", exception.Message);
    }

    [Fact]
    public async Task UpdateAsync_WhenModuleDoesNotExist_ThrowsException()
    {
        // Arrange
        var permissionId = Guid.NewGuid();
        var currentModuleId = Guid.NewGuid();

        var permission = new Permission
        {
            Id = permissionId,
            Name = "product.read",
            ModuleId = currentModuleId,
            Module = new Module
            {
                Id = currentModuleId,
                Name = "Products"
            }
        };

        var request = new UpdatePermissionRequest
        {
            Name = "product.write",
            ModuleId = Guid.NewGuid()
        };

        _permissionRepository
            .Setup(x => x.GetByIdAsync(permissionId))
            .ReturnsAsync(permission);

        _permissionRepository
            .Setup(x => x.GetByNameAsync(request.Name))
            .ReturnsAsync((Permission?)null);

        _moduleRepository
            .Setup(x => x.GetByIdAsync(request.ModuleId))
            .ReturnsAsync((Module?)null);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.UpdateAsync(permissionId, request)
        );

        // Assert
        Assert.Equal("Module not found.", exception.Message);

        _permissionRepository.Verify(
            x => x.SaveChangesAsync(),
            Times.Never
        );
    }

    [Fact]
    public async Task DeleteAsync_WhenPermissionIsAssignedToRole_ThrowsException()
    {
        // Arrange
        var permissionId = Guid.NewGuid();

        var permission = new Permission
        {
            Id = permissionId,
            Name = "product.read"
        };

        _permissionRepository
            .Setup(x => x.GetByIdAsync(permissionId))
            .ReturnsAsync(permission);

        _permissionRepository
            .Setup(x => x.IsAssignedToAnyRoleAsync(permissionId))
            .ReturnsAsync(true);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.DeleteAsync(permissionId)
        );

        // Assert
        Assert.Equal(
            "Cannot delete permission because it is assigned to one or more roles.",
            exception.Message
        );

        _permissionRepository.Verify(
            x => x.DeleteAsync(It.IsAny<Permission>()),
            Times.Never
        );
    }

    [Fact]
    public async Task DeleteAsync_WhenPermissionIsNotAssigned_DeletesPermission()
    {
        // Arrange
        var permissionId = Guid.NewGuid();

        var permission = new Permission
        {
            Id = permissionId,
            Name = "product.read"
        };

        _permissionRepository
            .Setup(x => x.GetByIdAsync(permissionId))
            .ReturnsAsync(permission);

        _permissionRepository
            .Setup(x => x.IsAssignedToAnyRoleAsync(permissionId))
            .ReturnsAsync(false);

        var service = CreateService();

        // Act
        await service.DeleteAsync(permissionId);

        // Assert
        _permissionRepository.Verify(
            x => x.DeleteAsync(permission),
            Times.Once
        );

        _permissionRepository.Verify(
            x => x.SaveChangesAsync(),
            Times.Once
        );
    }
}
