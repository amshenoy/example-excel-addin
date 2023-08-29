# Set-ExecutionPolicy Unrestricted
# ./install.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin" -PluginsPath "C://excel-plugins-js"

 
param (
    [string]$ServerUrl,
    [string]$PluginsPath
)

$addinFolderName = ''
$addinFolderPath = $PluginsPath + '/' + $addinFolderName
Write-Host "Plugin Folder: " $addinFolderPath

$manifestUrl = $ServerUrl + '/manifest.xml'
$manifestSavePath = $addinFolderPath + '/manifest.xml'
Invoke-WebRequest -Uri $manifestUrl -OutFile $manifestSavePath
