
# Only run this script once (to create Excel plugins folder)

# # Define the share name and folder path
# $ShareName = "SharedFolder"
# $PluginsPath = "C:\Path\To\Shared\Folder"

param (
    [string]$ShareName,
    [string]$PluginsPath
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


##########################################################
# Now go to Excel and add network share to trusted catalog
##########################################################



$regTemplatePath = "./reg/TrustNetworkShareCatalog.reg"
$regSavePath = "./activate-catalog.reg"

$guid = [guid]::NewGuid().ToString()
$networkPathReg = "\\\\$computerName\\$ShareName"

Copy-Item -Path $regTemplatePath -Destination $regSavePath
(Get-Content $regSavePath) -replace '[GUID]', $guid | Set-Content $regSavePath
(Get-Content $regSavePath) -replace '[NETWORK_SHARE]', $networkPathReg | Set-Content $regSavePath

Invoke-Command { reg import $regSavePath }

Remove-Item -Path $regSavePath
