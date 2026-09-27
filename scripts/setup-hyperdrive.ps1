# Creates (or updates) the Cloudflare Hyperdrive config for EasyFrame and writes
# its id into wrangler.jsonc.
#
# Paste the Supabase URL exactly as the dashboard shows it (leave [YOUR-PASSWORD]
# in place); the password is then asked for separately with hidden input and
# percent-encoded automatically. It is kept only in memory, redacted from any
# output, and never written to disk.
#
# Run from the project folder:
#   powershell -ExecutionPolicy Bypass -File scripts/setup-hyperdrive.ps1

$name     = "easyframe-db"
$root     = Split-Path -Parent $PSScriptRoot
$wrangler = Join-Path $root "node_modules\wrangler\bin\wrangler.js"
$config   = Join-Path $root "wrangler.jsonc"

function Fail($msg) { Write-Host ""; Write-Host "x $msg" -ForegroundColor Red; exit 1 }

function Read-Hidden([string]$prompt) {
  $secure = Read-Host $prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try     { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

# Wrangler is called through node directly: going via npx.cmd would route the
# URL through cmd.exe, which mangles & ^ % characters common in passwords.
function Invoke-Wrangler([string[]]$argv) {
  $out = (& node $wrangler @argv 2>&1 | ForEach-Object { "$_" }) -join "`n"
  $out = $out -replace "\x1b\[[0-9;]*m", ""
  return @{ Text = $out; Code = $LASTEXITCODE }
}

if (-not (Test-Path $wrangler)) { Fail "wrangler is not installed. Run: npm install" }
if (-not (Test-Path $config))   { Fail "wrangler.jsonc not found in $root" }

Write-Host ""
Write-Host "EasyFrame -> Cloudflare Hyperdrive" -ForegroundColor Cyan
Write-Host "Supabase dashboard -> Connect -> Connection string -> Method: Session pooler" -ForegroundColor DarkGray
Write-Host "Paste that URL as-is. Leave [YOUR-PASSWORD] in it; you'll type the password next." -ForegroundColor Gray
$url = (Read-Host "Session pooler URL").Trim()

# Tolerate a pasted `DATABASE_URL=` prefix or surrounding quotes.
if ($url -match '^DATABASE_URL=') { $url = $url.Substring(13).Trim() }
$url = $url.Trim('"', "'")

$m = [regex]::Match($url, '^(postgres(?:ql)?)://(.+)$')
if (-not $m.Success) { Fail "That isn't a Postgres URL (it should start with postgresql://)." }
$scheme = $m.Groups[1].Value
$rest   = $m.Groups[2].Value

# Split credentials from host at the LAST '@', so a raw '@' in a password
# can't be mistaken for the host separator.
$at = $rest.LastIndexOf('@')
if ($at -lt 0) { Fail "No user found in the URL; copy the full string from Supabase." }
$userinfo = $rest.Substring(0, $at)
$hostpart = $rest.Substring($at + 1)
$colon    = $userinfo.IndexOf(':')
$user     = if ($colon -ge 0) { $userinfo.Substring(0, $colon) } else { $userinfo }
$inline   = if ($colon -ge 0) { $userinfo.Substring($colon + 1) } else { "" }

if ($hostpart -match ':6543(/|\?|$)') { Fail "That's the TRANSACTION pooler (port 6543). Choose Method: Session pooler (port 5432)." }
if ($hostpart -notmatch ':5432(/|\?|$)') { Write-Host "! Expected port 5432 (session pooler); continuing anyway." -ForegroundColor Yellow }

if (-not $inline -or $inline -match '^\[YOUR-PASSWORD\]$') {
  Write-Host ""
  Write-Host "Now type your DATABASE password (Supabase -> Project Settings -> Database)." -ForegroundColor Gray
  Write-Host "This is NOT your Supabase login or email. Input is hidden." -ForegroundColor DarkGray
  $password = Read-Hidden "Database password"
} else {
  # A password was already in the URL; undo any existing encoding first.
  $password = [Uri]::UnescapeDataString($inline)
}
if (-not $password) { Fail "No password entered." }

if ($password -match '^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$') {
  Write-Host ""
  Write-Host "! That password looks like an email address. Supabase's database password is" -ForegroundColor Yellow
  Write-Host "  a separate password you set when creating the project, not your login." -ForegroundColor Yellow
  $answer = Read-Host "  Use it anyway? (y/N)"
  if ($answer -notmatch '^[Yy]') { Fail "Cancelled. Find or reset the database password in Supabase -> Project Settings -> Database." }
}

$encoded = [Uri]::EscapeDataString($password)
$conn    = "${scheme}://${user}:${encoded}@${hostpart}"

# Hyperdrive pools connections itself, so drop PgBouncer-only query params.
$parts = $conn -split '\?', 2
if ($parts.Count -eq 2) {
  $kept = @($parts[1] -split '&' | Where-Object { $_ -and $_ -notmatch '^(pgbouncer|connection_limit)=' })
  $conn = if ($kept.Count) { $parts[0] + "?" + ($kept -join '&') } else { $parts[0] }
}

try { $uri = [Uri]$conn } catch { Fail "Couldn't parse the URL; copy it again from Supabase." }

function Redact([string]$s) {
  return $s.Replace($encoded, "********").Replace($password, "********")
}

Write-Host ""
Write-Host "Target: $($uri.Host):$($uri.Port)  db=$($uri.AbsolutePath.TrimStart('/'))  user=$user" -ForegroundColor Gray

# Re-running the script updates the existing config instead of duplicating it.
$list = Invoke-Wrangler @("hyperdrive", "list")
$existing = $null
foreach ($line in ($list.Text -split "`n")) {
  if ($line -match [regex]::Escape($name)) {
    $idMatch = [regex]::Match($line, '[0-9a-f]{32}')
    if ($idMatch.Success) { $existing = $idMatch.Value; break }
  }
}

if ($existing) {
  Write-Host "Updating existing Hyperdrive '$name' ($existing); Cloudflare will test the connection..." -ForegroundColor Cyan
  $res = Invoke-Wrangler @("hyperdrive", "update", $existing, "--connection-string=$conn")
} else {
  Write-Host "Creating Hyperdrive '$name'; Cloudflare will test the connection..." -ForegroundColor Cyan
  $res = Invoke-Wrangler @("hyperdrive", "create", $name, "--connection-string=$conn")
}
$conn = $null

$text = Redact $res.Text
if ($res.Code -ne 0) {
  Write-Host $text
  Fail "Wrangler failed (see above). Most often: wrong database password, or the URL isn't the session pooler."
}

$id = $existing
if (-not $id) {
  $idMatch = [regex]::Match($text, '"id"\s*:\s*"([0-9a-f]{32})"')
  if (-not $idMatch.Success) { $idMatch = [regex]::Match($text, '\b([0-9a-f]{32})\b') }
  if (-not $idMatch.Success) { Write-Host $text; Fail "Created, but couldn't find the id in wrangler's output (see above)." }
  $id = $idMatch.Groups[1].Value
}

# Patch wrangler.jsonc (UTF-8, no BOM).
$jsonc = [IO.File]::ReadAllText($config)
if ($jsonc -match 'REPLACE_WITH_HYPERDRIVE_ID') {
  $jsonc = $jsonc.Replace('REPLACE_WITH_HYPERDRIVE_ID', $id)
} else {
  $jsonc = [regex]::Replace($jsonc, '("binding"\s*:\s*"HYPERDRIVE"\s*,\s*"id"\s*:\s*")[^"]*(")', "`${1}$id`${2}")
}
[IO.File]::WriteAllText($config, $jsonc, (New-Object Text.UTF8Encoding $false))

Write-Host ""
Write-Host "Done. Hyperdrive id: $id" -ForegroundColor Green
Write-Host "wrangler.jsonc updated. Tell Claude it's done." -ForegroundColor Green
