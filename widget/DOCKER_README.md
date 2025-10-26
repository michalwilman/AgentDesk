# Widget Docker Build

## 🐳 בנייה והרצה

### Build
```bash
docker build -t agentdesk-widget:latest .
```

### Run
```bash
docker run -p 3002:3002 agentdesk-widget:latest
```

### תכונות
- ✅ Multi-stage build (deps → builder → production)
- ✅ Next.js Standalone output (כבר מופעל)
- ✅ Non-root user (nextjs)
- ✅ Health check אוטומטי
- ✅ Production-optimized

### גודל
~200-300MB

### Port
3002

### שים לב
Environment variables מסוג `NEXT_PUBLIC_*` צריכים להיות מוגדרים בזמן BUILD:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api \
  -t agentdesk-widget:latest .
```

---

למידע מלא ראה: [DOCKER_DEPLOYMENT.md](../DOCKER_DEPLOYMENT.md)

