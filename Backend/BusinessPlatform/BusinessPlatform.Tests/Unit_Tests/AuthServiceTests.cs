using BusinessPlatform.Application.Services;
using BusinessPlatform.Application.DTOs;
using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Domain.Entities;
using Moq;
using Xunit;
using BusinessPlatform.Application.Services.Turnstile;

namespace BusinessPlatform.Tests;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<ITokenService> _tokenService = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokenRepository = new();
    private readonly Mock<ITurnstileService> _turnstileService = new();

    private AuthService CreateService()
    {
        return new AuthService(
            _userRepository.Object,
            _tokenService.Object,
            _refreshTokenRepository.Object,
            _turnstileService.Object
        );
    }

    [Fact]
    public async Task RegisterAsync_WhenTurnstileFails_ThrowsException()
    {
        // Arrange
        var request = new RegisterRequest
        {
            UserName = "ritik",
            Email = "ritik@example.com",
            Password = "StrongPassword123!",
            TurnstileToken = "invalid-token"
        };

        _turnstileService
            .Setup(x => x.ValidateAsync(request.TurnstileToken))
            .ReturnsAsync(false);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(() => service.RegistorAsync(request));

        // Assert
        Assert.Equal("Security verification failed", exception.Message);

        _userRepository.Verify(
            x => x.AddAsync(It.IsAny<User>()),
            Times.Never
        );
    }

    [Fact]
    public async Task RegisterAsync_WhenEmailAlreadyExists_ThrowsException()
    {
        // Arrange
        var request = new RegisterRequest
        {
            UserName = "ritik",
            Email = "ritik@example.com",
            Password = "StrongPassword123!",
            TurnstileToken = "valid-token"
        };

        _turnstileService
            .Setup(x => x.ValidateAsync(request.TurnstileToken))
            .ReturnsAsync(true);

        _userRepository
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(new User
            {
                Id = Guid.NewGuid(),
                Email = request.Email
            });

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(() => service.RegistorAsync(request));

        // Assert
        Assert.Equal("User already exists", exception.Message);

        _userRepository.Verify(
            x => x.AddAsync(It.IsAny<User>()),
            Times.Never
        );
    }

    [Fact]
    public async Task LoginAsync_WhenUserDoesNotExist_ThrowsException()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "missing@example.com",
            Password = "Password123!"
        };

        _userRepository
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.LoginAsync(request)
        );

        // Assert
        Assert.Equal("Invalid email or password", exception.Message);

        _refreshTokenRepository.Verify(
            x => x.RevokeAllForUserAsync(It.IsAny<Guid>()),
            Times.Never
        );
    }

    [Fact]
    public async Task LoginAsync_WhenPasswordIsIncorrect_ThrowsException()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "ritik@example.com",
            UserName = "ritik",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword123!"),
            IsActive = true,
            Role = new Role { Name = "Admin" }
        };

        var request = new LoginRequest
        {
            Email = user.Email,
            Password = "WrongPassword123!"
        };

        _userRepository
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.LoginAsync(request)
        );

        // Assert
        Assert.Equal("Invalid email or password", exception.Message);

        _refreshTokenRepository.Verify(
            x => x.RevokeAllForUserAsync(It.IsAny<Guid>()),
            Times.Never
        );
    }

    [Fact]
    public async Task LoginAsync_WhenUserIsInactive_ThrowsException()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "ritik@example.com",
            UserName = "ritik",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword123!"),
            IsActive = false,
            Role = new Role { Name = "Admin" }
        };

        var request = new LoginRequest
        {
            Email = user.Email,
            Password = "CorrectPassword123!"
        };

        _userRepository
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.LoginAsync(request)
        );

        // Assert
        Assert.Equal("User account is inactive", exception.Message);

        _refreshTokenRepository.Verify(
            x => x.RevokeAllForUserAsync(It.IsAny<Guid>()),
            Times.Never
        );
    }


    [Fact]
    public async Task RegisterAsync_WhenRequestIsValid_CreatesUser()
    {
        // Arrange
        var request = new RegisterRequest
        {
            UserName = "ritik",
            Email = "ritik@example.com",
            Password = "StrongPassword123!",
            TurnstileToken = "valid-token"
        };

        _turnstileService
            .Setup(x => x.ValidateAsync(request.TurnstileToken))
            .ReturnsAsync(true);

        _userRepository
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync((User?)null);

        var service = CreateService();

        // Act
        await service.RegistorAsync(request);

        // Assert
        _userRepository.Verify(
            x => x.AddAsync(It.IsAny<User>()),
            Times.Once
        );

        _userRepository.Verify(
            x => x.SaveChangesAsync(),
            Times.Once
        );

        // Capture the user passed to AddAsync
        var addedUser = _userRepository.Invocations
            .Where(invocation => invocation.Method.Name == nameof(IUserRepository.AddAsync))
            .Select(invocation => invocation.Arguments[0] as User)
            .SingleOrDefault();

        Assert.NotNull(addedUser);
        Assert.Equal(request.UserName, addedUser.UserName);
        Assert.Equal(request.Email, addedUser.Email);
        Assert.True(addedUser.IsActive);

        Assert.True(
            BCrypt.Net.BCrypt.Verify(request.Password, addedUser.PasswordHash)
        );

        Assert.Equal(
            Guid.Parse("ea2a66d0-1589-43c8-8d3c-c7e9a96de47e"),
            addedUser.RoleId
        );
    }

    [Fact]
    public async Task LoginAsync_WhenCredentialsAreValid_ReturnsLoginResult()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "ritik",
            Email = "ritik@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("StrongPassword123!"),
            IsActive = true,
            Role = new Role { Name = "Admin" }
        };

        var request = new LoginRequest
        {
            Email = user.Email,
            Password = "StrongPassword123!"
        };

        _userRepository
            .Setup(x => x.GetByEmailAsync(request.Email))
            .ReturnsAsync(user);

        _tokenService
            .Setup(x => x.GenerateToken(user.Id, user.Email, "Admin"))
            .Returns("fake-access-token");

        _tokenService
            .Setup(x => x.GenerateRefreshToken())
            .Returns("fake-refresh-token");

        var service = CreateService();

        // Act
        var result = await service.LoginAsync(request);

        // Assert
        Assert.Equal("fake-access-token", result.Token);
        Assert.Equal("fake-refresh-token", result.RefreshToken);
        Assert.Equal("ritik", result.UserName);
        Assert.Equal("Admin", result.Role);

        _refreshTokenRepository.Verify(
            x => x.RevokeAllForUserAsync(user.Id),
            Times.Once
        );

        _refreshTokenRepository.Verify(
            x => x.AddAsync(It.Is<RefreshToken>(token =>
                token.Token == "fake-refresh-token" &&
                token.UserId == user.Id &&
                !token.IsRevoked &&
                token.ExpiresAt > DateTime.UtcNow
            )),
            Times.Once
        );

        _refreshTokenRepository.Verify(
            x => x.SaveAsync(),
            Times.Once
        );
    }

    [Fact]
    public async Task LogoutAsync_WhenTokenIsEmpty_DoesNotQueryRepository()
    {
        // Arrange
        var service = CreateService();

        // Act
        await service.LogoutAsync(" ");

        // Assert
        _refreshTokenRepository.Verify(
            x => x.GetByTokenAsync(It.IsAny<string>()),
            Times.Never
        );

        _refreshTokenRepository.Verify(
            x => x.SaveAsync(),
            Times.Never
        );
    }

    [Fact]
    public async Task LogoutAsync_WhenTokenDoesNotExist_DoesNotSave()
    {
        // Arrange
        _refreshTokenRepository
            .Setup(x => x.GetByTokenAsync("unknown-token"))
            .ReturnsAsync((RefreshToken?)null);

        var service = CreateService();

        // Act
        await service.LogoutAsync("unknown-token");

        // Assert
        _refreshTokenRepository.Verify(
            x => x.RevokeAsync(It.IsAny<RefreshToken>()),
            Times.Never
        );

        _refreshTokenRepository.Verify(
            x => x.SaveAsync(),
            Times.Never
        );
    }

    [Fact]
    public async Task LogoutAsync_WhenTokenExists_RevokesAndSaves()
    {
        // Arrange
        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "valid-refresh-token",
            UserId = Guid.NewGuid(),
            IsRevoked = false,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        _refreshTokenRepository
            .Setup(x => x.GetByTokenAsync(refreshToken.Token))
            .ReturnsAsync(refreshToken);

        var service = CreateService();

        // Act
        await service.LogoutAsync(refreshToken.Token);

        // Assert
        _refreshTokenRepository.Verify(
            x => x.RevokeAsync(refreshToken),
            Times.Once
        );

        _refreshTokenRepository.Verify(
            x => x.SaveAsync(),
            Times.Once
        );
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenUserDoesNotExist_ThrowsException()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userRepository
            .Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync((User?)null);

        var service = CreateService();

        var request = new ChangePasswordRequest
        {
            CurrentPassword = "OldPassword123!",
            NewPassword = "NewPassword123!"
        };

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.ChangePasswordAsync(userId, request)
        );

        // Assert
        Assert.Equal("User not found", exception.Message);

        _userRepository.Verify(
            x => x.SaveChangesAsync(),
            Times.Never
        );
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenCurrentPasswordIsIncorrect_ThrowsException()
    {
        // Arrange
        var userId = Guid.NewGuid();

        var user = new User
        {
            Id = userId,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("CorrectPassword123!")
        };

        _userRepository
            .Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        var service = CreateService();

        var request = new ChangePasswordRequest
        {
            CurrentPassword = "WrongPassword123!",
            NewPassword = "NewPassword123!"
        };

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.ChangePasswordAsync(userId, request)
        );

        // Assert
        Assert.Equal("Current password incorrect", exception.Message);

        _userRepository.Verify(
            x => x.SaveChangesAsync(),
            Times.Never
        );
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenRequestIsValid_UpdatesPassword()
    {
        // Arrange
        var userId = Guid.NewGuid();
        const string oldPassword = "OldPassword123!";
        const string newPassword = "NewPassword123!";

        var user = new User
        {
            Id = userId,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(oldPassword)
        };

        _userRepository
            .Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        var service = CreateService();

        var request = new ChangePasswordRequest
        {
            CurrentPassword = oldPassword,
            NewPassword = newPassword
        };

        // Act
        await service.ChangePasswordAsync(userId, request);

        // Assert
        Assert.True(
            BCrypt.Net.BCrypt.Verify(newPassword, user.PasswordHash)
        );

        Assert.False(
            BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash)
        );

        _userRepository.Verify(
            x => x.SaveChangesAsync(),
            Times.Once
        );
    }


    [Fact]
    public async Task RefreshTokenAsync_WhenTokenIsEmpty_ThrowsException()
    {
        // Arrange
        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.RefreshTokenAsync(" ")
        );

        // Assert
        Assert.Equal("Refresh token is required", exception.Message);
    }

    [Fact]
    public async Task RefreshTokenAsync_WhenTokenIsInvalid_ThrowsException()
    {
        // Arrange
        _refreshTokenRepository
            .Setup(x => x.GetByTokenAsync("invalid-token"))
            .ReturnsAsync((RefreshToken?)null);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.RefreshTokenAsync("invalid-token")
        );

        // Assert
        Assert.Equal(
            "Invalid, expired, or revoked refresh token",
            exception.Message
        );

        _refreshTokenRepository.Verify(
            x => x.RevokeAsync(It.IsAny<RefreshToken>()),
            Times.Never
        );
    }

    [Fact]
    public async Task RefreshTokenAsync_WhenUserDoesNotExist_ThrowsException()
    {
        // Arrange
        var oldToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "old-refresh-token",
            UserId = Guid.NewGuid(),
            User = null!
        };

        _refreshTokenRepository
            .Setup(x => x.GetByTokenAsync(oldToken.Token))
            .ReturnsAsync(oldToken);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.RefreshTokenAsync(oldToken.Token)
        );

        // Assert
        Assert.Equal("User not found", exception.Message);

        _refreshTokenRepository.Verify(
            x => x.RevokeAsync(It.IsAny<RefreshToken>()),
            Times.Never
        );
    }

    [Fact]
    public async Task RefreshTokenAsync_WhenUserIsInactive_ThrowsException()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "ritik",
            Email = "ritik@example.com",
            IsActive = false,
            Role = new Role { Name = "Admin" }
        };

        var oldToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "old-refresh-token",
            UserId = user.Id,
            User = user
        };

        _refreshTokenRepository
            .Setup(x => x.GetByTokenAsync(oldToken.Token))
            .ReturnsAsync(oldToken);

        var service = CreateService();

        // Act
        var exception = await Assert.ThrowsAsync<Exception>(
            () => service.RefreshTokenAsync(oldToken.Token)
        );

        // Assert
        Assert.Equal("User account is inactive", exception.Message);

        _refreshTokenRepository.Verify(
            x => x.RevokeAsync(It.IsAny<RefreshToken>()),
            Times.Never
        );
    }

    [Fact]
    public async Task RefreshTokenAsync_WhenTokenIsValid_RotatesRefreshToken()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "ritik",
            Email = "ritik@example.com",
            IsActive = true,
            Role = new Role { Name = "Admin" }
        };

        var oldToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = "old-refresh-token",
            UserId = user.Id,
            User = user,
            IsRevoked = false,
            ExpiresAt = DateTime.UtcNow.AddDays(3)
        };

        _refreshTokenRepository
            .Setup(x => x.GetByTokenAsync(oldToken.Token))
            .ReturnsAsync(oldToken);

        _tokenService
            .Setup(x => x.GenerateToken(user.Id, user.Email, "Admin"))
            .Returns("new-access-token");

        _tokenService
            .Setup(x => x.GenerateRefreshToken())
            .Returns("new-refresh-token");

        var service = CreateService();

        // Act
        var result = await service.RefreshTokenAsync(oldToken.Token);

        // Assert
        Assert.Equal("new-access-token", result.Token);
        Assert.Equal("new-refresh-token", result.RefreshToken);
        Assert.Equal(user.UserName, result.UserName);
        Assert.Equal("Admin", result.Role);

        _refreshTokenRepository.Verify(
            x => x.RevokeAsync(oldToken),
            Times.Once
        );

        _refreshTokenRepository.Verify(
            x => x.AddAsync(It.Is<RefreshToken>(token =>
                token.Token == "new-refresh-token" &&
                token.UserId == user.Id &&
                !token.IsRevoked &&
                token.ExpiresAt > DateTime.UtcNow
            )),
            Times.Once
        );

        _refreshTokenRepository.Verify(
            x => x.SaveAsync(),
            Times.Once
        );
    }


}
