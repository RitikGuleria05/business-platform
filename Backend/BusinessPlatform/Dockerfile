
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["BusinessPlatform.sln", "./"]
COPY ["BusinessPlatform/BusinessPlatform.API.csproj", "BusinessPlatform/"]
COPY ["BusinessPlatform.Infrastructure/BusinessPlatform.Infrastructure.csproj", "BusinessPlatform.Infrastructure/"]
COPY ["BusinessPlatform.Application/BusinessPlatform.Application.csproj", "BusinessPlatform.Application/"]
COPY ["BusinessPlatform.Domain/BusinessPlatform.Domain.csproj", "BusinessPlatform.Domain/"]

# Restore dependencies
RUN dotnet restore "BusinessPlatform/BusinessPlatform.API.csproj"

# Copy source code
COPY . .

# Publish API
WORKDIR /src/BusinessPlatform
RUN dotnet publish "BusinessPlatform.API.csproj" -c Release -o /app/publish --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "BusinessPlatform.API.dll"]
