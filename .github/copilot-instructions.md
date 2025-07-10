<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Reimburse BBM Backend API - Copilot Instructions

## Project Overview
This is a Node.js Express backend API for a fuel reimbursement application using Supabase as the backend-as-a-service. The project follows a modular architecture with clear separation of concerns.

## Architecture Guidelines
- **Modular Structure**: Routes → Controllers → Database
- **Middleware**: Authentication and authorization handled via middleware
- **Error Handling**: Consistent error response format across all endpoints
- **File Upload**: Handled via multer with Supabase Storage integration

## Code Style Preferences
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks
- Follow RESTful API conventions
- Use descriptive variable and function names in Indonesian when appropriate
- Maintain consistent response format: `{ success: boolean, message: string, data?: any }`

## Supabase Integration
- Use `supabaseAdmin` for operations that bypass RLS (Row Level Security)
- Use regular `supabase` client for user-level operations
- Always handle Supabase errors properly
- Implement proper file upload to Supabase Storage

## Security Considerations
- Always validate user input
- Check authentication via `checkAuth` middleware
- Verify admin access via `checkAdmin` middleware
- Implement proper file type validation for uploads
- Use environment variables for sensitive configuration

## Database Operations
- Use proper SQL joins when fetching related data
- Implement pagination for large datasets
- Add proper indexes for performance
- Handle foreign key constraints properly

## API Response Standards
- Always return consistent JSON responses
- Include appropriate HTTP status codes
- Provide clear error messages in Indonesian
- Include relevant data in success responses

## File Organization
- Controllers handle business logic only
- Routes define endpoints and apply middleware
- Middleware handles cross-cutting concerns
- Config files handle external service setup
