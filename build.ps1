
# ./build.ps1 -ServerUrl "https://amshenoy.github.io/example-excel-addin"

param (
    [Parameter(Mandatory)][string]$ServerUrl
)

$distManifestPath = "./dist/manifest.xml"

# Build dist folder for add-in
Invoke-Command { npm run build }

# Update manifest.xml in the dist to replace all dev urls with prod urls
# Or set it directly in webpack.config.js before building
(Get-Content $distManifestPath) -replace 'https://localhost:3000', $ServerUrl | Set-Content $distManifestPath


# Copy auxiliary files to dist folder
Copy-Item -Path "./export/*" -Destination "./dist" -Recurse

if (Test-Path "./docs") {
    Remove-Item -Path "./docs" -Recurse
}

Rename-Item -Path "./dist" -NewName "./docs"
