# PARKETSENSE ERP - PROJECTS MODULE COMPLETE ARCHITECTURE
## Comprehensive Context Guide for Cursor AI Development

**Document Purpose:** Complete technical and business context for Cursor AI to understand the complex Projects module architecture, workflows, dependencies, and business logic.

**Project Status:** Backend 100% ready (47 API endpoints), Frontend 80% ready, Production-grade architecture implemented.

---

## 📁 **FILE MANAGEMENT & VISUALIZATION SYSTEM**

### **File Upload & Storage Architecture**
```typescript
// File Upload Configuration
const FILE_UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB per file
  maxFilesPerNote: 50, // Unlimited effectively
  allowedFileTypes: [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // CAD Files
    'application/dwg', 'application/dxf', 'application/step',
    // Archives
    'application/zip', 'application/x-rar-compressed',
    // Text
    'text/plain', 'text/csv',
    // Other
    'application/json', 'application/xml'
  ],
  
  // Storage paths
  storagePath: '/uploads/projects/{projectId}/{entityType}/{entityId}/',
  backupPath: '/backups/files/',
  
  // File naming
  preserveOriginalName: true,
  generateUniqueInternalName: true,
  fileNamingPattern: '{timestamp}_{uuid}_{originalName}'
};
```

### **Built-in File Viewers**
```typescript
// PDF Viewer Component
interface PDFViewerProps {
  fileUrl: string;
  filename: string;
  enableDownload: boolean;
  enablePrint: boolean;
}

// Features:
// - Zoom in/out controls
// - Page navigation
// - Search within PDF
// - Full-screen mode
// - Print functionality
// - Download with original filename
// - Mobile-responsive design

// Image Viewer Component  
interface ImageViewerProps {
  images: FileAttachment[];
  currentIndex: number;
  enableGallery: boolean;
  enableDownload: boolean;
}

// Features:
// - Lightbox gallery view
// - Thumbnail navigation
// - Zoom and pan functionality
// - Slideshow mode
// - Batch download
// - Image rotation
// - Mobile touch gestures

// Document Viewer (Limited)
interface DocumentViewerProps {
  fileUrl: string;
  fileType: string;
  filename: string;
}

// Supported formats:
// - Plain text files
// - CSV files (table view)
// - JSON files (formatted view)
// - Basic Word docs (conversion to HTML)
```

### **File Management Workflows**
```
File Upload Process:
├── 1. File Selection & Validation
│   ├── File type validation
│   ├── File size validation  
│   ├── Malware scanning (future)
│   └── Duplicate detection
├── 2. Upload Processing
│   ├── Unique filename generation
│   ├── Original filename preservation
│   ├── File metadata extraction
│   ├── Thumbnail generation (images)
│   └── Storage path assignment
├── 3. Database Recording
│   ├── NoteAttachment record creation
│   ├── File metadata storage
│   ├── User and timestamp logging
│   └── Association with note/communication
└── 4. Post-Upload Actions
    ├── Success notification
    ├── File preview generation
    ├── Automatic backup (future)
    └── Search index update

File Download Process:
├── 1. Authorization Check
│   ├── User permission validation
│   ├── Project access verification
│   └── File existence confirmation
├── 2. Download Preparation
│   ├── Original filename retrieval
│   ├── File stream preparation
│   ├── Download headers setup
│   └── Logging download activity
└── 3. File Delivery
    ├── Secure file streaming
    ├── Progress tracking (large files)
    ├── Error handling
    └── Download completion logging

Bulk Operations:
├── Bulk Upload
│   ├── Multiple file selection
│   ├── Batch validation
│   ├── Progress indication
│   ├── Parallel upload processing
│   └── Batch result summary
├── Bulk Download
│   ├── Multiple file selection
│   ├── ZIP archive creation
│   ├── Archive naming with context
│   ├── Download progress tracking
│   └── Cleanup after download
└── File Management
    ├── Batch move/organize
    ├── Batch rename operations
    ├── Batch delete with confirmation
    └── Batch metadata updates
```

---

## 🗄️ **EXTENDED DATABASE SCHEMA REQUIREMENTS**

