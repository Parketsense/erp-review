# 🛡️ CRITICAL: Database Protection Setup

## ⚠️ ЗАДЪЛЖИТЕЛНИ СТЪПКИ СЛЕД ВЪЗСТАНОВЯВАНЕ

### 1. Създай .env файл

```bash
# В директорията apps/backend/ създай файл .env с тези настройки:
DATABASE_URL="file:./dev.db"

# 🛡️ DATABASE PROTECTION RULES - CRITICAL!
PRISMA_CONFIRM_RESET=false
DATABASE_BACKUP_BEFORE_RESET=true

# Application Settings
NODE_ENV=development
PORT=4003
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
DEBUG=true

# Backup Configuration
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
```

### 2. Винаги използвай тези команди

```bash
# 📂 BACKUP: Преди всякаква промяна
npm run db:backup

# 🌱 SEED: Възстановяване на данни
npm run db:seed

# 🔄 RESTORE: От конкретен backup
npm run db:restore

# 📋 LIST: Покажи всички backups
npm run db:backup:list
```

### 3. ⛔ ЗАБРАНЕНИ КОМАНДИ

```bash
# ❌ НИКОГА не използвай:
npx prisma migrate reset --force
npm run db:reset

# ✅ ВМЕСТО ТОВА:
npm run db:backup      # Първо backup
npm run db:restore     # След това restore
```

## 🔄 Правилен Work Flow

### Преди промяна в схемата:
```bash
1. npm run db:backup
2. npx prisma migrate dev
3. npm run db:seed (ако е нужно)
```

### При проблем:
```bash
1. npm run db:backup:list    # Виж налични backups
2. npm run db:restore        # Избери backup
3. npm run db:seed          # Възстанови данни
```

### Ежедневен backup:
```bash
npm run db:backup
```

## 📊 Проверка на системата

```bash
# Провери дали всичко работи:
npm run db:backup
npm run db:backup:list

# Тествай restore (по избор):
npm run db:restore

# Възстанови данни:
npm run db:seed
```

## 🚨 АВАРИЙНИ КОМАНДИ

Ако базата е повредена:

```bash
# 1. Опитай restore от backup
npm run db:restore

# 2. Ако няма backup, възстанови от миграции
npx prisma migrate reset --force
npm run db:seed

# 3. Ако и това не работи, изтрий всичко и започни наново
rm -f prisma/dev.db
npx prisma db push
npm run db:seed
```

---

## ⚠️ ВАЖНИ ПРЕДУПРЕЖДЕНИЯ

1. **ВИНАГИ** прави backup преди промени
2. **НИКОГА** не изтривай backup файлове ръчно
3. **ПРОВЕРЯВАЙ** че .env има правилните настройки
4. **ТЕСТВАЙ** backup/restore процеса редовно

---

## 📞 Помощ

```bash
# За помощ с backup:
node scripts/db-backup.js help

# За помощ с restore:
node scripts/db-restore.js help
``` 