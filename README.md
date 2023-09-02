
# Development Setup

### Install the Yeoman CLI

```
npm install -g yo generator-office
```

### Create the add-in project
```ps1
yo office
cd "My Office Add-in"
```


### Sideloading for development testing
When running the first time, use the following to install ssl certificates:
```ps1
npm run dev-server
```


</br><hr></br>


# Publish Add-In
> Make Add-in publicly available

### 1) Run `build.ps1` for creating `docs` folder

`./build.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin"`

### 2) Commit and Push plugin repo to Github `https://github.com/amshenoy/example-excel-addin`

### 3) Set GHPages to use `docs` folder (static-hosting) 


</br><hr></br>


# Add-In Installation
> Simplified process using Powershell scripts

### 1) Setup Trusted Catalog once (if non-existent)

Only one catalog is needed for all Office addins regardles of the app type.
Therefore probably better to name the folder and share as `OfficeAddins`.

```ps1
./network-share.ps1 -ShareName ExcelAddins -PluginsPath C:\ExcelAddins
```

OR

```ps1
# User Specific
$shareName = "ExcelAddins"
$installPath = "C:\ExcelAddins"

# Add-in Agnostic
$serverUrl = "https://amshenoy.github.io/example-excel-addin"
$scriptParams = @{ShareName = $shareName; PluginsPath = $installPath}
$scriptContent = [System.Text.Encoding]::UTF8.GetString((Invoke-WebRequest -Uri ($serverUrl + "/powershell/network-share.ps1")).Content)
& ([Scriptblock]::Create($scriptContent)) @scriptParams
```

</br>

### 2) Run install script for add-in

### `install.ps1`
- Downloads the manifest from server
- Moves the manifest with a specific addin name to the plugins folder

The above could be done manually but a script is always neater.

</br>

```ps1
./install.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin" -PluginsPath "C:\ExcelAddins" -AddinName "ExampleExcelAddin"
```

OR
```ps1
# User Specific
$installPath = "C:\ExcelAddins"

# Add-in Specific
$addinName = "ExampleExcelAddin"
$serverUrl = "https://amshenoy.github.io/example-excel-addin"
                                
# Add-in Agnostic
$scriptParams = @{ServerUrl = $serverUrl; PluginsPath = $installPath; AddinName = $addinName}
$scriptContent = [System.Text.Encoding]::UTF8.GetString((Invoke-WebRequest -Uri ($serverUrl + "/powershell/install.ps1")).Content)
& ([Scriptblock]::Create($scriptContent)) @scriptParams
```



<hr>
