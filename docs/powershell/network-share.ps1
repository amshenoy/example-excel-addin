
# Only run this script once (to create Excel plugins folder)
# ./network-share.ps1 -ShareName ExcelAddins -PluginsPath C:\ExcelAddins

# # Define the share name and folder path
# $ShareName = "SharedFolder"
# $PluginsPath = "C:\Path\To\Shared\Folder"

param (
    [Parameter(Mandatory)][string]$ShareName,
    [Parameter(Mandatory)][string]$PluginsPath
)

# Create the shared folder if it doesn't exist
if (-not (Test-Path -Path $PluginsPath -PathType Container)) {
    New-Item -Path $PluginsPath -ItemType Directory
}

Write-Host "Creating Network Share"

# Add share permissions
net share $ShareName=$PluginsPath /grant:Everyone,Full

if (net share | Select-String -Pattern $ShareName) {
    Write-Host "Shared folder '$ShareName' created successfully."
} else {
    Write-Host "Failed to create shared folder '$ShareName'. Please try again as admin..."
    exit
}

# To delete a network share
# net share $ShareName \delete

# Print network path
$computerName = $env:COMPUTERNAME
$networkPath = "\\$computerName\$ShareName"
Write-Host ""
Write-Host "Shared Folder: $PluginsPath"
Write-Host "Network Path to Shared Folder: $networkPath"
Write-Host ""

$guid = [guid]::NewGuid().ToString()
$networkPathReg = "\\\\$computerName\\$ShareName"

$regContent = @"
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{$guid}]
"Id"="{$guid}"
"Url"="{$networkPathReg}"
"Flags"=dword:00000001
"@

$regSavePath = "./trusted-catalog.reg"
$regContent | Set-Content -Path $regSavePath

Invoke-Command { reg import $regSavePath }

# Copy the trusted catalog reg file to the network folder
Copy-Item -Path $regSavePath -Destination $PluginsPath
Remove-Item -Path $regSavePath

Write-Host ""
Write-Host "Created trusted catalog for the network share"
Write-Host ""

Write-Host "Now go to the corresponding Office app and add the network share to the trusted catalog:"
Write-Host "https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins#specify-the-shared-folder-as-a-trusted-catalog"
Write-Host ""

Set-Clipboard -Value $networkPath
Write-Host "Network path '$networkPath' has been copied to clipboard"
