$base = "C:\Users\Hp\Desktop\next-js-and-shadcn-ui-admin-dashboard"

$dirs = @(
  "src\app\(main)\dashboard\(legacy)",
  "src\app\(main)\dashboard\academy",
  "src\app\(main)\dashboard\analytics",
  "src\app\(main)\dashboard\calendar",
  "src\app\(main)\dashboard\coming-soon",
  "src\app\(main)\dashboard\crm",
  "src\app\(main)\dashboard\default",
  "src\app\(main)\dashboard\finance",
  "src\app\(main)\dashboard\infrastructure",
  "src\app\(main)\dashboard\invoice",
  "src\app\(main)\dashboard\kanban",
  "src\app\(main)\dashboard\logistics",
  "src\app\(main)\dashboard\mail",
  "src\app\(main)\dashboard\productivity",
  "src\app\(main)\dashboard\roles",
  "src\app\(main)\dashboard\tasks",
  "src\app\(main)\dashboard\users",
  "src\app\(main)\dashboard\chat",
  "src\app\(main)\auth",
  "src\app\(main)\chat",
  "src\app\(main)\mail",
  "src\app\(main)\unauthorized",
  "src\stores",
  "src\scripts"
)

foreach ($dir in $dirs) {
  $fullPath = Join-Path $base $dir
  if (Test-Path $fullPath) {
    Remove-Item -Recurse -Force $fullPath
    Write-Host "DELETED dir: $dir"
  } else {
    Write-Host "NOT FOUND:   $dir"
  }
}

$files = @(
  "src\proxy.disabled.ts",
  "src\hooks\use-lg.ts",
  "src\hooks\use-mobile.ts",
  "src\app\(main)\dashboard\_components\sidebar\account-switcher.tsx",
  "src\app\(main)\dashboard\_components\sidebar\nav-documents.tsx",
  "src\app\(main)\dashboard\_components\sidebar\nav-secondary.tsx"
)

foreach ($file in $files) {
  $fullPath = Join-Path $base $file
  if (Test-Path $fullPath) {
    Remove-Item -Force $fullPath
    Write-Host "DELETED file: $file"
  } else {
    Write-Host "NOT FOUND:    $file"
  }
}
