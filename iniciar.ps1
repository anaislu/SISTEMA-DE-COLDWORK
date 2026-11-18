# Levanta COLDWORK en esta PC: backend (http://localhost:3000/api) y frontend (http://localhost:4200).
# Uso (desde la carpeta del proyecto):  powershell -ExecutionPolicy Bypass -File .\iniciar.ps1
# Requisitos: Node 24 y Git. La primera vez instala dependencias y crea backend\.env solo.

$raiz = $PSScriptRoot

foreach ($parte in 'backend', 'frontend') {
  if (-not (Test-Path "$raiz\$parte\node_modules")) {
    Write-Host "Instalando dependencias de $parte (solo la primera vez)..."
    npm.cmd --prefix "$raiz\$parte" install
  }
}

if (-not (Test-Path "$raiz\backend\.env")) {
  Copy-Item "$raiz\backend\.env.example" "$raiz\backend\.env"
  Write-Host "Creado backend\.env a partir de .env.example"
}

# Cada uno en su propia ventana; ciérrala para detenerlo.
Start-Process powershell -ArgumentList '-NoExit', '-Command', "npm.cmd --prefix '$raiz\backend' run start:dev"
Start-Process powershell -ArgumentList '-NoExit', '-Command', "npm.cmd --prefix '$raiz\frontend' start"

Write-Host ""
Write-Host "Listo. En ~30 segundos abre http://localhost:4200"
