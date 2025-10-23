# 🧪 בדיקת Chat API - האם הבוט מחפש בבסיס הידע?

# החלף את הערכים האלה:
$BOT_ID = "ce75ab41-4031-430f-ab96-62851fea815b"  # מה-screenshot שלך
$API_TOKEN = "bot_YOUR_TOKEN_HERE"  # תחליף עם ה-API token של הבוט מטבלת bots
$SESSION_ID = "test-session-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host "🚀 שולח שאלה לבוט..." -ForegroundColor Green
Write-Host "Bot ID: $BOT_ID"
Write-Host "Session: $SESSION_ID"
Write-Host ""

$body = @{
    sessionId = $SESSION_ID
    message = "מהי פסקת הפתיחה באתר example.com?"
    visitorMetadata = @{
        userAgent = "Test"
        ip = "127.0.0.1"
    }
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "X-Bot-Token" = $API_TOKEN
}

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3001/api/chat/message" `
        -Method Post `
        -Headers $headers `
        -Body $body

    Write-Host "✅ תשובה מהבוט:" -ForegroundColor Green
    Write-Host $response.response
    Write-Host ""
    Write-Host "📊 Context Used:" -ForegroundColor Cyan
    if ($response.contextUsed) {
        Write-Host "  נמצאו $($response.contextUsed.length) chunks בבסיס הידע"
    } else {
        Write-Host "  ⚠️  לא נמצא context!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ שגיאה: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "וודא ש:" -ForegroundColor Yellow
    Write-Host "  1. הבעקאנד רץ על port 3001"
    Write-Host "  2. ה-API_TOKEN נכון (בדוק בטבלת bots)"
    Write-Host "  3. ה-BOT_ID נכון"
}

Write-Host ""
Write-Host "✅ עכשיו בדוק את הטרמינל של הבעקאנד!" -ForegroundColor Green
Write-Host "צריך לראות:" -ForegroundColor Cyan
Write-Host "  📚 Retrieved X context chunks..."

