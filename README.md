# Gym Management System

A full-stack web application for managing gym memberships and clients, built with React, Node.js, and MongoDB.

## Features

- User authentication and authorization
- Client management (CRUD operations)
- Search and filter clients
- Pagination
- Sorting by multiple fields
- Membership expiration tracking
- Dashboard with key metrics
- Responsive design

## Tech Stack

### Frontend
- React
- TypeScript
- TanStack Query for data fetching
- Axios for API calls
- Tailwind CSS for styling
- Shadcn UI components
- React Router for navigation
- Zustand for state management

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT for authentication
- TypeScript

## Getting Started

### Prerequisites
- Node.js (v22 or higher)
- MongoDB
- npm or bun

### Installation

1. Clone the repository
2. Install dependencies for both frontend and backend:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   # or
   bun install

   # Install backend dependencies
   cd ../backend
   npm install
   # or
   bun install
   ```

3. Set up environment variables:

   Frontend (.env):
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

   Backend (.env):
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/gym_management
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d
   ```

4. Start MongoDB service on your machine

5. Run the development servers:

   Frontend:
   ```bash
   bun run start-frontend
   # or
   npm run start-frontend
   ```

   Backend:
   ```bash
   cd backend
   bun run start-backend
   # or
   npm run start-backend
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

### Default Admin Account