### **Additional Tables for Notes, Files & Communication System**
```sql
-- Project/Phase Notes System
model ProjectNote {
  id          String   @id @default(cuid())
  projectId   String?  -- Project-level notes
  phaseId     String?  -- Phase-level notes
  title       String
  content     String   -- Rich text content
  category    NoteCategory @default(GENERAL)
  priority    NotePriority @default(MEDIUM)
  authorId    String   -- User who created the note
  
  project     Project? @relation(fields: [projectId], references: [id])
  phase       ProjectPhase? @relation(fields: [phaseId], references: [id])
  attachments NoteAttachment[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

-- File Attachments for Notes
model NoteAttachment {
  id              String   @id @default(cuid())
  noteId          String
  originalFilename String   -- Preserve original filename
  storedFilename   String   -- Internal storage filename
  filePath        String   -- Full file path
  fileSize        Int      -- File size in bytes
  mimeType        String   -- File MIME type
  uploadedBy      String   -- User who uploaded
  
  note            ProjectNote @relation(fields: [noteId], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

-- Communication Log System
model CommunicationEntry {
  id              String   @id @default(cuid())
  projectId       String?  -- Project-level communication
  phaseId         String?  -- Phase-level communication
  type            CommunicationType
  title           String
  content         String   -- Communication details/summary
  participants    String[] -- List of participants
  scheduledDate   DateTime? -- For meetings/calls
  duration        Int?     -- Duration in minutes
  location        String?  -- Meeting location
  isCompleted     Boolean  @default(false)
  followUpDate    DateTime? -- Next follow-up date
  createdBy       String   -- User who created entry
  
  project         Project? @relation(fields: [projectId], references: [id])
  phase           ProjectPhase? @relation(fields: [phaseId], references: [id])
  attachments     CommunicationAttachment[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

-- Communication Attachments
model CommunicationAttachment {
  id                    String   @id @default(cuid())
  communicationId       String
  originalFilename      String
  storedFilename        String
  filePath             String
  fileSize             Int
  mimeType             String
  uploadedBy           String
  
  communication        CommunicationEntry @relation(fields: [communicationId], references: [id])
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

-- Outlook Integration Data (Future)
model OutlookIntegration {
  id              String   @id @default(cuid())
  userId          String   @unique -- System user
  outlookUserId   String   -- Outlook user ID
  accessToken     String   -- Encrypted access token
  refreshToken    String   -- Encrypted refresh token
  tokenExpiry     DateTime
  isActive        Boolean  @default(true)
  lastSyncDate    DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

-- Architect Payments Table
model ArchitectPayment {
  id              String   @id @default(cuid())
  phaseId         String
  paymentDate     DateTime
  amount          Float
  notes           String?
  createdBy       String   -- User who recorded the payment
  
  phase           ProjectPhase @relation(fields: [phaseId], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

-- Extended ProjectPhase Model
model ProjectPhase {
  id                        String   @id @default(cuid())
  projectId                 String
  name                      String
  description               String?
  includeArchitectCommission Boolean  @default(false)
  status                    PhaseStatus @default(CREATED)
  
  // Commission tracking fields
  commissionPercentage      Float?   -- Override project-level commission
  totalCommissionDue        Float?   -- Calculated field
  totalCommissionPaid       Float    @default(0)
  paymentStatus            PaymentStatus @default(UNPAID)
  lastPaymentDate          DateTime?
  
  variants                 PhaseVariant[]
  architectPayments        ArchitectPayment[]
  notes                    ProjectNote[]
  communications           CommunicationEntry[]
  
  createdAt                DateTime @default(now())
  updatedAt                DateTime @updatedAt
}

-- Extended Project Model
model Project {
  id              String   @id @default(cuid())
  clientId        String
  name            String
  description     String?
  projectType     ProjectType
  address         String?
  area            Float?
  roomsCount      Int?
  estimatedBudget Float?
  
  // Architect configuration
  architectType   ArchitectType @default(NONE)
  architectName   String?
  architectPhone  String?
  architectEmail  String?
  architectCommission Float? -- Default commission percentage
  
  client          Client @relation(fields: [clientId], references: [id])
  phases          ProjectPhase[]
  contacts        ProjectContact[]
  notes           ProjectNote[]
  communications  CommunicationEntry[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

-- Enums
enum NoteCategory {
  GENERAL         // General notes
  MEETING         // Meeting notes
  REQUIREMENT     // Requirements and specifications
  ISSUE           // Problems and issues
  TECHNICAL       // Technical documentation
  FINANCIAL       // Financial notes
  QUALITY         // Quality control
  TIMELINE        // Schedule and timeline
}

enum NotePriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum CommunicationType {
  PHONE_CALL      // 📞 Phone conversation
  MEETING         // 🤝 Face-to-face or virtual meeting
  EMAIL           // 📧 Email communication
  CHAT            // 💬 Chat or instant message
  NOTE            // 📝 General note or observation
  ISSUE           // ⚠️ Issue or problem report
  TASK            // ✅ Task or action item
  MILESTONE       // 🎯 Project milestone
}

enum PaymentStatus {
  UNPAID      // 0% paid - Red indicator
  PARTIAL     // 1-99% paid - Yellow indicator  
  PAID        // 100% paid - Green indicator
  OVERPAID    // >100% paid - Blue indicator
}
```

