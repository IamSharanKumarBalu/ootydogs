# My App

An e-commerce marketplace built with Node.js, Express, MongoDB, and Next.js.

## Project Structure

- `backend/` — Express.js REST API
- `frontend/` — Next.js web application  
- `mobile/` — React Native (Expo) mobile app

## Getting Started

### Prerequisites
- Node.js 22+
- MongoDB

### Installation

```bash
# Install all dependencies
npm run install:all

# Configure the backend
cp backend/config/config.env.example backend/config/config.env
# Edit config.env with your values

# Start development servers
npm run dev
```

## Configuration

Copy `backend/config/config.env.example` to `backend/config/config.env` and fill in:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — a secure random string
- `SMTP_*` — email server credentials (optional)
