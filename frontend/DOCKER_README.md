# Frontend Docker Build

## 🐳 בנייה והרצה

### Build
```bash
docker build -t agentdesk-frontend:latest .
```

### Run
```bash
docker run -p 3000:3000 agentdesk-frontend:latest
```

### תכונות
- ✅ Multi-stage build (deps → builder → production)
- ✅ Next.js Standalone output
- ✅ Non-root user (nextjs)
- ✅ Health check אוטומטי
- ✅ Production-optimized

### גודל
~200-300MB

### Port
3000

### שים לב
Environment variables מסוג `NEXT_PUBLIC_*` צריכים להיות מוגדרים בזמן BUILD:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api \
  -t agentdesk-frontend:latest .
```

---

למידע מלא ראה: [DOCKER_DEPLOYMENT.md](../DOCKER_DEPLOYMENT.md)

