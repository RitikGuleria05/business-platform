
$ErrorActionPreference = "Stop"

# Project and backup paths
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackupDirectory = Join-Path $ProjectRoot "backups"
$LogFile = Join-Path $BackupDirectory "backup.log"

# Generate a unique backup filename
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFile = Join-Path $BackupDirectory "BusinessPlatformDb_$Timestamp.sql"

# Temporary file inside the MySQL container
$ContainerBackupPath = "/tmp/BusinessPlatformDb_backup.sql"

New-Item -ItemType Directory -Force -Path $BackupDirectory | Out-Null

Push-Location $ProjectRoot

try {
    Add-Content $LogFile "$(Get-Date): Starting database backup"

    # Generate backup inside MySQL container
    docker compose exec -T mysql sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers --events BusinessPlatformDb > /tmp/BusinessPlatformDb_backup.sql && test -s /tmp/BusinessPlatformDb_backup.sql'

    if ($LASTEXITCODE -ne 0) {
        throw "MySQL backup generation failed."
    }

    # Copy backup from container to Windows
    docker compose cp "mysql:$ContainerBackupPath" "$BackupFile"

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to copy backup to Windows."
    }

    # Verify backup file
    if (!(Test-Path $BackupFile)) {
        throw "Backup file was not created."
    }

    $FileInfo = Get-Item $BackupFile

    if ($FileInfo.Length -eq 0) {
        throw "Backup file is empty."
    }

    # Remove temporary file from container
    docker compose exec -T mysql rm -f $ContainerBackupPath

    # Delete backups older than 14 days
    $CutoffDate = (Get-Date).AddDays(-14)

    Get-ChildItem $BackupDirectory -Filter "BusinessPlatformDb_*.sql" -File |
        Where-Object { $_.LastWriteTime -lt $CutoffDate } |
        Remove-Item -Force

    Add-Content $LogFile "$(Get-Date): SUCCESS - $BackupFile ($($FileInfo.Length) bytes)"
    Write-Host "Backup completed successfully: $BackupFile" -ForegroundColor Green
}
catch {
    Add-Content $LogFile "$(Get-Date): FAILED - $($_.Exception.Message)"
    Write-Error $_
    exit 1
}
finally {
    Pop-Location
}
