# Saveur - Recipe Meal Planner

Saveur is a JavaScript full-stack recipe web application built for the exam project:
frontend React, backend Node.js/Express, MongoDB with Mongoose, REST APIs, and authenticated users.

## Main Features

- Email/password authentication with bcrypt password hashing and JWT sessions
- Recipe catalog with filters by category, difficulty and cooking time
- Personal recipe creation with ingredients, quantities, units and preparation steps
- User favorites and private/public recipe ownership
- Weekly meal planner by authenticated user
- Smart grocery list generated from planned recipes
- Dashboard counters for recipes, favorites, planned meals and grocery items

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Security: bcryptjs, JSON Web Tokens

## MongoDB Collections

The project uses more than six related NoSQL collections:

- `users`
- `categories`
- `ingredients`
- `recipes`
- `mealplans`
- `favorites`
- `shoppinglists`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Make sure MongoDB is running locally, or update `MONGO_URI` in `.env`.

4. Start the backend API:

```bash
npm run api
```

5. Start the frontend in another terminal:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend health check: `http://localhost:5000/api/health`

## Demo Login

The backend seeds demo data automatically when the database is empty.

- Email: `chef@saveur.local`
- Password: `saveur123`

Admin demo:

- Email: `admin@saveur.local`
- Password: `admin12345`

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `GET /api/ingredients`
- `GET /api/recipes`
- `POST /api/recipes`
- `GET /api/recipes/mine`
- `GET /api/favorites`
- `POST /api/favorites/:recipeId/toggle`
- `GET /api/meal-plans`
- `POST /api/meal-plans`
- `GET /api/groceries`
- `GET /api/dashboard`

## Project Notes

The original mobile/Firebase prototype files were removed because the exam brief requires a web application using JavaScript, Node.js/Express and MongoDB.
