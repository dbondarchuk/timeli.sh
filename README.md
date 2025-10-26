# Vivid - Modern Appointment Booking Platform

Vivid is a comprehensive appointment booking and business management platform built with Next.js, featuring a modular architecture with advanced scheduling, communication, and customization capabilities.

## 🚀 Features

### Core Functionality

- **Appointment Booking System** - Advanced scheduling with smart time slot management
- **Customer Management** - Complete customer profiles and communication history
- **Multi-channel Communication** - Email and text message notifications
- **Payment Processing** - Integrated payment solutions with refund capabilities
- **Asset Management** - File storage and management system
- **Template System** - Customizable email and SMS templates
- **Visual builder** - Visual drag-n-drop for pages and email templates
- **Admin Dashboard** - Comprehensive business management interface

### Technical Features

- **Modular Architecture** - Monorepo with shared packages and services
- **Real-time Updates** - Live appointment notifications and status changes
- **Internationalization** - Multi-language support with i18n
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Type Safety** - Full TypeScript implementation
- **Advanced Logging** - Structured logging with function-level context

## 🏗️ Architecture

Vivid is built as a monorepo using Turbo, with the following structure:

```
vivid/
├── apps/
│   └── web/                    # Main Next.js application
├── packages/
│   ├── app-store/             # Connected apps and integrations
│   ├── builder/               # Page builder functionality
│   ├── email-builder/         # Email template builder
│   ├── logger/                # Structured logging system
│   ├── rte/                   # Rich text editor
│   ├── services/              # Core business services
│   ├── types/                 # Shared TypeScript types
│   ├── ui/                    # Reusable UI components
│   └── utils/                 # Utility functions
└── migrations/                # Database migrations
```

### Key Packages

- **@vivid/web** - Main Next.js application with admin dashboard and customer-facing pages
- **@vivid/services** - Core business logic and data access layer
- **@vivid/ui** - Reusable UI components built with Radix UI and Tailwind
- **@vivid/app-store** - Plugin system for third-party integrations
- **@vivid/logger** - Structured logging with module and function context
- **@vivid/builder** - Visual builder
- **@vivid/email-builder** - Drag-and-drop email template builder
- **@vivid/page-builder** - Drag-and-drop page builder

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend

- **Node.js** - Runtime environment
- **MongoDB** - NoSQL database
- **NextAuth.js** - Authentication system
- **Luxon** - Date/time manipulation
- **Pino** - High-performance logging

### Development Tools

- **Turbo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization

## 📋 Prerequisites

- **Node.js** >= 21
- **Yarn** >= 1.22.22
- **MongoDB** (local or cloud instance)
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vivid
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the `apps/web` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/vivid

# Authentication
AUTH_SECRET=your-auth-secret-here
AUTH_PASSWORD=your-admin-password
AUTH_TRUST_HOST=http://localhost:3000
AUTH_URL=http://localhost:3000

# Timezone
TZ=America/New_York
```

### 4. Database Setup

Run database migrations:

```bash
yarn migration:up
```

### 5. Start Development Server

```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## 🎯 First-Time Installation

After starting the application, you'll need to complete the initial setup through the install page:

### 1. Access the Install Page

Navigate to `http://localhost:3000/install` in your browser.

### 2. Complete the Setup Form

Fill out the installation form with your business information:

- **Website Name** - Your business name (minimum 3 characters)
- **Website Title** - The title that appears in browser tabs
- **Email** - Your business email address
- **Website URL** - Your website's URL address

### 3. Installation Process

The installer will automatically:

- ✅ Set up your general business configuration
- ✅ Create a default home page
- ✅ Configure booking settings with default business hours (9 AM - 5 PM, Monday-Friday)
- ✅ Set up schedule configuration
- ✅ Configure header and footer settings
- ✅ Install essential connected apps:
  - **Reminders** - Automated appointment reminders
  - **Follow-ups** - Automated appointment follow-ups
  - **Customer Email Notifications** - Email communication system
  - **Customer Text Message Notifications** - SMS communication system
  - **File System Assets Storage** - Local file storage system
- ✅ Set up default app configurations

### 4. Access Admin Dashboard

Once installation is complete, you can:

- Access the admin dashboard at `http://localhost:3000/admin`
- Log in with the password you set in the `AUTH_PASSWORD` environment variable
- Start customizing your appointment booking system

### 5. Next Steps

After installation, consider:

- **Customizing Business Hours** - Update your schedule in Settings → Schedule
- **Setting Up Payment Processing** - Configure payment methods in Settings → Appointments
- **Customizing Templates** - Create branded email and SMS templates
- **Adding Connected Apps** - Install additional integrations from the App Store
- **Customizing Styling** - Brand your booking pages with custom colors and styling

