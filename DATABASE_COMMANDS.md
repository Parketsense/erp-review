# 🛡️ PARKETSENSE ERP - Database Commands

## ⚡ Quick Commands

```bash
# 📂 Backup преди промени
cd apps/backend && npm run db:backup

# 🌱 Възстановяване на данни  
cd apps/backend && npm run db:seed

# 🔄 Restore от backup
cd apps/backend && npm run db:restore

# 📋 Покажи всички backups
cd apps/backend && npm run db:backup:list
```

## 🚨 CRITICAL RULES

⛔ **ЗАБРАНЕНИ КОМАНДИ:**
```bash
npx prisma migrate reset --force
npm run db:reset
```

✅ **ПРАВИЛНИ КОМАНДИ:**
```bash
npm run db:backup      # Първо backup
npm run db:restore     # След това restore
```

## 📋 Work Flow

### При промяна в schema:
```bash
cd apps/backend
npm run db:backup
npx prisma migrate dev
npm run db:seed
```

### При проблем:
```bash
cd apps/backend
npm run db:backup:list
npm run db:restore
npm run db:seed
```

---

**📖 Пълни инструкции:** `apps/backend/DATABASE_SETUP.md` 