---

## 🏗️ CORE DATA HIERARCHY & RELATIONSHIPS

### **Primary Business Entity Structure**
```
Client (Клиент)
└── Project[] (Проект) - MULTIPLE projects per client
    ├── architect: ProjectArchitect (на project level - ВАЖНО!)
    └── ProjectPhase[] (Фаза) 
        ├── includeArchitectCommission: boolean
        ├── status: 'created' | 'quoted' | 'won' | 'lost'
        └── PhaseVariant[] (Вариант)
            ├── includeInOffer: boolean
            ├── designer: string
            ├── order: number (за drag & drop reordering)
            └── VariantRoom[] (Стая)
                ├── area: number (квадратура)
                ├── discount: number (отстъпка %)
                ├── discountEnabled: boolean
                ├── waste: number (фира %)
                ├── images: RoomImage[]
                └── RoomProduct[] (Продукт в стая)
                    ├── quantity: number (изчислява се: area * (1 + waste/100))
                    ├── unitPrice: number
                    ├── discount: number
                    ├── discountEnabled: boolean
                    ├── finalPrice: number (unitPrice * (1 - discount/100))
                    ├── total: number (quantity * finalPrice)
                    └── category: 'под' | 'стена' | 'мебели'
```

### **Critical Business Rules**
1. **Architect Logic:** Architect се задава на PROJECT level, но се включва/изключва per PHASE
2. **Pricing Chain:** Product Price → Quantity (+ waste) → Discount → Final Price → Room Total → Variant Total → Phase Total
3. **Commission Chain:** Phase Total → Architect Commission (%) → Commission Due → Payments Tracking → Payment Status
4. **Status Flow:** created (създадена) → quoted (оферирано) → won/lost (спечелена/загубена)
5. **Payment Status Flow:** unpaid (червено) → partial (жълто) → paid (зелено) → overpaid (синьо)
6. **Cloning Rules:** Rooms клонират в други variants, Variants клонират в други phases

---

## 🔄 COMPLEX BUSINESS WORKFLOWS

### **1. PROJECT CREATION WORKFLOW**
```
Step 1: Client Selection
├── Search existing clients (name, phone, company)
├── Smart client detection (architect flag important)
└── Auto-populate architect if client is architect

Step 2: Project Details
├── projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other'
├── address, area, roomsCount, estimatedBudget
├── **Project Notes & Documentation:**
│   ├── Project description/overview notes
│   ├── Initial requirements and specifications
│   ├── File attachments (contracts, drawings, specifications)
│   ├── Image gallery (site photos, reference images)
│   └── Document versioning and timestamps
└── ARCHITECT CONFIGURATION (project level):
    ├── architectType: 'none' | 'client' | 'external'
    ├── architectName, architectCommission, architectPhone, architectEmail
    └── Auto-detection if client.isArchitect = true

Step 3: Contact Management
├── Multiple contacts per project (max 3)
├── Role assignment per contact
├── Communication preferences (receives offers/invoices/updates)
└── Primary contact designation

Step 4: Communication & Documentation Setup
├── **Communication Log Initialization:**
│   ├── Initial meeting notes and agreements
│   ├── Client requirements documentation
│   ├── Project timeline and milestones
│   └── Communication preferences setup
├── **File Management System:**
│   ├── Project folder structure creation
│   ├── Initial document upload and organization
│   ├── Access permissions and sharing settings
│   └── Backup and versioning configuration
└── **Integration Setup (Future):**
    ├── Outlook calendar synchronization
    ├── Email thread linking
    └── Automated communication tracking
```

