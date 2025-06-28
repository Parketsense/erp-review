# .gitignore за PARKETSENSE ERP

## 🚫 Какво НЕ трябва да влиза в Git

```gitignore
# Dependencies
node_modules/
vendor/
venv/
env/
.env
.env.local
.env.*.local

# IDE файлове
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# Build outputs
dist/
build/
*.egg-info/
__pycache__/
*.pyc

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/
*.lcov
.pytest_cache/

# Database
*.db
*.sqlite
*.sqlite3
database/backups/
database/dumps/

# Uploads и генерирани файлове
uploads/
public/uploads/
temp/
cache/

# Конфиденциални данни
config/secrets.json
*.pem
*.key
certificates/

# OS файлове
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Backup файлове
*.bak
*.backup
*.old
*~

# Специфични за проекта
/wireframes/temp/
/docs/drafts/
/api/responses-cache/
TODO.personal.md
NOTES.private.md
```

## 📁 Какво ТРЯБВА да влиза в Git

### ✅ Включвайте:
- Всички `.md` файлове с документация
- SQL схеми и миграции
- HTML wireframes
- Mermaid диаграми (`.mermaid`)
- Конфигурационни темплейти (`.env.example`)
- Postman колекции
- Тестови данни (без чувствителна информация)

### ❌ НЕ включвайте:
- Реални пароли или API ключове
- Лични бележки
- Генерирани файлове
- Database dumps с реални данни
- Временни файлове

## 💡 Добри практики

### 1. Създайте `.env.example`
```bash
# .env.example
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parketsense_erp
DB_USER=your_db_user
DB_PASS=your_db_password

JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AI Services
OPENAI_API_KEY=your-openai-key

# Storage
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=parketsense-uploads
```

### 2. За чувствителни конфигурации
```javascript
// config/database.js
module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'parketsense_dev',
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
};
```

### 3. Игнорирайте големи файлове
Ако имате големи файлове (>100MB), използвайте Git LFS:
```bash
# .gitattributes
*.pdf filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text
wireframes/videos/*.mp4 filter=lfs diff=lfs merge=lfs -text
```

### 4. Специфични папки за игнориране
```gitignore
# Временни wireframes
wireframes/work-in-progress/

# Лични бележки на разработчици
docs/personal-notes/

# Експериментален код
experiments/

# Клиентски данни
data/real-clients/
data/production-backup/
```

## 🔐 Сигурност

### НИКОГА не commit-вайте:
1. **Пароли** - използвайте environment variables
2. **API ключове** - дори тестови
3. **Database dumps** с реални данни
4. **SSL сертификати** и private keys
5. **Backup файлове** с чувствителна информация

### Ако случайно сте commit-нали чувствителни данни:
```bash
# Не е достатъчно само да ги изтриете!
# Използвайте BFG Repo-Cleaner или:
git filter-branch --index-filter \
  'git rm --cached --ignore-unmatch path/to/sensitive-file' HEAD

# И променете всички засегнати пароли/ключове!
```

## 📝 Проверка

Преди всеки commit:
```bash
# Проверете какво ще качите
git status
git diff --staged

# Уверете се, че няма чувствителни данни
grep -r "password\|secret\|key" --include="*.js" --include="*.json" .
```

---

**Важно**: Този файл трябва да се казва точно `.gitignore` (с точка отпред) и да е в главната папка на проекта!