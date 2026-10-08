using BCrypt.Net;
using BusinessPlatform.Application.DTOs;
using BusinessPlatform.Application.Interfaces;
using BusinessPlatform.Application.Services.Turnstile;
using BusinessPlatform.Domain.Entities;
using BusinessPlatform.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessPlatform.Application.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly ITurnstileService _turnstileService;

        public AuthService(IUserRepository userRepository,ITokenService tokenService,IRefreshTokenRepository refreshTokenRepository, ITurnstileService turnstileService)
        {
            _userRepository = userRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _tokenService = tokenService;
            _turnstileService = turnstileService;
        }

        public async Task RegistorAsync(RegisterRequest request)
        {
            var turnstileValid = await _turnstileService.ValidateAsync(request.TurnstileToken);

            if (!turnstileValid)
            {
                throw new Exception("Security verification failed");
            }

            var existingUser = await _userRepository.GetByEmailAsync(request.Email);

            if (existingUser != null)
            {
                throw new Exception("User already exists");
            }

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = request.UserName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                RoleId = Guid.Parse("ea2a66d0-1589-43c8-8d3c-c7e9a96de47e"),
                IsActive = true
            };

            await _userRepository.AddAsync(newUser);
            await _userRepository.SaveChangesAsync();
        }

        public async Task<LoginResult> LoginAsync(LoginRequest request)
        {
            var user =
                await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
            {
                throw new Exception("Invalid email or password");
            }

            var passwordValid =
                BCrypt.Net.BCrypt.Verify(
                    request.Password,
                    user.PasswordHash
                );

            if (!passwordValid)
            {
                throw new Exception("Invalid email or password");
            }

            if (!user.IsActive)
            {
                throw new Exception("User account is inactive");
            }

            // -------------------------------------------------
            // Revoke all previous active refresh tokens
            // -------------------------------------------------

            await _refreshTokenRepository
                .RevokeAllForUserAsync(user.Id);

            // -------------------------------------------------
            // Generate access token
            // -------------------------------------------------

            var accessToken =
                _tokenService.GenerateToken(
                    user.Id,
                    user.Email,
                    user.Role.Name
                );

            // -------------------------------------------------
            // Generate refresh token
            // -------------------------------------------------

            var refreshToken =
                _tokenService.GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = refreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow
            };

            await _refreshTokenRepository
                .AddAsync(refreshTokenEntity);

            await _refreshTokenRepository.SaveAsync();

            return new LoginResult
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                UserName = user.UserName,
                Role = user.Role.Name
            };
        }

        public async Task LogoutAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return;
            }

            var token =
                await _refreshTokenRepository
                    .GetByTokenAsync(refreshToken);

            if (token == null)
            {
                return;
            }

            await _refreshTokenRepository.RevokeAsync(token);

            await _refreshTokenRepository.SaveAsync();
        }

        public async Task ChangePasswordAsync(
            Guid userId,
            ChangePasswordRequest request)
        {
            var user =
                await _userRepository.GetByIdAsync(userId);

            if (user == null)
            {
                throw new Exception("User not found");
            }

            var correct =
                BCrypt.Net.BCrypt.Verify(
                    request.CurrentPassword,
                    user.PasswordHash
                );

            if (!correct)
            {
                throw new Exception(
                    "Current password incorrect"
                );
            }

            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    request.NewPassword
                );

            await _userRepository.SaveChangesAsync();
        }

        public async Task<LoginResult> RefreshTokenAsync(
            string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                throw new Exception("Refresh token is required");
            }

            // -------------------------------------------------
            // Get only a valid refresh token
            // Repository checks:
            // 1. Token matches
            // 2. Token is not revoked
            // 3. Token is not expired
            // -------------------------------------------------

            var oldRefreshToken =
                await _refreshTokenRepository
                    .GetByTokenAsync(refreshToken);

            if (oldRefreshToken == null)
            {
                throw new Exception(
                    "Invalid, expired, or revoked refresh token"
                );
            }

            var user = oldRefreshToken.User;

            if (user == null)
            {
                throw new Exception("User not found");
            }

            if (!user.IsActive)
            {
                throw new Exception(
                    "User account is inactive"
                );
            }

            // -------------------------------------------------
            // Revoke old refresh token
            // -------------------------------------------------

            await _refreshTokenRepository
                .RevokeAsync(oldRefreshToken);

            // -------------------------------------------------
            // Generate new access token
            // -------------------------------------------------

            var newAccessToken =
                _tokenService.GenerateToken(
                    user.Id,
                    user.Email,
                    user.Role.Name
                );

            // -------------------------------------------------
            // Generate new refresh token
            // -------------------------------------------------

            var newRefreshToken =
                _tokenService.GenerateRefreshToken();

            var newRefreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = newRefreshToken,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow
            };

            await _refreshTokenRepository
                .AddAsync(newRefreshTokenEntity);

            await _refreshTokenRepository.SaveAsync();

            return new LoginResult
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken,
                UserName = user.UserName,
                Role = user.Role.Name
            };
        }

        public async Task<List<string>> GetUserPermissionsAsync(
            Guid userId)
        {
            return await _userRepository
                .GetPermissionsAsync(userId);
        }
    }
}