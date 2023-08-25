

param (
    [string]$ServerUrl
)


$distManifestPath = "./dist/manifest.xml"

# Build dist folder for add-in
Invoke-Command { npm run build }

# Update manifest.xml in the dist to replace all dev urls with prod urls
(Get-Content $distManifestPath) -replace 'https://localhost:3000', $ServerUrl | Set-Content $distManifestPath


# Copy registry file and auxiliary scripts to dist folder
Copy-Item -Path "./export/install.ps1" -Destination "./dist"
# Copy-Item -Path "./export/update.ps1" -Destination "./dist" # TODO
Copy-Item -Path "./export/template.reg" -Destination "./dist"


Remove-Item -Path "./docs"
Rename-Item -Path "./dist" -NewName "./docs"
