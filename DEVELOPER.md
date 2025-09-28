# 🌐 ISP Management Backend System



<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-16.x+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

**BanoQabil Web Development 3 - Final Capstone Project**

*A comprehensive backend solution for Internet Service Provider management*

**Team:** Okasha Nadeem • Umair • Noman

---

### 🚀 Quick Navigation

| [📖 Overview](#-project-overview) | [🎯 Problem](#-problem-statement) | [🏗️ Architecture](#️-system-architecture) | [⚡ Features](#-core-features) |
|---|---|---|---|
| [🛠️ Tech Stack](#️-technology-stack) | [📡 API Docs](#-api-documentation) | [📂 Structure](#-project-structure) | [🚀 Setup](#-setup-instructions) |

</div>

---

## 📖 Project Overview

The **ISP Management Backend System** is a sophisticated, production-ready backend solution designed to address operational challenges faced by Internet Service Providers (ISPs) in Pakistan. This system implements a hierarchical management structure enabling efficient branch coordination, customer administration, bandwidth distribution, and comprehensive business analytics.

### 🎓 Academic Context
This project serves as our final capstone for **BanoQabil Web Development 3**, demonstrating mastery of all course concepts while incorporating industry-standard practices and technologies.

### 🌟 Project Vision
To digitally transform traditional ISP operations by providing an automated, scalable, and intelligent management platform that reduces operational costs, improves service delivery, and enables data-driven business decisions.

---

## 🎯 Problem Statement

### Current Challenges in Pakistani ISP Industry

**📊 Operational Inefficiencies:**
- Manual customer subscription tracking leading to revenue loss
- Inefficient bandwidth allocation causing service quality issues
- Lack of centralized monitoring across multiple branches
- Poor communication between headquarters and local offices

**📈 Management Issues:**
- Absence of real-time performance tracking
- Difficulty in identifying profitable vs. unprofitable branches
- Manual processes prone to human error
- Limited business intelligence for strategic planning

**👥 Customer Service Problems:**
- Delayed response to subscription renewals and service issues
- Inconsistent service quality across different locations
- Poor documentation and customer history management
- Lack of automated notification systems

### 💡 Our Solution Impact
Our system addresses these challenges by providing automated workflows, real-time monitoring, centralized management, and comprehensive analytics, ultimately improving operational efficiency by an estimated **60-70%**.

---

## 🏗️ System Architecture

### 👥 User Hierarchy & Roles

```
┌─────────────────────┐
│    Super Admin      │  ← Headquarters Level
│   (System Owner)    │
└─────────┬───────────┘
          │
    ┌─────▼─────┐
    │  Branch   │  ← Regional Level
    │   Admin   │
    └─────┬─────┘
          │
    ┌─────▼─────┐
    │ Customers │  ← End Users
    └───────────┘
```

### 🔑 Role Capabilities

**Super Admin:**
- 🏢 Branch Management: Create, monitor, and optimize branch operations
- 📊 Resource Allocation: Distribute bandwidth quotas based on demand analytics
- 📈 Strategic Overview: Access company-wide performance metrics and trends
- 🔧 Issue Resolution: Handle escalated technical and administrative problems
- 📊 Business Intelligence: Utilize advanced analytics for expansion planning

**Branch Admin:**
- 👥 Customer Lifecycle: Manage complete customer journey from onboarding to service
- 🛠️ Service Delivery: Process subscriptions, renewals, and technical support requests
- 📊 Local Analytics: Monitor branch-specific performance and customer satisfaction
- 🌐 Resource Management: Optimize local bandwidth distribution and service quality
- 📞 Communication Hub: Coordinate between customers and headquarters

---

## ⚡ Core Features

### 🔐 Security & Authentication
- **JWT-Based Authentication** with role-specific access levels
- **Advanced Password Security** using bcrypt with salt rounds
- **Role-Based Access Control (RBAC)** preventing unauthorized access
- **Input Validation & Sanitization** protecting against injection attacks
- **Session Management** with secure token refresh mechanisms

### 🌐 Branch Management System
- **Multi-Branch Architecture** supporting unlimited regional offices
- **Geolocation Integration** for service area mapping and optimization
- **Dynamic Resource Allocation** with real-time bandwidth distribution
- **Performance Monitoring** with branch comparison and ranking systems
- **Automated Reporting** for operational efficiency tracking

### 👥 Customer Management Platform
- **Comprehensive Customer Profiles** with complete service history
- **Document Management System** with secure file upload and storage
- **Subscription Lifecycle Management** from signup to service termination
- **Landmark-Based Organization** for efficient field service coordination
- **Multi-Package Support** with flexible pricing and feature tiers

### 📊 Analytics & Reporting Suite
- **Real-Time Performance Tracking** across all branches and time periods
- **Advanced Analytics** with trend analysis and forecasting capabilities
- **Customer Usage Monitoring** with detailed bandwidth consumption reports
- **Service History Management** with detailed activity records
- **Business Intelligence Dashboard** for data-driven decisions

### 🤖 Automation & Intelligence
- **Cron Job Scheduler** for daily subscription monitoring and alerts
- **Email Notification System** with customizable templates and triggers
- **Automated Renewal Reminders** preventing service interruptions
- **System Health Monitoring** with proactive issue detection
- **Business Process Automation** reducing operational overhead

### 🌱 Seed Data Management
- **Pre-configured Data Sets** for quick system deployment
- **Static Resource Allocation** with hardcoded bandwidth distributions
- **Sample Branch & Customer Data** for testing and demonstration
- **Package Templates** with predefined service tiers
- **Default Admin Accounts** for immediate system access

---

## 🛠️ Technology Stack

### Backend Framework
```javascript
Node.js 16.x+      // Runtime Environment
Express.js 4.18+   // Web Application Framework
```

### Database & ODM
```javascript
MongoDB 4.4+       // NoSQL Database
Mongoose 6.0+      // Object Document Mapper
```

### Authentication & Security
```javascript
jsonwebtoken       // JWT Implementation
bcrypt            // Password Hashing
joi               // Input Validation
helmet            // Security Headers
```

### File Management & Communication
```javascript
multer            // File Upload Handling
nodemailer        // Email Service Integration
```

### Automation & Utilities
```javascript
node-cron         // Scheduled Task Management
moment            // Date/Time Manipulation
lodash            // Utility Functions
```

### Development Tools
```javascript
nodemon           // Development Server
dotenv            // Environment Configuration
cors              // Cross-Origin Resource Sharing
```

---

## 🗄️ Database Design

### Core Collections Schema

#### SuperAdmin Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: "superadmin",
  permissions: [String],
  lastLogin: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Branch Collection
```javascript
{
  _id: ObjectId,
  name: String,
  location: {
    address: String,
    city: String,
    coordinates: [Number] // [longitude, latitude]
  },
  bandwidth: {
    allocated: Number,    // Total allocated GB (hardcoded)
    used: Number,         // Currently used GB
    remaining: Number     // Available GB
  },
  admin: ObjectId (ref: Admin),
  customerCount: Number,
  status: String,       // active, inactive, maintenance
  createdAt: Date,
  updatedAt: Date
}
```

#### Customer Collection
```javascript
{
  _id: ObjectId,
  personalInfo: {
    name: String,
    cnic: String (unique),
    phone: String,
    email: String,
    address: String,
    landmark: String
  },
  subscription: {
    package: ObjectId (ref: Package),
    startDate: Date,
    endDate: Date,
    status: String,      // active, expired, suspended
    autoRenewal: Boolean
  },
  branch: ObjectId (ref: Branch),
  bandwidth: {
    allocated: Number,   // Package bandwidth (hardcoded)
    used: Number,        // Current usage
    resetDate: Date      // Monthly reset
  },
  documents: [{
    type: String,        // cnic, address_proof
    filename: String,
    uploadDate: Date,
    verified: Boolean
  }],
  serviceHistory: [{
    action: String,      // created, renewed, suspended
    date: Date,
    performedBy: ObjectId
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📂 Project Structure

```
isp-management-backend/
│
├── controllers/                       # Business logic for each module
│   ├── authController.js              # Authentication & JWT handling
│   ├── superAdminController.js        # Branch management & analytics
│   ├── adminController.js             # Customer & subscription management
│   ├── customerController.js          # Customer profile & service history
│   ├── notificationController.js      # Email notifications & alerts
│   └── systemController.js            # Health checks & automation
│
├── validators/                        # Input validation schemas
│   ├── authValidator.js               # Authentication validation
│   ├── branchValidator.js             # Branch CRUD validation
│   ├── customerValidator.js           # Customer management validation
│   └── packageValidator.js            # Package validation schemas
│
├── models/                            # MongoDB schemas (Mongoose)
│   ├── userModel.js                   # SuperAdmin/Admin authentication
│   ├── branchModel.js                 # Branch management schema
│   ├── customerModel.js               # Customer & subscription schema
│   ├── packageModel.js                # Internet packages schema
│   └── notificationModel.js           # Notifications log schema
│
├── routes/                            # API route definitions
│   ├── authRoutes.js                  # /api/auth → authentication
│   ├── superAdminRoutes.js            # /api/superadmin → branch management
│   ├── adminRoutes.js                 # /api/admin → customer management
│   ├── customerRoutes.js              # /api/customers → customer operations
│   └── notificationRoutes.js          # /api/notifications → messaging
│
├── middlewares/                       # Express middlewares
│   ├── authMiddleware.js              # JWT validation & user attachment
│   ├── roleMiddleware.js              # Role-based access control
│   ├── validateMiddleware.js          # Input validation middleware
│   ├── uploadMiddleware.js            # File upload configuration
│   ├── rateLimitMiddleware.js         # API rate limiting
│   └── errorMiddleware.js             # Global error handling
│
├── config/                            # Configuration files
│   ├── db.js                          # MongoDB connection setup
│   ├── email.js                       # Nodemailer configuration
│   ├── cron.js                        # Cron jobs for automation
│   └── env.js                         # Environment variables loader
│
├── services/                          # Helper services
│   ├── emailService.js                # Email notification service
│   ├── reportService.js               # Analytics & reporting service
│   └── backupService.js               # System backup service
│
├── seeds/                             # Database seed data
│   ├── superAdminSeed.js              # Default super admin accounts
│   ├── branchSeed.js                  # Sample branches with hardcoded data
│   ├── packageSeed.js                 # Internet package templates
│   ├── customerSeed.js                # Demo customer accounts
│   └── seedRunner.js                  # Seed execution script
│
├── utils/                             # Utility functions
│   ├── logger.js                      # Application logging system
│   ├── response.js                    # Standard API response format
│   └── constants.js                   # Application constants
│
├── postman-collection/                # API testing collection
│   └── isp-api.postman_collection.json
│
├── uploads/                           # Customer document storage
│
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore configuration
├── package.json                       # Dependencies & scripts
├── README.md                          # Project documentation
└── server.js                          # Application entry point
```

---

## 📡 API Documentation

### Base URL Structure
```
Development: http://localhost:5000/api
```

### Authentication Header
```javascript
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Standard Response Format
```javascript
{
  "success": boolean,
  "message": string,
  "data": object | array | null,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  } | null,
  "error": string | null,
  "timestamp": string
}
```

### API Endpoints Overview

#### 🔐 Authentication Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/login` | User authentication | Public |
| POST | `/auth/logout` | User logout | Authenticated |
| POST | `/auth/refresh` | Token refresh | Authenticated |
| GET | `/auth/profile` | Get user profile | Authenticated |

#### 👑 Super Admin Endpoints
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/superadmin/dashboard` | Dashboard analytics | - |
| GET | `/superadmin/branches` | List all branches | `?page&limit&city` |
| POST | `/superadmin/branches` | Create new branch | Branch data |
| PUT | `/superadmin/branches/:id` | Update branch | Branch ID |
| DELETE | `/superadmin/branches/:id` | Delete branch | Branch ID |
| POST | `/superadmin/admins` | Create branch admin | Admin data |
| GET | `/superadmin/analytics` | System analytics | `?period&branch` |

#### 🏢 Branch Admin Endpoints
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/admin/dashboard` | Branch dashboard | - |
| GET | `/admin/customers` | List customers | `?page&limit&status&search` |
| POST | `/admin/customers` | Add new customer | Customer data |
| PUT | `/admin/customers/:id` | Update customer | Customer ID |
| POST | `/admin/customers/:id/documents` | Upload documents | File upload |
| POST | `/admin/tickets` | Report issue | Ticket data |

#### 👥 Customer Management Endpoints
| Method | Endpoint | Description | Query Parameters |
|--------|----------|-------------|------------------|
| GET | `/customers` | List customers | `page, limit, status, branch, search` |
| POST | `/customers` | Create customer | - |
| GET | `/customers/:id` | Get customer details | - |
| PUT | `/customers/:id` | Update customer | - |
| POST | `/customers/:id/suspend` | Suspend service | - |
| POST | `/customers/:id/activate` | Activate service | - |

#### 📊 Analytics & Reporting Endpoints
| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/analytics/customers` | Customer analytics | `branch, period` |
| GET | `/analytics/bandwidth` | Bandwidth usage | `branch, period` |
| GET | `/analytics/performance` | Performance metrics | `branch, metric` |
| GET | `/reports/monthly` | Monthly report | `month, year, branch` |
| GET | `/reports/export` | Export data | `format, type` |

---

## 🌱 Seed Data Management

Our system uses pre-configured seed data for quick deployment and testing. All bandwidth allocations and resources are statically defined.

### Seed Data Structure

#### 🏢 Branch Seed Data
```javascript
// branches with hardcoded bandwidth allocation
{
  name: "Lahore Main Branch",
  location: {
    address: "Main Boulevard, Gulberg",
    city: "Lahore",
    coordinates: [74.3587, 31.5204]
  },
  bandwidth: {
    allocated: 1000, // 1TB hardcoded
    used: 0,
    remaining: 1000
  },
  status: "active"
}
```

#### 📦 Package Seed Data
```javascript
// Predefined internet packages
{
  name: "Basic Plan",
  speed: "10 Mbps",
  bandwidth: 50, // 50GB hardcoded
  price: 2000,
  features: ["24/7 Support", "Basic Speed"],
  isActive: true
}
```

#### 👥 Customer Seed Data
```javascript
// Sample customers with hardcoded allocations
{
  personalInfo: {
    name: "Ahmed Hassan",
    cnic: "35201-1234567-8",
    phone: "+92-300-1234567",
    email: "ahmed@example.com"
  },
  bandwidth: {
    allocated: 50, // Package bandwidth (hardcoded)
    used: 15,
    resetDate: Date
  }
}
```

### Running Seed Data

```bash
# Run all seed files
npm run seed

# Run specific seed
npm run seed:branches
npm run seed:packages
npm run seed:customers

# Clear and reseed database
npm run seed:fresh
```

---

## 🚀 Setup Instructions

### Prerequisites
```bash
Node.js >= 16.0.0
MongoDB >= 4.4.0
Git >= 2.30.0
npm >= 8.0.0
```

### Installation Steps

#### 1️⃣ Repository Setup
```bash
# Clone the repository
git clone https://github.com/username/isp-management-backend.git
cd isp-management-backend

# Install dependencies
npm install
```

#### 2️⃣ Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Configure .env file
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/isp_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10000000
```

#### 3️⃣ Development Server
```bash
# Start development server
npm run dev

# Server runs on: http://localhost:5000
# API endpoints: http://localhost:5000/api
```

### Available Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seeds/seedRunner.js"
  }
}
```

---

## 📋 Development Modules

### **Module 1: Foundation & Setup** ⚙️
- Project architecture & environment setup
- Express.js server & MongoDB connection
- Folder structure & configuration
- Git workflow & documentation

### **Module 2: Authentication & Security** 🔐
- JWT authentication & refresh tokens
- Role-based access control
- Password hashing & validation
- Security middleware & rate limiting

### **Module 3: Super Admin Management** 👑
- Branch CRUD operations & mapping
- Bandwidth allocation & tracking
- Admin assignment system
- Analytics dashboard

### **Module 4: Branch Admin & Customer Management** 👥
- Customer CRUD operations
- Subscription management & renewals
- Document upload & storage
- Package management & service history

### **Module 5: Analytics & Reporting** 📊
- Performance tracking & analysis
- Customer usage monitoring
- Branch performance comparison
- Business intelligence tools

### **Module 6: Automation & Notifications** 🤖
- Cron jobs for subscription monitoring
- Email notification system
- System health monitoring
- Automated reports

### **Module 7: Seed Data & Static Resources** 🌱
- Database seed data implementation
- Hardcoded resource allocation
- Sample data for testing
- Package templates & defaults

### **Module 8: Testing & Documentation** 🧪
- Unit & integration tests
- API documentation & Postman collection
- Performance testing
- Security audit

### **Module 9: Integration & Optimization** 🎯
- Cross-module integration
- Performance optimization
- Bug fixing & code refactoring
- Deployment preparation

### **Module 10: Frontend Planning** 🎨
- React.js architecture planning
- Dashboard design specifications
- API integration strategy
- UI/UX design guidelines

---

## 🎓 Learning Outcomes & Course Integration

### Complete BanoQabil Web Dev 3 Coverage ✅

**Backend Development Mastery:**
- ✅ Node.js & Express.js architecture
- ✅ RESTful API design & implementation
- ✅ MongoDB & Mongoose ODM
- ✅ JWT authentication & security
- ✅ File upload & data management

**Advanced Features Implementation:**
- ✅ Role-based access control
- ✅ Middleware development
- ✅ Cron job automation
- ✅ Email integration
- ✅ Error handling & validation

**Database Design Excellence:**
- ✅ Schema design & relationships
- ✅ Aggregation pipelines
- ✅ Query optimization
- ✅ Data seeding & migration
- ✅ Performance tuning

### Beyond Course Curriculum 🚀

**Industry-Standard Practices:**
- Production-ready architecture
- Comprehensive testing strategies
- Professional documentation
- Security best practices
- Scalable system design

**Real-World Problem Solving:**
- Business process automation
- Customer service optimization
- Resource management systems
- Performance analytics
- Operational efficiency tools

---

## 🏆 Team

<div align="center">

**Built with ❤️ by Okasha Nadeem, Umair, and Noman**

*Transforming Pakistan's ISP Industry Through Technology*

</div>