## Docker Deployment

### Using Docker Compose

1. Build the Docker image:

```bash
docker build -t vivid .
```

2. Start the services:

```bash
docker-compose up -d
```

### Environment Variables for Docker

Update the `docker-compose.yaml` file with your environment variables:

```yaml
environment:
  - MONGODB_URI=mongodb://your-mongodb-host:27017/vivid
  - AUTH_SECRET=your-auth-secret
  - AUTH_PASSWORD=your-admin-password
```

## 📚 Development Guide

### Project Structure

#### Apps

- **web** - Main Next.js application
  - `src/app/` - Next.js App Router pages
  - `src/components/` - Application-specific components
  - `src/middleware/` - Next.js middleware
  - `src/utils/` - Application utilities

#### Packages

- **services** - Core business logic
  - Database services
  - Configuration management
  - Communication services
- **ui** - Reusable UI components
  - Form components
  - Data tables
  - Modals and dialogs
- **app-store** - Plugin system
  - Connected apps
  - Integration services
- **logger** - Structured logging
  - Module and function context
  - Error tracking

### Available Scripts

```bash
# Development
yarn dev          # Start development server
yarn build        # Build all packages
yarn start        # Start production server

# Code Quality
yarn lint         # Run ESLint
yarn format       # Format code with Prettier

# Database
yarn migration     # Run migrations
yarn migration:up  # Apply migrations
yarn migration:down # Rollback migrations
```

### Adding New Features

1. **Create new pages** in `apps/web/src/app/`
2. **Add components** in `apps/web/src/components/`
3. **Create services** in `packages/services/src/`
4. **Add types** in `packages/types/src/`
5. **Update UI components** in `packages/ui/src/components/`

### Logging

Vivid uses a structured logging system with function-level context:

```typescript
import { getLoggerFactory } from "@vivid/logger";

// In a service class
protected readonly loggerFactory = getLoggerFactory("ServiceName");

// In a method
const logger = this.loggerFactory("methodName");
logger.info("Operation completed", { data });
logger.error("Operation failed", { error });
```

## 🔌 Connected Apps

Vivid supports various integrations through its app store:

### Communication Apps

- **User Notifications** - Email / text message user notifications about appointments
- **Customer Notifications** - Automated customer communications via email / text message

### Calendar Integrations

- **Google Calendar** - Sync with Google Calendar
- **Outlook Calendar** - Microsoft Outlook integration
- **CalDAV** - Standard calendar protocol support
- **ICS Export** - Calendar events via ICS link

### Storage Solutions

- **File System Storage** - Local file storage
- **S3 Storage** - Amazon S3 integration

### Payment Processing

- **PayPal** - PayPal payment integration

### Utilities

- **Reminders** - Automated reminder system
- **Follow-ups** - Automated follow-up system
- **Log Cleanup** - Automated communication log clean-up management
- **Weekly Schedule** - Custom per week schedule
- **Busy events** - Custom schedule blocking blocks

## 🎨 Customization

### Styling

- Customize colors and themes in `packages/tailwind-config/`
- Modify global styles in `apps/web/src/app/globals.css`
- Use CSS variables for dynamic theming

### Templates

- Create custom email templates using the email builder
- Build custom pages with the visual page builder
- Customize appointment booking forms

### Integrations

- Add new connected apps in `packages/app-store/src/apps/`
- Implement custom services in `packages/services/src/`
- Extend the UI component library in `packages/ui/src/components/`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

### Testing Strategy

- **Unit Tests** - Test individual functions and components
- **Integration Tests** - Test service interactions
- **E2E Tests** - Test complete user workflows

## 📦 Deployment

### Production Build

```bash
# Build the application
yarn build

# Start production server
yarn start
```

### Environment Configuration

Set up production environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-mongodb
AUTH_SECRET=your-production-secret
AUTH_PASSWORD=your-production-password
```

### Performance Optimization

- Enable Next.js optimizations
- Configure CDN for static assets
- Set up database connection pooling
- Enable caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use the established logging patterns
- Follow the component design system
- Document new features and APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- Check the [documentation](docs/)
- Search existing [issues](../../issues)
- Create a new [issue](../../issues/new)

### Common Issues

#### Database Connection

- Ensure MongoDB is running and accessible
- Check connection string format
- Verify network connectivity

#### Authentication Issues

- Verify AUTH_SECRET is set correctly
- Check AUTH_TRUST_HOST configuration
- Ensure proper redirect URLs

#### Build Errors

- Clear node_modules and reinstall dependencies
- Check TypeScript compilation errors
- Verify package.json dependencies

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and releases.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
