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

## GitHub And Deployment

### Push To GitHub

```bash
git add .
git commit -m "Build full stack expense tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

### Always-Active Hosting Recommendation

Use Railway Hobby for the backend and MySQL because Railway supports persistent services and MySQL. Use Vercel for the React frontend because it serves the Vite build as a static app.

### Railway Backend

Create a Railway project from the GitHub repo and choose the `backend` directory as the service root. Add a MySQL service in the same Railway project.

Set these backend variables in Railway:

```text
DB_URL=jdbc:mysql://${{MySQL.MYSQLHOST}}:${{MySQL.MYSQLPORT}}/${{MySQL.MYSQLDATABASE}}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

After deploy, generate a public Railway domain for the backend. Your API base URL will look like:

```text
https://your-backend.up.railway.app/api
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
VITE_API_URL=https://your-backend.up.railway.app/api
```

Redeploy the frontend after setting the variable.
