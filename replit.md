# PDF PLACE - Educational Resource Management System

## Overview

PDF PLACE is a Flask-based web application designed as an educational resource hub for managing and sharing PDF documents. The platform allows users to upload, categorize, and download educational materials such as NCERT books, previous year questions (PYQs), mock tests, and study notes. The system features user authentication, admin controls, and a modern responsive interface.

## System Architecture

The application follows a traditional Flask MVC (Model-View-Controller) architecture with the following key components:

- **Backend**: Flask web framework with SQLAlchemy ORM
- **Database**: SQLite for development (configurable for PostgreSQL in production)
- **Frontend**: HTML templates with Bootstrap CSS framework and vanilla JavaScript
- **File Storage**: Local filesystem storage for PDF uploads
- **Authentication**: Session-based authentication with password hashing
- **Deployment**: Gunicorn WSGI server with autoscale deployment target

## Key Components

### Database Models (`models.py`)
- **User Model**: Handles user authentication with email/password, admin privileges, and relationship tracking
- **PDFFile Model**: Manages uploaded PDF metadata including filename, category, file size, and upload tracking
- **Download Model**: Tracks download history and analytics with user and file associations
- **Comment Model**: Referenced but not fully implemented for future user feedback features

### Route Handlers (`routes.py`)
- Authentication endpoints for login/logout functionality
- File upload and download management with security validations
- Admin-specific routes for content management
- API endpoints returning JSON responses for AJAX interactions

### Frontend Interface
- **Welcome System**: First-time visitor popup with feature showcase
- **Responsive Design**: Bootstrap-based layout supporting mobile and desktop
- **Dark/Light Theme**: User preference system with localStorage persistence
- **Interactive Elements**: JavaScript-powered UI components and AJAX calls

### File Management
- **Upload Security**: File type validation (PDF only) and secure filename handling
- **Storage Organization**: Dedicated uploads directory with .gitkeep tracking
- **Size Limits**: 50MB maximum file size configuration
- **Download Tracking**: Analytics for popular content and user engagement

## Data Flow

1. **User Registration/Login**: Users authenticate via email/password with automatic account creation
2. **File Upload Process**: Authenticated users upload PDFs with category assignment and metadata storage
3. **Content Discovery**: Browse interface with category filtering and search capabilities
4. **Download Management**: Tracked downloads with user analytics and popularity metrics
5. **Admin Operations**: Special admin user (ak763145918@gmail.com) has enhanced privileges

## External Dependencies

### Python Packages
- **Flask 3.1.1**: Core web framework
- **Flask-SQLAlchemy 3.1.1**: Database ORM integration
- **Gunicorn 23.0.0**: Production WSGI server
- **psycopg2-binary 2.9.10**: PostgreSQL adapter (for production database)
- **email-validator 2.2.0**: Email format validation

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework for responsive design
- **Font Awesome 6.0.0**: Icon library for UI elements

### System Dependencies
- **OpenSSL**: SSL/TLS cryptographic support
- **PostgreSQL**: Database system for production deployment

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

- **Environment**: Python 3.11 with Nix package manager
- **Database**: SQLite for development, PostgreSQL for production (via DATABASE_URL environment variable)
- **File Storage**: Local filesystem storage in uploads directory
- **Session Management**: Secret key configuration via SESSION_SECRET environment variable
- **Proxy Configuration**: ProxyFix middleware for proper header handling in deployment
- **Process Management**: Gunicorn with automatic port binding and reload capabilities

### Configuration Management
- Environment-based configuration for database URLs and secrets
- Automatic database table creation on application startup
- Upload directory creation with proper permissions
- Admin user initialization on first deployment

## Changelog
- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.