### **2. PHASES MANAGEMENT WORKFLOW**
```
Phase Creation:
├── name: string (е.g., "Етаж 1 - Продажба", "Етаж 1 - Монтаж")
├── description: string
├── includeArchitectCommission: boolean ← CRITICAL FIELD
├── **Phase Notes & Documentation:**
│   ├── Phase-specific requirements and constraints
│   ├── Technical specifications and drawings
│   ├── Supplier information and quotes
│   ├── Installation notes and schedules
│   └── Quality control checklists
└── status: 'created' (default)

Phase Operations:
├── Create/Edit/Delete phases
├── Toggle architect commission per phase
├── Status management (created → quoted → won/lost)
├── **Notes & File Management System:**
│   ├── **Note Creation & Management:**
│   │   ├── Rich text editor for detailed notes
│   │   ├── Note categorization (meeting, requirement, issue, etc.)
│   │   ├── Priority levels (low, medium, high, urgent)
│   │   ├── Timestamp and author tracking
│   │   ├── Note threading and replies
│   │   ├── Search and filtering capabilities
│   │   └── Note templates for common scenarios
│   ├── **File Attachment System:**
│   │   ├── Unlimited file uploads per note
│   │   ├── Support for multiple file types (PDF, images, docs, CAD files)
│   │   ├── Original filename preservation in database
│   │   ├── File size limits and validation
│   │   ├── Batch file upload functionality
│   │   ├── File versioning and replacement
│   │   └── File access permissions and sharing
│   ├── **Built-in File Viewers:**
│   │   ├── **PDF Viewer:** Embedded PDF rendering with zoom/navigation
│   │   ├── **Image Viewer:** Gallery view with thumbnails and lightbox
│   │   ├── **Document Preview:** Text files, Word docs (limited)
│   │   ├── **CAD File Preview:** Basic DWG/DXF viewing (future)
│   │   ├── Full-screen viewing mode
│   │   ├── Print functionality directly from viewer
│   │   └── Mobile-responsive viewers
│   └── **Download & Export:**
│       ├── Individual file download with original filename
│       ├── Bulk download as ZIP archive
│       ├── Export notes as PDF reports
│       ├── File sharing via secure links
│       └── Download history and tracking
├── **Communication Tab System:**
│   ├── **Communication Entry Types:**
│   │   ├── 📞 **Phone Call** - Duration, participants, summary
│   │   ├── 🤝 **Meeting** - Date, time, location, attendees, agenda
│   │   ├── 📧 **Email** - Subject, participants, summary, attachments
│   │   ├── 💬 **Chat/Message** - Quick informal communication
│   │   ├── 📝 **Note** - General observations, reminders
│   │   ├── ⚠️ **Issue** - Problems, blockers, resolution tracking
│   │   ├── ✅ **Task** - Action items, assignments, deadlines
│   │   └── 🎯 **Milestone** - Project milestones and achievements
│   ├── **Communication Management:**
│   │   ├── Chronological timeline view
│   │   ├── Filter by type, date, participant
│   │   ├── Quick action buttons for common entries
│   │   ├── Templates for recurring communication types
│   │   ├── Reminder system for follow-ups
│   │   ├── Communication analytics and reports
│   │   └── Integration with calendar systems
│   ├── **Outlook Integration (Future Implementation):**
│   │   ├── **Email Synchronization:**
│   │   │   ├── Automatic email import based on project keywords
│   │   │   ├── Email thread linking to project/phase
│   │   │   ├── Attachment extraction and filing
│   │   │   ├── Email template generation from system
│   │   │   └── Bidirectional email synchronization
│   │   ├── **Calendar Integration:**
│   │   │   ├── Meeting scheduling directly from system
│   │   │   ├── Automatic meeting notes creation
│   │   │   ├── Attendee synchronization
│   │   │   ├── Meeting room booking integration
│   │   │   └── Calendar conflict detection
│   │   ├── **Contact Synchronization:**
│   │   │   ├── Client contact sync with Outlook
│   │   │   ├── Team member availability checking
│   │   │   ├── Contact history and interaction tracking
│   │   │   └── Communication preference management
│   │   └── **Technical Implementation:**
│   │       ├── Microsoft Graph API integration
│   │       ├── OAuth 2.0 authentication
│   │       ├── Webhook subscriptions for real-time updates
│   │       ├── Delta query for efficient synchronization
│   │       └── Error handling and retry mechanisms
│   └── **Communication Analytics:**
│       ├── Communication frequency reports
│       ├── Response time analytics
│       ├── Issue resolution tracking
│       ├── Client engagement metrics
│       └── Team productivity insights
├── **Architect Commission Management:**
│   ├── **Commission Calculation Display** - Real-time calculation based on phase total
│   ├── **Payment Tracking System:**
│   │   ├── Record payment date and amount
│   │   ├── Multiple partial payments support
│   │   ├── Payment history log with timestamps
│   │   ├── Automatic balance calculation (due vs paid)
│   │   └── Comments/notes per payment entry
│   ├── **Visual Payment Status Indicators:**
│   │   ├── 🔴 **Red/Default:** No payment recorded (0% paid)
│   │   ├── 🟡 **Yellow:** Partial payment (1-99% paid)
│   │   ├── 🟢 **Green:** Full payment (100% paid)
│   │   ├── 🔵 **Blue:** Overpaid (>100% paid)
│   │   └── Status badge with percentage and amounts
│   ├── **Payment Management UI:**
│   │   ├── "Add Payment" button on phase level
│   │   ├── Payment modal with date picker and amount
│   │   ├── Payment validation (cannot exceed commission)
│   │   ├── Payment list with edit/delete options
│   │   └── Export payment report functionality
│   └── **Commission Dashboard:**
│       ├── Total commission due per phase
│       ├── Total paid amount with breakdown
│       ├── Outstanding balance calculation
│       ├── Next payment due indicators
│       └── Payment completion percentage
├── Bulk Discount Management:
│   ├── Change discount for entire phase (с потвърждение)
│   ├── Apply to all variants and rooms in phase
│   ├── Confirmation dialog with affected items count
│   ├── Override protection for manual overrides
│   └── Visual progress indicator during bulk operations
├── CRUD Operations:
│   ├── Edit phase details
│   ├── Delete phase (с потвърждение за data loss)
│   ├── Phase status transitions
│   └── Bulk operations management
└── Statistics aggregation (total value, variants count, rooms count, commission status, communication activity)
```

