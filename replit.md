# IPEACE Professional Consulting Website

## Overview

This is a full-stack web application for IPEACE, a professional consulting firm specializing in Zimbabwe's business landscape. The application features a modern React frontend with an Express.js backend, incorporating AI-powered chatbot functionality, multilingual support (English/Shona), and comprehensive business consulting services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful endpoints for contact forms and AI chat
- **Session Management**: Stateless design with session IDs for chat continuity
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Data Storage
- **Database**: PostgreSQL configured with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema evolution
- **In-Memory Fallback**: MemStorage class for development without database
- **Data Validation**: Zod schemas for runtime type checking

## Key Components

### Authentication & Authorization
- Currently using basic session-based architecture
- User schema defined but not actively implemented in current routes
- Future-ready for authentication implementation

### AI Integration
- OpenAI GPT-4o integration for business consulting chatbot
- Specialized prompts for Zimbabwe business law and regulations
- JSON-structured responses with confidence scoring
- Session-based chat history tracking

### Internationalization
- i18next implementation for English and Shona languages
- Complete translation coverage for all UI elements
- Language toggle component in header
- Fallback language support (English as default)

### Contact Management
- Form validation using react-hook-form with Zod resolvers
- Email notification system (currently console-based for development)
- Auto-reply functionality for customer engagement
- Data persistence with audit trail (creation timestamps)

### UI/UX Design
- Responsive design with mobile-first approach
- IPEACE brand colors: Primary blue (#2563eb), Accent yellow (#eab308)
- Smooth scrolling navigation between sections
- Consistent design system using shadcn/ui components

## Data Flow

1. **User Interaction**: Users interact with React components in the browser
2. **API Requests**: Frontend makes HTTP requests to Express.js backend via TanStack Query
3. **Data Processing**: Backend validates requests using Zod schemas
4. **Business Logic**: Controllers handle chat AI integration and contact form processing
5. **Data Persistence**: Information stored in PostgreSQL via Drizzle ORM
6. **Response**: JSON responses sent back to frontend with proper error handling

### Chat Flow
1. User sends message through chatbot widget
2. Message validated and sent to `/api/chat` endpoint
3. Backend forwards to OpenAI API with Zimbabwe business context
4. AI response stored with session ID for conversation continuity
5. Response displayed in chat interface with confidence indicator

### Contact Flow
1. User fills contact form with validation
2. Form data sent to `/api/contact` endpoint
3. Data stored in database with timestamp
4. Email notifications triggered (development: console logs)
5. Success confirmation returned to user

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: react, react-dom, react-router (wouter)
- **Backend**: express, cors for cross-origin requests
- **Database**: @neondatabase/serverless, drizzle-orm, drizzle-kit
- **AI Services**: openai package for GPT integration
- **Validation**: zod for runtime type checking

### UI/UX Dependencies
- **Component Library**: @radix-ui/* for accessible UI primitives
- **Styling**: tailwindcss, class-variance-authority for component variants
- **Forms**: react-hook-form, @hookform/resolvers for form management
- **Icons**: lucide-react for consistent iconography

### Development Dependencies
- **Build Tools**: vite, esbuild for production builds
- **Type Checking**: typescript, tsx for development server
- **Internationalization**: i18next, react-i18next for multilingual support

## Deployment Strategy

### Development Environment
- Vite dev server with hot module replacement
- Express server with tsx for TypeScript execution
- Replit-specific plugins for development banner and cartographer
- Environment variable management for API keys

### Production Build
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Assets**: Static assets served from build directory
4. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: NODE_ENV=development with local database
- **Production**: NODE_ENV=production with PostgreSQL connection
- **API Keys**: OpenAI API key via environment variables
- **Database**: DATABASE_URL for PostgreSQL connection string

### Key Architectural Decisions

1. **Drizzle over Traditional ORMs**: Chosen for type safety and SQL-like syntax while maintaining TypeScript integration
2. **TanStack Query**: Selected for robust caching, background updates, and excellent developer experience
3. **Wouter over React Router**: Lightweight routing solution suitable for single-page application needs
4. **Memory Storage Fallback**: Enables development without database setup while maintaining production readiness
5. **OpenAI Integration**: Leverages cutting-edge AI for specialized Zimbabwe business consulting knowledge
6. **Bilingual Support**: Critical for Zimbabwe market with English and Shona language support