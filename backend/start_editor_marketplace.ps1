[CmdletBinding()]
param(
    [int]$Port = 8000,
    [switch]$CheckOnly
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ProjectRootSlash = $ProjectRoot.Replace('\', '/')
$ProjectRootGit = '/' + $ProjectRoot.Substring(0,1) + $ProjectRoot.Substring(2).Replace('\', '/')
$BackendRoot = $PSScriptRoot
$Python = Join-Path $BackendRoot '.venv\Scripts\python.exe'
if (-not (Test-Path $Python)) { throw "Project virtual environment missing: $Python" }

function Get-ProcessTree {
    param([int]$ProcessId)
    $seen = @{}
    $current = $ProcessId
    while ($current -and -not $seen.ContainsKey($current)) {
        $seen[$current] = $true
        $item = Get-CimInstance Win32_Process -Filter "ProcessId=$current" -ErrorAction SilentlyContinue
        if (-not $item) { break }
        $item
        $current = [int]$item.ParentProcessId
    }
}

function Test-IsEditorMarketplaceProcess {
    param([int]$ProcessId)
    foreach ($item in (Get-ProcessTree $ProcessId)) {
        if ($item.CommandLine -like "*$ProjectRoot*" -or $item.CommandLine -like "*$ProjectRootSlash*" -or $item.CommandLine -like "*$ProjectRootGit*") { return $true }
    }
    return $false
}

function Get-PortOwners {
    @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique)
}

$owners = Get-PortOwners
if ($owners.Count -gt 0) {
    foreach ($owner in $owners) {
        if (-not (Test-IsEditorMarketplaceProcess ([int]$owner))) {
            throw "Port $Port is owned by unrelated PID $owner. Refusing to stop it."
        }
    }
    if ($CheckOnly) {
        Write-Output "EditorMarketplace owns port $Port (PID $($owners -join ', '))."
        exit 0
    }
    foreach ($owner in $owners) {
        Write-Output "Stopping only the existing EditorMarketplace process PID $owner."
        Stop-Process -Id ([int]$owner) -Force
    }
    Start-Sleep -Seconds 1
}
elseif ($CheckOnly) {
    Write-Output "Port $Port is free."
    exit 0
}

if ($CheckOnly) { exit 0 }

Set-Location $BackendRoot
Write-Output "Starting EditorMarketplace from $BackendRoot on port $Port."
& $Python -m uvicorn app.main:app --host 0.0.0.0 --port $Port --log-level info
exit $LASTEXITCODE