### **3. VARIANTS MANAGEMENT WORKFLOW**
```
Variant Creation:
├── name: string (e.g., "Рибена кост - Дъб натурал")
├── description: string
├── designer: string (от dropdown)
├── includeInOffer: boolean (toggle за оферти)
├── discount: number (вариант-ниво отстъпка %)
├── discountEnabled: boolean (вкл/изкл отстъпка за варианта)
└── order: number (за reordering)

Variant Gallery System:
├── Multiple image upload per variant
├── Variant-level image gallery management
├── Image preview with thumbnails for variant
├── Separate from room-level galleries
└── Gallery size tracking per variant

Advanced Variant Operations:
├── Drag & Drop Reordering (в рамките на фаза)
├── Bulk Discount Management:
│   ├── Change discount for entire variant (с потвърждение)
│   ├── Apply to all rooms in variant
│   ├── Confirmation dialog with affected rooms count
│   └── Visual feedback during bulk operations
├── Clone to Other Phase:
│   ├── Select target phase
│   ├── Clone options: all rooms vs selected rooms
│   ├── Clone options: with/without products
│   ├── Clone variant gallery images
│   └── Preserve room structure and pricing
├── Toggle Include in Offer (за offer generation)
├── Toggle Variant Discount (affects all rooms)
├── CRUD Operations:
│   ├── Edit variant details (inline editing)
│   ├── Delete variant (с потвърждение)
│   ├── Clone variant (with options)
│   └── Enable/Disable variant
└── Statistics: rooms count, total value, gallery count (variant + rooms)
```

### **4. ROOMS MANAGEMENT WORKFLOW**
```
Room Creation:
├── name: string (e.g., "Дневна", "Спалня", "Кухня")
├── area: number (квадратура в м²)
├── discount: number (стая-ниво отстъпка %)
├── discountEnabled: boolean
└── waste: number (фира %, обикновено 10-15%)

Room Products Management:
├── Product Search & Selection
├── Direct Product Creation:
│   ├── + Button next to search field
│   ├── Opens product creation modal
│   ├── Auto-loads created product into room
│   ├── Maintains room context during creation
│   └── Success feedback with product added
├── Automatic Quantity Calculation: area * (1 + waste/100)
├── Field Override System:
│   ├── Override quantity manually (visual indicator)
│   ├── Override unit price (visual indicator)
│   ├── Override discount (visual indicator)
│   ├── Override final price (visual indicator)
│   ├── Visual markers for overridden fields (e.g., colored border)
│   └── Reset to auto-calculation option
├── Per-product discount override
├── Real-time pricing calculations
├── Category grouping (под/стена/мебели)
├── Product removal/editing
└── Bulk Room Discount Management:
    ├── Change discount for entire room (с потвърждение)
    ├── Apply to all products in room
    ├── Confirmation dialog with affected products count
    ├── Respect individual product overrides
    └── Visual feedback during bulk operations

Room Gallery System:
├── Multiple image upload per room
├── Image preview with thumbnails
├── Image deletion with confirmation
├── Gallery size tracking
├── Images clone with room cloning
└── Separate from variant-level galleries

Room CRUD Operations:
├── Edit room details (inline editing)
├── Delete room (с потвърждение)
├── Clone room (with options)
├── Enable/Disable room discount
└── Bulk operations on room level

Complex Room Cloning:
├── Clone within same variant (room duplication)
├── Clone to other variant in same phase
├── Clone to variant in different phase
├── Cloning options:
│   ├── Include all products vs selected products
│   ├── Include images
│   ├── Include override values
│   ├── Preserve pricing and discounts
│   └── Generate new IDs for cloned entities
```

