
# Tutorial

## Install the Yeoman CLI

`npm install -g yo generator-office`

## Create the add-in project
`yo office`
`cd "My Office Add-in"`


## Sideloading for development testing
When running the first time, use the following to install ssl certificates:
`npm run dev-server`


</br><hr></br>


# Publish Plugin
> Make Add-in publicly available

### 1) Run `build.ps1` for creating `docs` folder

`./build.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin"`

### 2) Commit and Push plugin repo to Github `https://github.com/amshenoy/example-excel-addin`

### 3) Set GHPages to use `docs` folder (static-hosting) 


</br><hr></br>


# Plugin Installation
> Simplified process using Powershell scripts

### 1) Setup Trusted Catalog

Run `https://amshenoy.github.io/example-excel-addin/powershell/network-share.ps1`



### 2) Run install script `https://amshenoy.github.io/example-excel-addin/powershell/install.ps1`:

`./install.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin" -PluginPath "C:/ExcelPlugins"`

Or something like this:
`Invoke-Expression (Invoke-WebRequest -Uri "https://amshenoy.github.io/example-addin/install.ps1").Content`

Alternative:
```ps1
$url = "https://example.com/path/to/your/script.ps1"
$tempFilePath = [System.IO.Path]::GetTempFileName() + ".ps1"

Invoke-WebRequest -Uri $url -OutFile $tempFilePath
Invoke-Expression (Get-Content -Path $tempFilePath -Raw)
Remove-Item -Path $tempFilePath -Force
```


### `install.ps1`
- Takes the static root URL
- Downloads the manifest
- Moves the manifest to a specified plugins folder


<hr>
