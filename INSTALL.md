
# Tutorial

## Install the Yeoman CLI

`npm install -g yo generator-office`

## Create the add-in project
`yo office`
`cd "My Office Add-in"`

When running the first time, use the following to install ssl certificates:
`npm run dev-server`


<hr>

# Installation

This whole process was found by analysing the codebase for the cli scripts:
https://github.com/OfficeDev/Office-Addin-Scripts

## To build the plugin:

`npm run build`

This will create / update the `dist` folder which has the static files for your add-in.
This needs to be static hosted somewhere for the add-in to download these source files.

## To install the plugin on Win64:

Create your `manifest.xml` in your add-in project setting the `AddinId` to a unique Guid.
Modify `example.reg` updating the `AddinId` usages and the `manifest.xml` filepath.
Go to regedit `Computer\HKEY_CURRENT_USER\Software\Microsoft\Office\16.0\WEF\Developer` and import `example.reg`

## To test the plugin:

Either run `npm run dev-server` to server the static add-in files or make sure the manifest used the hosted URLs.
Now open Excel, go to `Insert > My Add-Ins (down arrow)` and under `Developer Add-Ins` you should see your add-in.


### To clear cache: 
`C:\Users\abhis\AppData\Local\Microsoft\Office\16.0\Wef`



# `install.ps1`
- Takes the static root URL
- Downloads the manifest
- Moves the manifest to some general plugin folder
- Reads the manifest XML to get Add-In ID
- Updates the registry keys and values with the AddinId and the manifest filepath





<hr>


# SIMPLIFIED PROCESS USING SCRIPTS

## Run `export.ps1` for creating `dist` folder

`./export.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin"`

## Commit and Push plugin repo to Github `https://github.com/amshenoy/example-excel-addin`

## Set `dist` folder to use GHPages (static-hosting) 

## Run `https://amshenoy.github.io/example-excel-addin/install.ps1`:


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


<hr>
