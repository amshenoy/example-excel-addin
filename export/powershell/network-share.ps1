
# Only run this script once (to create Excel plugins folder)
# ./network-share.ps1 -ShareName ExcelPlugins -PluginsPath C:/ExcelPlugins

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

# Create the network share
$shareParams = @{
    Name = $ShareName
    Path = $PluginsPath
    Description = "Shared folder for network access"
    FullAccess = "Everyone"
}

New-SmbShare @shareParams

Write-Host "Creating Network Share"

# Add share permissions
$ace = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
$securityDescriptor = Get-SmbShareAccessControl $ShareName
$securityDescriptor.AddAccessRule($ace)
Set-SmbShare -Name $ShareName -FolderSecurity $securityDescriptor

# Print network path
$computerName = $env:COMPUTERNAME
$networkPath = "\\$computerName\$ShareName"
Write-Host "Shared Folder: $PluginsPath"
Write-Host "Network Path to Shared Folder: $networkPath"


Write-Host ""

##########################################################
# Now go to Excel and add network share to trusted catalog
# https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins#specify-the-shared-folder-as-a-trusted-catalog
##########################################################

Write-Host "Setup Trusted Catalog for Office App"
Write-Host "https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins#specify-the-shared-folder-as-a-trusted-catalog"


# $regTemplatePath = "./reg/TrustNetworkShareCatalogTemplate.reg"
$regSavePath = "./trusted-catalog.reg"

$guid = [guid]::NewGuid().ToString()
$networkPathReg = "\\\\$computerName\\$ShareName"

# Invoke-WebRequest -Uri $regTemplateUrl -OutFile $regSavePath
# Copy-Item -Path $regTemplatePath -Destination $regSavePath

# ./reg/TrustNetworkShareCatalogTemplate.reg
$regContent = @"
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs\{[GUID]}]
"Id"="{[GUID]}"
"Url"="{[NETWORK_SHARE]}"
"Flags"=dword:00000001
"@

$regContent | Set-Content -Path $regSavePath

(Get-Content $regSavePath) -replace '[GUID]', $guid | Set-Content $regSavePath
(Get-Content $regSavePath) -replace '[NETWORK_SHARE]', $networkPathReg | Set-Content $regSavePath

Invoke-Command { reg import $regSavePath }

# Copy the trusted catalog reg file to the network folder
Copy-Item -Path $regSavePath -Destination $PluginsPath
Remove-Item -Path $regSavePath