### **5. SPECIAL BUSINESS SCENARIOS**

### **Product & Installation Split**
```
Typical Scenario: Two-phase project structure
1. Create Phase "Етаж 1 - Продажба" with product variants
2. Create Phase "Етаж 1 - Монтаж" with installation variants
3. Clone room structure from product phase to installation phase
4. Replace products with installation services
5. Generate separate offers or combined offer

Technical Implementation:
- Variant cloning cross-phase
- Product replacement workflow
- Special category for installation services
- Combined offer generation
```

### **Parketsense Pro Integration**
```
Business Rule: Products from Parketsense Pro = services (no discounts)
Implementation:
- Special manufacturer flag: "isService"
- Automatic discount disabling for service products
- UI differentiation (no discount fields shown)
- Special pricing rules in calculations
```

### **Complex Client Scenarios**
```
Client as Architect:
- Auto-architect configuration in project
- Automatic commission calculation
- Special UI indicators
- Commission tracking in all calculations

Multiple Projects per Client:
- Client selection shows project history
- Project templates from previous projects
- Contact reuse across projects
- Historical pricing reference
```

---

## 🚨 CRITICAL TECHNICAL LIMITATIONS & WORKAROUNDS

### **Current Limitations**
1. **Room cross-phase cloning:** Can't clone room directly to different phase
   - **Workaround:** Clone to variant in same phase, then move variant
   
2. **Designer per variant:** Designer must be set per variant, not project-wide
   - **Business Impact:** Repetitive data entry for same designer
   
3. **Montage variant confusion:** Installation variants in same phase as product variants
   - **Workaround:** Move installation variants to separate phase

### **Technical Debt**
1. **Architect restructure:** Moving from variant-level to project-level (IN PROGRESS)
2. **Client-Projects relationship:** Preparing for one-to-many (PLANNED)
3. **Offer versioning:** Need versioning system for offer changes (FUTURE)

---

## 🎯 DEVELOPMENT PRIORITIES FOR CURSOR

### **Immediate (High Priority)**
1. **Complete Phases UI Integration** - Connect backend APIs to frontend components
2. **Architect Commission System** - Full implementation of payment tracking:
   - Phase-level commission display and calculation
   - Payment recording system with date and amount
   - Visual status indicators (Red/Yellow/Green/Blue)
   - Payment history management and validation
   - Real-time balance calculations and status updates
3. **Notes & Documentation System** - Core functionality implementation:
   - Rich text note creation and editing
   - File attachment system with unlimited uploads
   - Built-in PDF and image viewers
   - File download with original filename preservation
   - Note categorization and search functionality
4. **Communication Tracking System** - Project/phase communication management:
   - Communication entry types (calls, meetings, emails, etc.)
   - Timeline view with filtering and search
   - File attachments for communication entries
   - Communication templates and quick actions
5. **Variants Management Polish** - Drag & drop reordering, cloning modals
6. **Rooms & Products Integration** - Real-time calculations, gallery management

### **Next Phase (Medium Priority)**
1. **Advanced File Management Features:**
   - Document version control and history
   - Advanced file search with content indexing
   - File sharing with secure links and permissions
   - Bulk file operations and organization tools
   - CAD file preview capabilities (DWG/DXF)
2. **Outlook Integration Implementation:**
   - Microsoft Graph API setup and authentication
   - Email synchronization with project/phase linking
   - Calendar integration for meeting scheduling
   - Contact synchronization across systems
   - Automated email template generation
   - Meeting notes auto-creation from calendar events
3. **Enhanced Communication Features:**
   - Communication analytics and reporting
   - Automated follow-up reminders
   - Communication templates library
   - Advanced filtering and search capabilities
   - Export communication logs as reports
4. **Offer Generation System** - HTML template generation, preview system
5. **Client Portal** - JWT-protected offer viewing
6. **PDF Generation** - Professional offer documents
7. **Email Integration** - Automated offer sending

