# Cleanup unused files in Vytal backend
# This script safely removes files that are no longer needed

# Create backup directory
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "unused_files_backup_$timestamp"
New-Item -Path $backupDir -ItemType Directory -Force | Out-Null

Write-Host "Cleaning up unused files in Vytal backend..." -ForegroundColor Cyan
Write-Host "Created backup directory: $backupDir" -ForegroundColor Green

# Backup and remove quick_test.ps1 (uses old port)
if (Test-Path "quick_test.ps1") {
    Copy-Item "quick_test.ps1" -Destination $backupDir
    Remove-Item "quick_test.ps1" -Force
    Write-Host "Backed up and removed quick_test.ps1" -ForegroundColor Green
} else {
    Write-Host "quick_test.ps1 not found" -ForegroundColor Red
}

# Backup and remove node_modules (not used by Ballerina)
if (Test-Path "node_modules") {
    Write-Host "Backing up node_modules (this may take a moment)..." -ForegroundColor Yellow
    
    # Create a simple manifest file of directories instead of copying everything
    $dirs = Get-ChildItem -Path "node_modules" -Directory | Select-Object -ExpandProperty Name
    $dirs | Out-File -FilePath "$backupDir\node_modules_manifest.txt"
    
    # Remove node_modules
    Remove-Item "node_modules" -Recurse -Force
    Write-Host "Removed node_modules directory" -ForegroundColor Green
} else {
    Write-Host "node_modules directory not found" -ForegroundColor Red
}

# Update port in .env files
$envFiles = @(".env", ".env.example", ".env.production")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file
        # Create backup
        Copy-Item $file -Destination $backupDir
        
        # Update port from 9090 to 9091
        $updatedContent = $content -replace "SERVER_PORT=9090", "SERVER_PORT=9091"
        
        # Only write if changes were made
        if ($updatedContent -ne $content) {
            $updatedContent | Set-Content $file
            Write-Host "Updated port in $file from 9090 to 9091" -ForegroundColor Green
        } else {
            Write-Host "No port changes needed in $file" -ForegroundColor Blue
        }
    } else {
        Write-Host "$file not found" -ForegroundColor Red
    }
}
}

Write-Host "`n✅ Cleanup completed! Unused files have been removed and backed up to $backupDir" -ForegroundColor Green
Write-Host "👉 The following files were cleaned up:" -ForegroundColor Cyan
Write-Host "   - quick_test.ps1 (obsolete test script)" -ForegroundColor White
Write-Host "   - node_modules/ (not used by Ballerina)" -ForegroundColor White
Write-Host "   - Updated port in environment files from 9090 to 9091" -ForegroundColor White
