# Overview

This project is an AI-first SEO optimization platform designed for 2025+ content discovery. It's a full-stack web application that helps content creators optimize their content for modern AI search engines like Google SGE, Perplexity, Bing Copilot, ChatGPT, and other emerging AI platforms. The platform provides a comprehensive 96+ point optimization checklist, automated Schema.org markup generation, and voice search optimization capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules for modern JavaScript features
- **API Design**: RESTful APIs with structured error handling and request/response logging
- **Content Optimization**: Custom SEO optimization service with AI-ready content processing
- **Middleware**: Custom logging middleware for API monitoring and debugging

## Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for scalable cloud database hosting
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **In-Memory Storage**: Fallback memory storage implementation for development and testing

## Authentication and Authorization
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple
- **User Model**: Simple username/password authentication with UUID-based user identification
- **Security**: Planned implementation with secure session handling and user management

## Content Optimization Engine
- **SEO Services**: Comprehensive SEO metadata generation including title optimization, meta descriptions, and keyword extraction
- **Schema Generation**: Automated Schema.org markup creation for Website, Organization, FAQ, and other structured data types
- **AI Optimization**: Content processing for AI discovery with conversational markers, Q&A formatting, and voice search optimization
- **Checklist System**: 96+ point optimization checklist covering meta tags, Open Graph, structured data, Core Web Vitals, and AI assistant compatibility

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling and automatic scaling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect support

## Frontend Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives for building design systems
- **TanStack React Query**: Powerful data synchronization for React applications
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Wouter**: Minimalist routing library for React applications

## Development Tools
- **Vite**: Fast build tool with HMR and modern JavaScript features
- **TypeScript**: Static type checking for enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins for cartographer and dev banner

## Content Processing
- **Schema.org**: Structured data markup standards for search engine optimization
- **AI Engine APIs**: Integration points for Google SGE, Perplexity, Bing Copilot, and other AI platforms
- **SEO Tools**: Meta tag generation, Open Graph optimization, and Core Web Vitals monitoring

## Third-party Integrations
- **Google Fonts**: Inter font family for consistent typography
- **Unsplash**: Stock photography for hero images and visual content
- **Social Media Platforms**: Open Graph and Twitter Card optimization for enhanced social sharing