# Digital Products Downloads Marketplace

A digital products marketplace project with a Next.js frontend and an Express backend service.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript
- Backend: Node.js, Express, CORS
- Tooling: ESLint, Tailwind CSS, concurrently

## Project Structure

- `frontend/` - Next.js application
- `backend_service/` - Express API server
- `package.json` - root package scripts and shared dev dependency
- `frontend/package.json` - frontend dependencies and scripts
- `backend_service/package.json` - backend dependencies and scripts

## Installation

From the project root, install dependencies for both frontend and backend:

```bash
npm install
npm install --prefix frontend
npm install --prefix backend_service
```

> If you prefer a single command, install root dependencies first and then install packages for each workspace.

## Running Locally

### Start both frontend and backend together

```bash
npm run dev
```

This runs:
- `npm run dev --prefix frontend` (starts the Next.js frontend)
- `npm run dev --prefix backend_service` (starts the Express backend)

### Run frontend only

```bash
npm run dev --prefix frontend
```

The frontend default port is `3000`.

### Run backend only

```bash
npm run dev --prefix backend_service
```

The backend server runs on port `5000`.

### Google sign-in setup

The backend starts Google sign-in at `http://localhost:5000/api/auth/google`. In Google Cloud Console, create an OAuth client with application type **Web application** and add this exact value under **Authorized redirect URIs**:

```text
http://localhost:5000/api/auth/google/callback
```

The value must match `GOOGLE_CALLBACK_URL` in `backend_service/.env` character-for-character. If the OAuth consent screen is in **Testing**, add the Google account being used to **Test users**. A missing redirect URI or non-test account produces Google’s `Error 400: invalid_request` policy page before the backend receives any request.

For a deployed environment, use HTTPS and register the deployed callback URL in Google Cloud Console; do not reuse the localhost callback.

## Build & Production

### Frontend build

```bash
npm run build --prefix frontend
```

### Start backend in production mode

```bash
npm start --prefix backend_service
```

## API Endpoints

The backend exposes the following endpoints:

- `GET /` - health check endpoint
- `GET /api/products` - returns a sample list of digital products

Example response from `/api/products`:

```json
[
  {
    "id": 1,
    "name": "Website Template",
    "price": 15
  },
  {
    "id": 2,
    "name": "E-Book",
    "price": 10
  }
]
```

## Notes

- The frontend currently uses `next`, `react`, `react-dom`, and Tailwind CSS.
- The backend is a minimal Express app with CORS enabled.
- You can extend the project by adding product management, user authentication, payment integration, and database storage.

## License

This project is currently unlicensed.

## Create the first Superadmin account

There is no default or backup admin account. Create an account with the email and password you want, then promote it to Superadmin:

1. Make sure the backend database migrations have been run. The default roles, including `Superadmin`, are seeded by the migrations.
2. Register the account using `POST http://localhost:5000/api/auth/register` with a JSON body like this. Choose your own name, username, email, and a strong password; registration requires a password of at least 8 characters and a username of 3-30 letters, numbers, or underscores.

   ```json
   {
     "name": "Marketplace Admin",
     "username": "marketsuperadmin",
     "email": "superadmin@example.com",
     "password": "12345678"
   }
   ```

   The registration endpoint creates a regular Buyer account and stores the password as a hash. Do not put a real password in this README, source control, or a shared terminal history.
3. Connect to the PostgreSQL database configured for `backend_service` and run the SQL below. Replace `admin@example.com` with the email used during registration.
4. Sign in at `http://localhost:3001/login` with that email and password.

```sql
BEGIN;

DO $$
DECLARE
    account_id INT;
    superadmin_role_id INT;
BEGIN
    SELECT account."UserId"
    INTO account_id
    FROM "UserAccounts" account
    JOIN "UserInfo" info ON info."UserInfoId" = account."UserInfoId"
    WHERE lower(info."Email") = lower('superadmin@example.com')
    FOR UPDATE OF account;

    IF account_id IS NULL THEN
        RAISE EXCEPTION 'No account found for that email. Register it first.';
    END IF;

    SELECT "UserRoleId"
    INTO superadmin_role_id
    FROM "UsersRoles"
    WHERE lower("RoleName") = 'superadmin';

    IF superadmin_role_id IS NULL THEN
        RAISE EXCEPTION 'Superadmin role not found. Run the database migrations first.';
    END IF;

    UPDATE "UserAccounts"
    SET "RoleId" = superadmin_role_id,
        "Status" = 'active',
        "UpdatedAt" = CURRENT_TIMESTAMP
    WHERE "UserId" = account_id;

    INSERT INTO "UserAccountRoles" ("UserId", "UserRoleId")
    VALUES (account_id, superadmin_role_id)
    ON CONFLICT ("UserId", "UserRoleId") DO NOTHING;
END $$;

COMMIT;
```
$body = @{
    name = "Marketplace Admin"
    username = "marketsuperadmin"
    email = "superadmin@example.com"
    password = "12345678"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body