### **Future (Lower Priority)**
1. **Advanced Cloning UX** - Direct cross-phase room cloning
2. **Batch Operations** - Multi-room, multi-variant operations
3. **Template System** - Project templates for faster setup
4. **Integration APIs** - External system connections

---

## 💡 SUGGESTED IMPROVEMENTS (Not in Current Knowledge)

### **UX Enhancements**
1. **Visual Workflow Indicators** - Progress bars showing project completion
2. **Smart Defaults** - Auto-populate fields based on project type
3. **Bulk Operations** - Multi-select for rooms/variants/products
4. **Keyboard Shortcuts** - Power user efficiency features
5. **Architect Commission Dashboard:**
   - **Phase-level commission cards** with visual payment status
   - **Color-coded payment indicators:** 🔴 Unpaid → 🟡 Partial → 🟢 Paid → 🔵 Overpaid
   - **Quick payment entry** with date picker and amount validation
   - **Payment history timeline** with edit/delete capabilities
   - **Commission calculator** with real-time updates
   - **Outstanding balance alerts** and payment reminders
   - **Export payment reports** for accounting integration
6. **Enhanced Payment Management:**
   - **Smart payment suggestions** based on phase completion status
   - **Bulk payment processing** for multiple phases
   - **Payment verification workflows** with approval steps
   - **Automated payment notifications** to architects
   - **Integration with accounting systems** for payment tracking
7. **Notes & Documentation System:**
   - **Rich text editor** with formatting, lists, tables
   - **Note templates** for common scenarios (meeting notes, issue reports)
   - **Note categorization** and priority tagging
   - **Advanced search** across all notes and attachments
   - **Note linking** to related projects, phases, variants
   - **Auto-save functionality** to prevent data loss
   - **Note versioning** and edit history tracking
8. **File Management & Visualization:**
   - **Drag & drop file upload** with progress indicators
   - **Built-in PDF viewer** with zoom, search, and annotation tools
   - **Image gallery viewer** with lightbox and slideshow modes
   - **Document preview** for common file types
   - **File organization** with folders and tagging
   - **Advanced file search** by name, type, content, date
   - **File sharing** via secure links with expiration
   - **Version control** for document updates
   - **Bulk file operations** (upload, download, organize)
9. **Communication Management:**
   - **Timeline view** of all communications chronologically
   - **Communication templates** for common scenarios
   - **Quick action buttons** (call, email, meeting)
   - **Reminder system** with automated follow-ups
   - **Participant management** with contact integration
   - **Communication analytics** and reporting
   - **Integration with calendar systems** for scheduling
   - **Mobile-optimized** communication logging
10. **Advanced Integration Features:**
    - **Outlook email synchronization** with thread linking
    - **Calendar integration** for meeting scheduling
    - **Contact synchronization** across systems
    - **Real-time notifications** for important updates
    - **Mobile app integration** for field work
    - **API endpoints** for third-party integrations

### **Business Intelligence**
1. **Profit Margin Tracking** - Real-time profitability analysis
2. **Price Comparison** - Historical pricing trends
3. **Client Insights** - Project history and preferences
4. **Performance Metrics** - Designer/architect success rates

### **Technical Optimizations**
1. **Caching Strategy** - Room calculations, product data
2. **Real-time Updates** - WebSocket for collaborative editing
3. **Mobile App** - Native mobile for field measurements
4. **Offline Support** - Local storage for unstable connections

### **Integration Opportunities**
1. **CAD Integration** - Import room layouts
2. **Inventory Sync** - Real-time stock checking
3. **CRM Integration** - Advanced client management
4. **Accounting Sync** - Automated invoice generation

---

## 📋 CURSOR IMPLEMENTATION CHECKLIST

### **When Working on Projects Module:**
- [ ] Always consider architect commission at project level
- [ ] Implement phase-level architect inclusion toggle
- [ ] **Implement architect commission tracking system:**
  - [ ] Commission calculation display on phase level
  - [ ] Payment recording functionality (date + amount)
  - [ ] Visual payment status indicators (Red/Yellow/Green/Blue)
  - [ ] Payment history management with CRUD operations
  - [ ] Automatic balance calculations (due vs paid)
  - [ ] Payment status enum and business logic
  - [ ] Payment validation (cannot exceed commission due)
  - [ ] Export functionality for payment reports
