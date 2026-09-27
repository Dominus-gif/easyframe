# Uploads EasyFrame's production secrets to the Cloudflare Worker in one batch.
#
# Values are prompted for (sensitive ones hidden), held only in memory, and
# piped straight to `wrangler secret bulk`. Nothing is written to disk.
# Leave a prompt blank to skip it (an existing secret is left untouched).
#
# Run from the project folder:
#   powershell -ExecutionPolicy Bypass -File scripts/setup-secrets.ps1

$root     = Split-Path -Parent $PSScriptRoot
$wrangler = Join-Path $root "node_modules\wrangler\bin\wrangler.js"
if (-not (Test-Path $wrangler)) { Write-Host "x wrangler is not installed. Run: npm install" -ForegroundColor Red; exit 1 }

function Read-Hidden([string]$prompt) {
  $secure = Read-Host $prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try     { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr).Trim() }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

# name, hidden?, hint
$fields = @(
  @("DODO_API_KEY",               $true,  "Dodo dashboard -> Developer -> API keys (use the LIVE key)"),
  @("DODO_WEBHOOK_SECRET",        $true,  "Dodo dashboard -> Developer -> Webhooks -> your endpoint's signing secret"),
  @("DODO_ENVIRONMENT",           $false, "live or test"),
  @("DODO_MONTHLY_PRODUCT_ID",    $false, "Dodo product id for the monthly plan"),
  @("DODO_YEARLY_PRODUCT_ID",     $false, "Dodo product id for the yearly plan (blank if none)"),
  @("DODO_LIFETIME_PRODUCT_ID",   $false, "Dodo product id for the lifetime plan"),
  @("DODO_MONTHLY_CHECKOUT_URL",  $false, "Dodo checkout link for the monthly plan"),
  @("DODO_LIFETIME_CHECKOUT_URL", $false, "Dodo checkout link for the lifetime plan")
)

Write-Host ""
Write-Host "EasyFrame -> Cloudflare Worker secrets" -ForegroundColor Cyan
Write-Host "Copy each value from Vercel (Settings -> Environment Variables) or the source shown." -ForegroundColor Gray
Write-Host "Hidden prompts show nothing while you paste. Blank = skip." -ForegroundColor DarkGray

$secrets = [ordered]@{}
foreach ($f in $fields) {
  $name, $hidden, $hint = $f
  Write-Host ""
  Write-Host "$name" -ForegroundColor White -NoNewline
  Write-Host "  ($hint)" -ForegroundColor DarkGray
  $value = if ($hidden) { Read-Hidden "  value" } else { (Read-Host "  value").Trim() }
  $value = $value.Trim('"', "'")

  if ($name -eq "DODO_ENVIRONMENT" -and $value -and $value -notin @("live", "test")) {
    Write-Host "  ! expected 'live' or 'test'; using '$value' anyway" -ForegroundColor Yellow
  }
  if ($value) { $secrets[$name] = $value } else { Write-Host "  skipped" -ForegroundColor DarkGray }
}

if ($secrets.Count -eq 0) { Write-Host ""; Write-Host "Nothing to upload." -ForegroundColor Yellow; exit 0 }

Write-Host ""
Write-Host "Uploading $($secrets.Count) secret(s): $($secrets.Keys -join ', ')" -ForegroundColor Cyan

# Pipe JSON via stdin (UTF-8, no BOM) so values never touch disk or a command line.
$OutputEncoding = New-Object Text.UTF8Encoding $false
$json = $secrets | ConvertTo-Json -Compress
$out = ($json | & node $wrangler secret bulk 2>&1 | ForEach-Object { "$_" }) -join "`n"
$code = $LASTEXITCODE
$json = $null; $secrets = $null

# Wrangler never echoes secret values, but strip ANSI noise for readability.
$out = $out -replace "\x1b\[[0-9;]*m", ""
$out -split "`n" | Where-Object { $_ -match "Success|Finished|uploaded|rror|fail" } | ForEach-Object { Write-Host "  $_" }

if ($code -ne 0) { Write-Host ""; Write-Host "x Upload failed (see above)." -ForegroundColor Red; exit 1 }
Write-Host ""
Write-Host "Done. Secrets are live on the Worker. Tell Claude it's done." -ForegroundColor Green
