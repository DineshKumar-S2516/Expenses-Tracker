# FinTrack Expense Tracker

Complete full-stack expense tracker with JWT auth, user-specific data isolation, category budgets, savings goals, recurring bills, linked payments, and a dark dashboard UI.

## Project Structure

```text
.
+-- backend/                  Spring Boot API
|   +-- src/main/java/com/fintrack
|   |   +-- config/           Security and API exception config
|   |   +-- controller/       REST controllers for every module
|   |   +-- dto/              Request and response contracts
|   |   +-- model/            JPA entities and enums
|   |   +-- repository/       Spring Data JPA repositories
|   |   +-- security/         JWT filter, JWT service, user details service
|   |   +-- service/          Business logic and user isolation checks
|   +-- src/main/resources/application.yml
+-- frontend/                 Vite React app
|   +-- src/api/              Axios API client
|   +-- src/components/       Layout, protected routes, shared UI
|   +-- src/context/          Auth and toast providers
|   +-- src/pages/            Dashboard, expenses, income, budgets, bills, payments, categories
|   +-- src/styles.css        Responsive dark dashboard design
+-- database/schema.sql       MySQL schema
```

## Backend APIs

All module APIs are secured with `Authorization: Bearer <jwt>` except auth:

- `POST /api/auth/signup`, `POST /api/auth/login`
- `GET /api/dashboard`
- `GET/POST/PUT/DELETE /api/expenses`
- `GET/POST/PUT/DELETE /api/income`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/budgets`
- `GET/POST/PUT/DELETE /api/savings-goals`
- `GET/POST/PUT/DELETE /api/bills`, `PATCH /api/bills/{id}/paid`
- `GET/POST/PUT/DELETE /api/payments`

## Run Guide

1. Create the MySQL database and tables:

```bash
mysql -u root -p < database/schema.sql
```

2. Update database credentials in `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    username: root
    password: your_password
```

3. Start the backend:

```bash
cd backend
mvn spring-boot:run
```

4. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

5. Open the app:

```text
http://localhost:5173
```

On signup, the backend creates starter categories for the user. All expenses, income, categories, budgets, savings goals, bills, and payments are scoped to the authenticated user.

## Production Notes

- Replace `app.jwt.secret` with a long random secret before deployment.
- Prefer environment variables for MySQL credentials and JWT settings.
- Keep `spring.jpa.hibernate.ddl-auto=validate` in production after applying `database/schema.sql`.
- Configure CORS allowed origins for the production frontend domain.

## Render, Supabase, And Vercel Deployment

Use Render for the Spring Boot backend, Supabase for PostgreSQL, and Vercel for the Vite React frontend.

### Push To GitHub

```bash
git add .
git commit -m "Build full stack expense tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

### Supabase Database

Create a Supabase project, open the SQL Editor, and run:

```sql
-- Paste database/supabase-schema.sql here and run it.
```

Then copy the Session Pooler connection details from Supabase's Connect panel. For Render, use a JDBC URL in this shape:

```text
jdbc:postgresql://YOUR_POOLER_HOST:5432/postgres?sslmode=require
```

### Render Backend

Create a new Render Web Service from the GitHub repo.

Use these settings:

```text
Environment: Docker
Root Directory: backend
Dockerfile Path: Dockerfile
Health Check Path: /api/health
Instance Type: Starter or higher for always-active service
```

Set these Render environment variables:

```text
DB_URL=jdbc:postgresql://YOUR_POOLER_HOST:5432/postgres?sslmode=require
DB_USERNAME=postgres.YOUR_PROJECT_REF
DB_PASSWORD=YOUR_SUPABASE_DATABASE_PASSWORD
DB_POOL_MAX_SIZE=5
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

After deploy, your backend URL will look like:

```text
https://your-backend.onrender.com/api
```

### Vercel Frontend

Import the same GitHub repo in Vercel and choose the `frontend` directory as the project root.

Use:

```text
Build Command: npm run build
Output Directory: dist
```

Set this Vercel environment variable:

```text
VITE_API_URL=https://your-backend.onrender.com/api
```

Redeploy the frontend after setting the variable.

### Always Active Note

Render Free web services spin down after 15 minutes of no inbound traffic. For an always-active backend, use a paid Render instance type such as Starter or higher. Supabase Free projects may also pause after low activity; upgrade Supabase for production-grade availability.
