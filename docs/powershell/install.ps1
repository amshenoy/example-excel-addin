# Set-ExecutionPolicy Unrestricted
# ./install.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin" -PluginsPath "C:\ExcelAddins" -AddinName "ExampleExcelAddin"

# Note: This is a generic install script and will work for any valid plugin host server
# We could make this specific to our plugin by setting a constant ServerUrl and AddinName
# but then this repo would not really work as a template without having to modify each and every script

param (
    [Parameter(Mandatory)][string]$ServerUrl,
    [Parameter(Mandatory)][string]$PluginsPath,
    [Parameter(Mandatory)][string]$AddinName
)

$manifestUrl = $ServerUrl + '/manifest.xml'
$manifestSavePath = $PluginsPath + '/' + $AddinName + '.xml'
Invoke-WebRequest -Uri $manifestUrl -OutFile $manifestSavePath

Write-Host "Plugin installed: " $manifestSavePath