- [ ] **Implement notes & documentation system:**
  - [ ] Rich text note creation with categories and priorities
  - [ ] File attachment system with unlimited uploads per note
  - [ ] Original filename preservation in database and downloads
  - [ ] Built-in PDF viewer with zoom and navigation
  - [ ] Image gallery viewer with lightbox functionality
  - [ ] File type validation and size limits
  - [ ] Bulk file upload with progress indicators
  - [ ] File search and organization features
  - [ ] Note templates for common scenarios
  - [ ] Advanced search across notes and attachments
- [ ] **Implement communication tracking system:**
  - [ ] Communication entry types (call, meeting, email, etc.)
  - [ ] Timeline view with chronological sorting
  - [ ] Communication templates and quick actions
  - [ ] File attachments for communication entries
  - [ ] Participant management and tracking
  - [ ] Reminder system for follow-ups
  - [ ] Communication analytics and reporting
  - [ ] Filter and search capabilities
- [ ] **Prepare for Outlook integration:**
  - [ ] Microsoft Graph API setup and configuration
  - [ ] OAuth 2.0 authentication flow
  - [ ] Database schema for integration data
  - [ ] Webhook handling for real-time updates
  - [ ] Error handling and retry mechanisms
- [ ] Maintain real-time pricing calculations throughout
- [ ] Support complex cloning scenarios
- [ ] Preserve data integrity during operations
- [ ] Handle drag & drop reordering properly
- [ ] Implement proper error handling and validation
- [ ] Use existing TypeScript interfaces
- [ ] Follow established component patterns
- [ ] Test pricing calculations thoroughly
- [ ] **Test commission and payment calculations thoroughly**
- [ ] **Test file upload, storage, and retrieval thoroughly**
- [ ] **Test communication tracking and search functionality**

### **Key Files to Reference:**
- Backend: `/apps/backend/src/modules/phases|variants|rooms/`
- **Notes Module:** `/apps/backend/src/modules/notes/`
- **Files Module:** `/apps/backend/src/modules/files/`
- **Communication Module:** `/apps/backend/src/modules/communications/`
- **Outlook Integration:** `/apps/backend/src/modules/integrations/outlook/`
- Frontend: `/apps/frontend/src/components/projects/`
- **Notes Components:** `/apps/frontend/src/components/notes/`
- **File Viewer Components:** `/apps/frontend/src/components/file-viewers/`
- **Communication Components:** `/apps/frontend/src/components/communications/`
- Database: `/apps/backend/prisma/schema.prisma`
- Types: `/apps/frontend/src/types/project.ts`
- **File Types:** `/apps/frontend/src/types/files.ts`
- **Communication Types:** `/apps/frontend/src/types/communications.ts`

### **Required API Endpoints (New):**
```typescript
// Notes Management
POST   /api/projects/{id}/notes              // Create project note
POST   /api/phases/{id}/notes               // Create phase note
GET    /api/projects/{id}/notes              // Get project notes
GET    /api/phases/{id}/notes               // Get phase notes
PUT    /api/notes/{id}                      // Update note
DELETE /api/notes/{id}                      // Delete note
POST   /api/notes/{id}/attachments          // Upload file to note
GET    /api/notes/{id}/attachments          // Get note attachments
DELETE /api/attachments/{id}                // Delete attachment

// File Management
POST   /api/files/upload                    // Upload files
GET    /api/files/{id}/download             // Download file with original name
GET    /api/files/{id}/preview              // Preview file (PDF/images)
POST   /api/files/bulk-download             // Bulk download as ZIP
GET    /api/files/search                    // Search files by criteria

// Communication Management
POST   /api/projects/{id}/communications    // Create project communication
POST   /api/phases/{id}/communications      // Create phase communication
GET    /api/projects/{id}/communications    // Get project communications
GET    /api/phases/{id}/communications      // Get phase communications
PUT    /api/communications/{id}             // Update communication
DELETE /api/communications/{id}             // Delete communication
POST   /api/communications/{id}/attachments // Add attachment to communication

// Outlook Integration (Future)
POST   /api/integrations/outlook/auth       // Initiate OAuth flow
POST   /api/integrations/outlook/callback   // Handle OAuth callback
GET    /api/integrations/outlook/status     // Check integration status
POST   /api/integrations/outlook/sync       // Manual sync trigger
GET    /api/integrations/outlook/emails     // Get linked emails
POST   /api/integrations/outlook/meetings   // Create meeting
```

**This document provides complete context for Cursor AI to understand and extend the PARKETSENSE ERP Projects module with full awareness of business requirements, technical architecture, and implementation status.**