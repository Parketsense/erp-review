# 🚀 PARKETSENSE ERP v2.0 - AI-Native Business Management Platform

## 🎯 Project Status

### ✅ **FRESH START COMPLETED** (2025-06-25)
We've successfully completed a clean restart of the PARKETSENSE ERP system with modern architecture:

- **Backend**: NestJS + Prisma + SQLite → PostgreSQL ready
- **Frontend**: Next.js 14 + TypeScript + TailwindCSS  
- **Architecture**: Clean, type-safe, AI-ready foundation
- **Zero compilation errors**: All modules working properly

### 📦 **Currently Working Modules**

#### 1. **Clients Module** ✅ COMPLETE
- Full CRUD operations (Create, Read, Update, Delete)
- Individual & Company clients support  
- Architect/Designer functionality with commission tracking
- EIK/BULSTAT duplicate validation
- Advanced search and filtering
- Statistics dashboard
- API Endpoints: `/api/clients/*`

#### 2. **Users & Authentication** 🚧 IN PROGRESS
- Basic user model and database schema
- Ready for JWT authentication implementation

#### 3. **Database Foundation** ✅ COMPLETE
- Prisma ORM with type-safe queries
- SQLite (development) → PostgreSQL (production) ready
- Audit logging architecture
- Database migrations working

## 🏗️ **Tech Stack**

### Backend
```typescript
- NestJS (Node.js framework)
- Prisma ORM (database access)
- SQLite/PostgreSQL (database)
- TypeScript (type safety)
- JWT (authentication - planned)
- Class-validator (validation)
```

### Frontend  
```typescript
- Next.js 14 (React framework)
- TypeScript (type safety)
- TailwindCSS (styling)
- Component-based architecture
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Backend Database
```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
npx tsx seed.ts  # Create test data
```

### 3. Start Development Servers
```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run dev:backend  # Port 4000
npm run dev:frontend # Port 3000
```

### 4. Access Applications
- **Backend API**: http://localhost:4000/api
- **Frontend**: http://localhost:3000  
- **Prisma Studio**: http://localhost:5555

## 📊 **API Documentation**

### Clients API (`/api/clients`)

#### GET `/api/clients`
Get all clients with pagination and filtering
```bash
# Basic request
curl "http://localhost:4000/api/clients"

# With filters
curl "http://localhost:4000/api/clients?search=ivan&isArchitect=true&page=1&limit=10"
```

#### POST `/api/clients`  
Create new client
```bash
curl -X POST "http://localhost:4000/api/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Мария",
    "lastName": "Георгиева", 
    "email": "maria@example.com",
    "phone": "+359888123456",
    "isArchitect": true,
    "commissionPercent": 15
  }'
```

#### GET `/api/clients/stats`
Get clients statistics
```bash
curl "http://localhost:4000/api/clients/stats"
```

#### GET `/api/clients/:id`
Get specific client details

#### PATCH `/api/clients/:id`
Update client information

#### DELETE `/api/clients/:id`
Soft delete client

## 🎨 **Design System**

We're using the professionally designed PARKETSENSE Design System:
- **Primary Color**: #2563eb (Blue)
- **Component Library**: Buttons, Forms, Tables, Modals
- **Responsive**: Mobile-first approach
- **Accessible**: WCAG 2.1 compliant

## 🤖 **AI Integration Roadmap**

### Phase 1: Foundation (Current)
- ✅ Core modules working
- ✅ Type-safe architecture  
- ✅ API structure ready

### Phase 2: Smart Features (Next)
- 🔄 Intelligent product recommendations
- 🔄 Automated email generation
- 🔄 Client persona analysis

### Phase 3: Full AI Experience (Future)
- 🔄 Voice-to-offer generation  
- 🔄 Interactive client portal
- 🔄 Predictive analytics

## 📁 **Project Structure**

```
parketsense-erp/
├── apps/
│   ├── backend/           # NestJS API
│   │   ├── src/
│   │   │   ├── clients/   # Clients module ✅
│   │   │   ├── users/     # Users module 🚧
│   │   │   ├── auth/      # Auth module 🚧
│   │   │   └── prisma/    # Database service ✅
│   │   └── prisma/        # Database schema & migrations
│   └── frontend/          # Next.js app
│       └── src/           # Frontend source (to be built)
├── docs/                  # Business & technical documentation
├── 1-Документация/        # Original documentation
├── 2-Дизайни/            # Design system & mockups  
└── 3-За-програмиста/     # Technical specifications
```

## 🔄 **Development Workflow**

### Adding New Module
1. Generate NestJS module: `npx nest g module [name]`
2. Create Prisma model in `schema.prisma`
3. Run migration: `npx prisma migrate dev`
4. Implement service & controller
5. Add validation DTOs
6. Test with curl/Postman

### Database Changes
```bash
# After modifying schema.prisma
npx prisma generate     # Update client
npx prisma migrate dev  # Create migration
```

## 🧪 **Testing**

### API Testing
Use curl commands or Postman collection (to be created)

### Example Workflow Test
```bash
# 1. Get all clients
curl "http://localhost:4000/api/clients"

# 2. Create new client  
curl -X POST "http://localhost:4000/api/clients" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User"}'

# 3. Check stats
curl "http://localhost:4000/api/clients/stats"
```

## 🎯 **Next Steps (Priority Order)**

1. **Frontend Setup** - Connect Next.js to API
2. **Authentication** - Complete JWT implementation  
3. **Products Module** - Build product catalog
4. **Projects & Offers** - Core business logic
5. **AI Features** - Smart recommendations

## 📞 **Support**

- **Product Owner**: Анатоли Миланов
- **Documentation**: See `/docs` and numbered folders
- **Architecture**: Modern, scalable, AI-ready

---

**🎉 The foundation is solid. Let's build the future of ERP systems!**
