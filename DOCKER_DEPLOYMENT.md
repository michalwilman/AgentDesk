# 🐳 AgentDesk Docker Deployment Guide

מדריך מפורט להפעלה והטמעת AgentDesk עם Docker.

---

## 📋 תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [דרישות מקדימות](#דרישות-מקדימות)
3. [מבנה הקבצים](#מבנה-הקבצים)
4. [בנייה מקומית](#בנייה-מקומית)
5. [הרצה בפרודקשן](#הרצה-בפרודקשן)
6. [Deployment לענן](#deployment-לענן)
7. [פתרון בעיות](#פתרון-בעיות)

---

## 🎯 סקירה כללית

הפרויקט כולל 3 Dockerfiles נפרדים:
- **backend/Dockerfile** - NestJS API עם Puppeteer
- **frontend/Dockerfile** - Next.js Dashboard
- **widget/Dockerfile** - Next.js Widget

כולם משתמשים ב-**multi-stage builds** לאופטימיזציה מקסימלית.

---

## 📦 דרישות מקדימות

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM לפחות
- חשבון Supabase (production)
- OpenAI API Key (production)

---

## 📁 מבנה הקבצים

```
AgentDesk/
├── backend/
│   ├── Dockerfile              # ✅ נוצר
│   └── .dockerignore           # ✅ נוצר
├── frontend/
│   ├── Dockerfile              # ✅ נוצר
│   ├── .dockerignore           # ✅ נוצר
│   └── next.config.js          # ✅ עודכן (standalone mode)
├── widget/
│   ├── Dockerfile              # ✅ נוצר
│   └── .dockerignore           # ✅ נוצר
├── docker-compose.yml          # Development (PostgreSQL + Redis)
├── docker-compose.production.yml  # ✅ נוצר - Production
└── env.production.example      # ✅ נוצר - תבנית
```

---

## 🔨 בנייה מקומית

### 1. בניית Image בודד

```bash
# Backend
cd backend
docker build -t agentdesk-backend:latest .

# Frontend
cd ../frontend
docker build -t agentdesk-frontend:latest .

# Widget
cd ../widget
docker build -t agentdesk-widget:latest .
```

### 2. הרצת Container בודד (לבדיקות)

```bash
# Backend (צריך env vars)
docker run -p 3001:3001 \
  -e SUPABASE_URL="https://xxx.supabase.co" \
  -e SUPABASE_ANON_KEY="eyJ..." \
  -e SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  -e OPENAI_API_KEY="sk-..." \
  -e CORS_ORIGIN="http://localhost:3000,http://localhost:3002" \
  -e ENCRYPTION_KEY="your-64-char-hex-key" \
  agentdesk-backend:latest

# Frontend
docker run -p 3000:3000 agentdesk-frontend:latest

# Widget
docker run -p 3002:3002 agentdesk-widget:latest
```

### 3. בדיקת Image Size

```bash
docker images | grep agentdesk

# Expected sizes (approximate):
# backend:  ~400-500MB
# frontend: ~200-300MB
# widget:   ~200-300MB
```

---

## 🚀 הרצה בפרודקשן

### שלב 1: הכנת קובץ Environment

```bash
# העתיקי את התבנית
cp env.production.example .env.production

# ערכי אותו עם הערכים האמיתיים שלך
nano .env.production
```

**חובה למלא:**
- ✅ `SUPABASE_URL` - פרויקט production שלך
- ✅ `SUPABASE_ANON_KEY` - מפרויקט production
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - מפרויקט production
- ✅ `OPENAI_API_KEY` - מפתח production (לא dev!)
- ✅ `ENCRYPTION_KEY` - צרי חדש! `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- ✅ `CORS_ORIGIN` - הדומיינים שלך בפרודקשן
- ✅ כל ה-`NEXT_PUBLIC_*` URLs

### שלב 2: בנייה והרצה

```bash
# בנייה של כל השירותים
docker-compose -f docker-compose.production.yml --env-file .env.production build

# הרצה ב-detached mode
docker-compose -f docker-compose.production.yml --env-file .env.production up -d

# בדיקת סטטוס
docker-compose -f docker-compose.production.yml ps

# צפייה ב-logs
docker-compose -f docker-compose.production.yml logs -f
```

### שלב 3: בדיקה

```bash
# בדוק שכל השירותים עובדים
curl http://localhost:3001/api        # Backend
curl http://localhost:3000            # Frontend
curl http://localhost:3002            # Widget

# בדוק health checks
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### שלב 4: עצירה ומחיקה

```bash
# עצירה
docker-compose -f docker-compose.production.yml down

# עצירה + מחיקת volumes
docker-compose -f docker-compose.production.yml down -v

# עצירה + מחיקת images
docker-compose -f docker-compose.production.yml down --rmi all
```

---

## ☁️ Deployment לענן

### אופציה 1: Render.com (מומלץ)

**Backend:**
1. צור Web Service ב-Render
2. חבר את GitHub repo
3. Root Directory: `backend`
4. Render יזהה את ה-Dockerfile אוטומטית!
5. הגדר Environment Variables מתוך `env.production.example`
6. Deploy!

**Frontend:**
1. צור Web Service נוסף
2. Root Directory: `frontend`
3. הגדר build-time env vars (`NEXT_PUBLIC_*`)
4. Deploy!

**Widget:**
1. צור Web Service שלישי
2. Root Directory: `widget`
3. הגדר build-time env vars
4. Deploy!

### אופציה 2: Railway.app

דומה ל-Render, אבל עם ממשק פשוט יותר:

```bash
# התקן Railway CLI
npm i -g @railway/cli

# Login
railway login

# צור פרויקט חדש
railway init

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up

# Deploy widget
cd ../widget
railway up
```

### אופציה 3: AWS ECS / Google Cloud Run

```bash
# דוגמה ל-AWS ECR + ECS

# 1. Build and tag
docker build -t agentdesk-backend:latest ./backend

# 2. Tag for ECR
docker tag agentdesk-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/agentdesk-backend:latest

# 3. Push to ECR
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/agentdesk-backend:latest

# 4. Update ECS task definition
# 5. Deploy to ECS service
```

### אופציה 4: VPS משלך (DigitalOcean, Linode)

```bash
# 1. SSH לשרת
ssh user@your-server-ip

# 2. התקן Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Clone הפרויקט
git clone https://github.com/your-org/agentdesk.git
cd agentdesk

# 4. צור .env.production
nano .env.production

# 5. Deploy
docker-compose -f docker-compose.production.yml --env-file .env.production up -d

# 6. הגדר nginx reverse proxy (אופציונלי)
# 7. הגדר SSL עם Let's Encrypt
```

---

## 🔍 פתרון בעיות

### בעיה: Backend לא עולה - "Chromium not found"

```bash
# פתרון: ה-Dockerfile כבר כולל Chromium
# אבל אם יש בעיה, בדוק את הלוגים:
docker logs agentdesk-backend-prod

# אם צריך, הוסף במפורש:
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### בעיה: Frontend - "Module not found" או build fails

```bash
# ודא ש-standalone mode מופעל
cat frontend/next.config.js | grep standalone

# אמור להיות:
# output: 'standalone',

# אם לא, הוסף ידנית ובנה מחדש
```

### בעיה: CORS errors בפרודקשן

```bash
# בדוק ש-CORS_ORIGIN כולל את כל הדומיינים
# ב-.env.production:
CORS_ORIGIN=https://app.yourdomain.com,https://widget.yourdomain.com

# ללא רווחים!
```

### בעיה: Container crashes after startup

```bash
# בדוק health check
docker inspect agentdesk-backend-prod | grep -A 10 Health

# צפה ב-logs
docker logs -f agentdesk-backend-prod

# בדוק שכל ה-env vars מוגדרים
docker exec agentdesk-backend-prod env | grep SUPABASE
```

### בעיה: Image גדול מדי

```bash
# בדוק גודל שכבות
docker history agentdesk-backend:latest

# הקבצים שלנו כבר מופטמים עם:
# ✅ Multi-stage builds
# ✅ .dockerignore
# ✅ Alpine base images
# ✅ Production dependencies only
```

### בעיה: Build איטי

```bash
# השתמש ב-BuildKit לbuild מהיר יותר
DOCKER_BUILDKIT=1 docker build -t agentdesk-backend ./backend

# או הפעל במקביל
docker-compose -f docker-compose.production.yml build --parallel
```

---

## 📊 Monitoring & Logs

### צפייה ב-Logs

```bash
# כל השירותים
docker-compose -f docker-compose.production.yml logs -f

# שירות ספציפי
docker-compose -f docker-compose.production.yml logs -f backend

# 100 שורות אחרונות
docker-compose -f docker-compose.production.yml logs --tail=100 backend
```

### בדיקת שימוש במשאבים

```bash
# CPU + Memory usage
docker stats

# Disk usage
docker system df

# ניקוי
docker system prune -a --volumes
```

---

## 🔐 אבטחה

### בדיקת אבטחה בסיסית

```bash
# ודא שאין secrets ב-images
docker history agentdesk-backend:latest | grep -i api

# בדוק שהמשתמש לא root
docker inspect agentdesk-frontend-prod | grep User
# צריך להיות: "User": "nextjs"
```

### עדכוני אבטחה

```bash
# עדכן base images באופן קבוע
docker pull node:18-alpine

# בנה מחדש
docker-compose -f docker-compose.production.yml build --no-cache
```

---

## 🎓 Best Practices

✅ **תמיד השתמש ב-tags ספציפיים** (לא `:latest`) בפרודקשן
✅ **הפעל health checks** בכל container
✅ **הגבל resources** (CPU, Memory) בפרודקשן
✅ **השתמש ב-secrets management** (Docker Secrets, AWS Secrets Manager)
✅ **רשום logs** למערכת centralized (CloudWatch, Datadog)
✅ **עשה backups** למדבייס באופן קבוע
✅ **בדוק vulnerabilities** עם `docker scan`

---

## 📚 קישורים נוספים

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Next.js Standalone Output](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [NestJS Production Best Practices](https://docs.nestjs.com/techniques/performance)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

---

## 🆘 צריכה עזרה?

אם יש בעיות עם Docker:
1. בדקי את הלוגים: `docker logs`
2. בדקי את ה-health checks: `docker inspect`
3. בדקי שכל ה-env vars מוגדרים
4. ודאי שיש מספיק disk space
5. נסי rebuild עם `--no-cache`

**בהצלחה עם ההטמעה! 🚀**

