# Install or update the Theodo Blueprints CLI (Windows)
#
# Usage:
#   irm https://raw.githubusercontent.com/adechassey/blueprints/main/install.ps1 | iex
#
$ErrorActionPreference = "Stop"

$Repo = "adechassey/blueprints"
$BinaryName = "theodo-blueprints"
$InstallDir = "$env:LOCALAPPDATA\theodo-blueprints"
$AssetName = "theodo-blueprints-win-x64.zip"

# Get latest release tag
$Release = Invoke-RestMethod "https://api.github.com/repos/$Repo/releases/latest"
$Tag = $Release.tag_name
$Asset = $Release.assets | Where-Object { $_.name -eq $AssetName }

if (-not $Asset) {
    Write-Error "Could not find $AssetName in release $Tag"
    exit 1
}

Write-Host "Installing $BinaryName $Tag (win-x64)..."

# Download and extract
$TmpDir = Join-Path $env:TEMP "theodo-blueprints-install"
if (Test-Path $TmpDir) { Remove-Item $TmpDir -Recurse -Force }
New-Item -ItemType Directory -Path $TmpDir | Out-Null

$ZipPath = Join-Path $TmpDir $AssetName
Invoke-WebRequest -Uri $Asset.browser_download_url -OutFile $ZipPath
Expand-Archive -Path $ZipPath -DestinationPath $TmpDir -Force

# Install
if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
}
Copy-Item (Join-Path $TmpDir "$BinaryName.cjs") (Join-Path $InstallDir "$BinaryName.cjs") -Force

# Create a .cmd launcher
$CmdPath = Join-Path $InstallDir "$BinaryName.cmd"
Set-Content $CmdPath "@echo off`r`nnode `"%~dp0$BinaryName.cjs`" %*"

# Add to PATH if not already there
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($UserPath -notlike "*$InstallDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$UserPath;$InstallDir", "User")
    Write-Host "Added $InstallDir to your PATH (restart your terminal to use it)"
}

# Cleanup
Remove-Item $TmpDir -Recurse -Force

Write-Host "Installed $BinaryName to $InstallDir"
Write-Host "Run '$BinaryName --help' to get started."
