# Set-ExecutionPolicy Unrestricted
# ./install.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin" -PluginsPath "C:\\Users\\abhis\\Documents\\excel-plugins"

 

param (
    [string]$ServerUrl,
    [string]$PluginsPath
)

 

 

$baseUrl = $ServerUrl
$pluginsSavePath = $PluginsPath

 

 

# $addinFolderPath = Join-Path -Path $pluginsSavePath -ChildPath 'temp'
# $manifestSavePath = Join-Path -Path $addinFolderPath -ChildPath 'manifest.xml'
# $regSavePath = Join-Path -Path $addinFolderPath -ChildPath 'plugin.reg'

 

 

$addinFolderPath = $pluginsSavePath + '\\temp'
$manifestSavePath = $addinFolderPath + '\\manifest.xml'
$regSavePath = $addinFolderPath + '\\plugin.reg'

$loggingPath = $pluginsSavePath + '\\OfficeAddins.log.txt'

 

Write-Host "Plugin Folder: " $addinFolderPath

 

# -------------------
# Create the addinFolder if it doesn't exist
if (-not (Test-Path -Path $addinFolderPath)) {
    New-Item -Path $addinFolderPath -ItemType Directory -Force
}
# -------------------

 

 

 

$manifestUrl = $baseUrl + '/manifest.xml'
$regUrl = $baseUrl + '/template.reg'

 

 

# -------------------

 

Invoke-WebRequest -Uri $manifestUrl -OutFile $manifestSavePath
Invoke-WebRequest -Uri $regUrl -OutFile $regSavePath

 

# (Get-Content $regSavePath) -replace '{MANIFEST_PATH}', $manifestSavePath | Set-Content $regSavePath

 

 

# -------------------

 

$xml = [xml](Get-Content $manifestSavePath)

 

$addinName = $xml.OfficeApp.DisplayName.DefaultValue
$kebabCaseAddinName = $addinName -replace '\s', '-' -replace '[^-a-z0-9]', ''
Write-Host "App Name: $kebabCaseAddinName"

 

$addinId = $xml.OfficeApp.Id
Write-Host "Add-in ID: $addinId"

 

 

# -------------------

 

 

(Get-Content $regSavePath) -replace '{ADDIN_ID}', $addinId | Set-Content $regSavePath
(Get-Content $regSavePath) -replace '{LOGGING_PATH}', $loggingPath | Set-Content $regSavePath

 

 

# -------------------

 

$newAddinFolderPath = $pluginsSavePath + '\\' + $kebabCaseAddinName
$manifestNewPath = $newAddinFolderPath + '\\manifest.xml'
Write-Host "New Manifest Path" + $manifestNewPath
Write-Host "Current Reg Save Path" + $regSavePath

 

(Get-Content $regSavePath) -replace '{MANIFEST_PATH}', $manifestNewPath | Set-Content $regSavePath

 

# -------------------

 

 

Invoke-Command { reg import $regSavePath }
Write-Host "Installed plugin"

 

 

# -------------------

 

 

# Remove-Item -Path $regSavePath

 

 

Rename-Item -Path $addinFolderPath -NewName $kebabCaseAddinName

 