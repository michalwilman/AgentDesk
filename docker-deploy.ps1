# AgentDesk Docker Deployment Script (PowerShell)
# Usage: .\docker-deploy.ps1 [start|stop|restart|logs|status|build]

param(
    [Parameter(Position=0)]
    [ValidateSet('start', 'stop', 'restart', 'rebuild', 'logs', 'status', 'build', 'clean', 'help')]
    [string]$Command = 'help'
)

# Configuration
$ComposeFile = "docker-compose.production.yml"
$EnvFile = ".env.production"

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

# Check if .env.production exists
function Test-EnvFile {
    if (-not (Test-Path $EnvFile)) {
        Write-Error "Error: $EnvFile not found!"
        Write-Warning "Please create it from env.production.example:"
        Write-Host "  cp env.production.example .env.production"
        Write-Host "  notepad .env.production"
        exit 1
    }
}

# Start services
function Start-Services {
    Write-Success "🚀 Starting AgentDesk services..."
    Test-EnvFile
    docker-compose -f $ComposeFile --env-file $EnvFile up -d
    Write-Success "✅ Services started!"
    Write-Warning "Access the services at:"
    Write-Host "  Frontend: http://localhost:3000"
    Write-Host "  Backend:  http://localhost:3001/api"
    Write-Host "  Widget:   http://localhost:3002"
}

# Stop services
function Stop-Services {
    Write-Warning "🛑 Stopping AgentDesk services..."
    docker-compose -f $ComposeFile down
    Write-Success "✅ Services stopped!"
}

# Restart services
function Restart-Services {
    Write-Warning "🔄 Restarting AgentDesk services..."
    Stop-Services
    Start-Services
}

# Show logs
function Show-Logs {
    Write-Success "📊 Showing logs (Ctrl+C to exit)..."
    docker-compose -f $ComposeFile logs -f
}

# Show status
function Show-Status {
    Write-Success "📈 Services status:"
    docker-compose -f $ComposeFile ps
}

# Build images
function Build-Images {
    Write-Success "🔨 Building images..."
    Test-EnvFile
    docker-compose -f $ComposeFile --env-file $EnvFile build --parallel
    Write-Success "✅ Build complete!"
}

# Rebuild and restart
function Rebuild-Services {
    Write-Success "🔨 Rebuilding and restarting..."
    Test-EnvFile
    docker-compose -f $ComposeFile --env-file $EnvFile up -d --build
    Write-Success "✅ Rebuild complete!"
}

# Clean up
function Remove-All {
    Write-Warning "🧹 Cleaning up Docker resources..."
    $confirmation = Read-Host "This will remove containers, networks, and images. Continue? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        docker-compose -f $ComposeFile down --rmi all -v
        Write-Success "✅ Cleanup complete!"
    } else {
        Write-Warning "Cleanup cancelled."
    }
}

# Show help
function Show-Help {
    Write-Host "AgentDesk Docker Deployment Script (PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\docker-deploy.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start      Start all services"
    Write-Host "  stop       Stop all services"
    Write-Host "  restart    Restart all services"
    Write-Host "  rebuild    Rebuild and restart all services"
    Write-Host "  logs       Show logs (follow mode)"
    Write-Host "  status     Show services status"
    Write-Host "  build      Build images"
    Write-Host "  clean      Remove containers, images, and volumes"
    Write-Host "  help       Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker-deploy.ps1 start"
    Write-Host "  .\docker-deploy.ps1 logs"
    Write-Host "  .\docker-deploy.ps1 rebuild"
}

# Main script
switch ($Command) {
    'start'   { Start-Services }
    'stop'    { Stop-Services }
    'restart' { Restart-Services }
    'rebuild' { Rebuild-Services }
    'logs'    { Show-Logs }
    'status'  { Show-Status }
    'build'   { Build-Images }
    'clean'   { Remove-All }
    'help'    { Show-Help }
    default   { Show-Help }
}

