
# ./export.ps1 -ServerUrl "https://cake.amshenoy.com/example-excel-addin"

param (
    [string]$ServerUrl
)

$distManifestPath = "./dist/manifest.xml"

# Build dist folder for add-in
Invoke-Command { npm run build }

# Update manifest.xml in the dist to replace all dev urls with prod urls
(Get-Content $distManifestPath) -replace 'https://localhost:3000', $ServerUrl | Set-Content $distManifestPath


# Copy auxiliary files to dist folder
Copy-Item -Path "./export/*" -Destination "./dist" -Recurse

Remove-Item -Path "./docs" -Recurse
Rename-Item -Path "./dist" -NewName "./docs"
