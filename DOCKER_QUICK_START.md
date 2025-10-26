# 🚀 AgentDesk Docker - התחלה מהירה

המדריך המהיר ביותר להרצת AgentDesk עם Docker בפרודקשן.

---

## ⚡ התחלה ב-5 דקות

### 1️⃣ צור קובץ סביבה

```bash
cp env.production.example .env.production
nano .env.production
```

**חובה למלא (מינימום):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx...
ENCRYPTION_KEY=your-64-char-hex-key
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WIDGET_URL=http://localhost:3002
```

### 2️⃣ הרץ!

```bash
docker-compose -f docker-compose.production.yml --env-file .env.production up -d
```

### 3️⃣ בדוק

```bash
# בדוק סטטוס
docker-compose -f docker-compose.production.yml ps

# פתח בדפדפן
http://localhost:3000      # Dashboard
http://localhost:3001/api  # Backend
http://localhost:3002      # Widget
```

---

## 🛑 עצירה

```bash
docker-compose -f docker-compose.production.yml down
```

---

## 📊 ניטור

```bash
# לוגים חיים
docker-compose -f docker-compose.production.yml logs -f

# שימוש במשאבים
docker stats

# רק backend logs
docker-compose -f docker-compose.production.yml logs -f backend
```

---

## 🔄 עדכון

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```

---

## 🧹 ניקוי

```bash
# עצור והסר containers
docker-compose -f docker-compose.production.yml down

# הסר גם volumes
docker-compose -f docker-compose.production.yml down -v

# הסר גם images
docker-compose -f docker-compose.production.yml down --rmi all

# ניקוי כללי של Docker
docker system prune -a
```

---

## 🐛 פתרון בעיות מהיר

### Container לא עולה?
```bash
docker logs agentdesk-backend-prod
docker logs agentdesk-frontend-prod
docker logs agentdesk-widget-prod
```

### Port כבר בשימוש?
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### בעיות CORS?
וודא ש-`CORS_ORIGIN` ב-`.env.production` כולל את כל הדומיינים (ללא רווחים!)

### Rebuild מאפס?
```bash
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

---

## 📖 מדריך מלא

למדריך מפורט יותר, ראה [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

---

**זהו! המערכת שלך אמורה לעבוד 🎉**

