# Set-ExecutionPolicy Unrestricted
# ./install.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin" -PluginsPath "C://excel-plugins-js" -AddinName Streamer
 
param (
    [string]$ServerUrl,
    [string]$PluginsPath,
    [string]$AddinName
)

$manifestUrl = $ServerUrl + '/manifest.xml'
$manifestSavePath = $PluginsPath + '/' + $AddinName + '.xml'
Invoke-WebRequest -Uri $manifestUrl -OutFile $manifestSavePath

Write-Host "Plugin installed: " $manifestSavePath
