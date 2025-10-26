# Backend Docker Build

## 🐳 בנייה והרצה

### Build
```bash
docker build -t agentdesk-backend:latest .
```

### Run
```bash
docker run -p 3001:3001 \
  -e SUPABASE_URL="https://xxx.supabase.co" \
  -e SUPABASE_ANON_KEY="eyJ..." \
  -e SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  -e OPENAI_API_KEY="sk-..." \
  -e CORS_ORIGIN="http://localhost:3000,http://localhost:3002" \
  -e ENCRYPTION_KEY="your-64-char-hex-key" \
  agentdesk-backend:latest
```

### תכונות
- ✅ Multi-stage build
- ✅ Puppeteer + Chromium מובנה
- ✅ Health check אוטומטי
- ✅ Production-optimized

### גודל
~400-500MB (כולל Chromium)

### Port
3001

---

למידע מלא ראה: [DOCKER_DEPLOYMENT.md](../DOCKER_DEPLOYMENT.md)

