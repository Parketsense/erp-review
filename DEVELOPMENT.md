# 🚀 PARKETSENSE ERP v2.0 - Development Guide

## 🎉 **FRESH START COMPLETED** (2025-06-25 @ 22:04)

**Status: ✅ FULLY WORKING** - Clean foundation built successfully!

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+
- npm 9+

### 2. Installation & Setup

```bash
# Install dependencies
npm install

# Setup backend database
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
npx tsx seed.ts  # Creates test data

# Start backend (port 4000)
npm run start:dev
```

### 3. Test the API

```bash
# Get all clients
curl "http://localhost:4000/api/clients" | jq .

# Get client statistics
curl "http://localhost:4000/api/clients/stats"

# Create new client
curl -X POST "http://localhost:4000/api/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "isArchitect": false
  }'
```

## 📋 **Working Features**

### ✅ Backend API (Port 4000)
- **Clients Module**: Complete CRUD operations
- **Database**: SQLite with Prisma ORM
- **Validation**: Proper input validation with class-validator
- **Error Handling**: Proper HTTP status codes
- **Type Safety**: Full TypeScript coverage

### ✅ API Endpoints
```
GET    /api/clients           # List all clients with filters
POST   /api/clients           # Create new client
GET    /api/clients/stats     # Get client statistics
GET    /api/clients/:id       # Get specific client
PATCH  /api/clients/:id       # Update client
DELETE /api/clients/:id       # Soft delete client
GET    /api/clients/check-eik/:eik  # Check EIK duplicate
```

### ✅ Database Schema
- **users**: Authentication and user management
- **clients**: Individual & company clients with architect support
- **audit_logs**: Change tracking and audit trail

## 🏗️ **Architecture Overview**

### Modern Tech Stack
```
Backend:  NestJS + Prisma + SQLite → PostgreSQL ready
Frontend: Next.js 14 + TypeScript + TailwindCSS (to be connected)
Database: Type-safe queries with Prisma
API:      RESTful with proper validation
```

### Project Structure
```
apps/
├── backend/                 # NestJS API (✅ Working)
│   ├── src/
│   │   ├── clients/        # Clients module (✅ Complete)
│   │   ├── users/          # Users module (🚧 Basic)
│   │   ├── auth/           # Auth module (🔄 Planned)
│   │   └── prisma/         # Database service (✅ Working)
│   └── prisma/             # Schema & migrations (✅ Working)
└── frontend/               # Next.js app (🔄 To be built)
```

## 🔄 **Next Development Steps**

### Phase 1: Frontend Connection (Week 1)
1. **Setup Next.js client** 
2. **Connect to backend API**
3. **Build clients management UI**
4. **Implement design system components**

### Phase 2: Authentication (Week 2)  
1. **JWT authentication implementation**
2. **User registration/login**
3. **Role-based access control**
4. **Session management**

### Phase 3: Core Modules (Weeks 3-4)
1. **Products module** - Catalog with attributes
2. **Projects module** - Project hierarchy
3. **Offers module** - Offer generation system

### Phase 4: AI Integration (Weeks 5-8)
1. **Smart recommendations**
2. **Automated workflows**
3. **Client persona analysis**
4. **Voice-to-offer generation**

## 📊 **Current Test Data**

### Users
- **Admin User**: admin@parketsense.bg (Георги Петков)

### Clients  
- **Test Client**: Иван Петров (Петров Дизайн ЕООД, Architect, 15% commission)

## 🛠️ **Development Commands**

### Backend Development
```bash
cd apps/backend

# Development server
npm run start:dev        # Hot reload enabled

# Database operations
npx prisma studio        # Visual database editor
npx prisma generate      # Regenerate client
npx prisma migrate dev   # Create new migration

# Build & production
npm run build           # TypeScript compilation
npm run start:prod      # Production mode
```

### Frontend Development (Coming Soon)
```bash
cd apps/frontend
npm run dev             # Development server (port 3000)
npm run build           # Production build
```

## 🧪 **Testing Strategy**

### API Testing (Current)
- **Manual testing**: curl commands
- **Database verification**: Prisma Studio
- **Response validation**: JSON structure checks

### Future Testing
- **Unit tests**: Jest for services
- **Integration tests**: API endpoint testing  
- **E2E tests**: Full workflow validation
- **Frontend tests**: React Testing Library

## 📈 **Performance & Quality**

### Current Status
- ✅ **Zero compilation errors**
- ✅ **Type-safe database operations**
- ✅ **Proper error handling**
- ✅ **Input validation working**
- ✅ **CORS configured**
- ✅ **Environment configuration**

### Code Quality
- **TypeScript**: Strict mode enabled
- **Validation**: class-validator decorators
- **Architecture**: Clean module separation
- **Database**: Normalized schema design

## 🔧 **Troubleshooting**

### Common Issues
1. **Port conflicts**: Check if 4000 is in use
2. **Database connection**: Ensure SQLite file exists
3. **Prisma client**: Run `npx prisma generate` after schema changes

### Reset Commands
```bash
# Reset database
npx prisma migrate reset

# Clear all caches
npm run clean
rm -rf node_modules apps/*/node_modules
npm install
```

## 📞 **Development Support**

- **API Documentation**: Test with curl commands above
- **Database Schema**: Check `apps/backend/prisma/schema.prisma`
- **Business Logic**: Reference `/docs` and numbered folders
- **Design System**: See `2-Дизайни/parketsense_design_system.tsx`

---

## 🎯 **Success Metrics**

### Phase 1 Completion ✅
- [x] Clean codebase with zero errors
- [x] Working API with proper validation
- [x] Database schema implemented
- [x] Test data seeded successfully
- [x] All endpoints responding correctly

### Next Phase Goals 🎯
- [ ] Frontend connected to API
- [ ] Authentication implemented  
- [ ] UI components from design system
- [ ] End-to-end workflow working

**🚀 Foundation is solid - ready to build the future!** 