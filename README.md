# StudioSpace API

Express and TypeScript API for StudioSpace.

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and configure `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Compile TypeScript into dist/
npm start        # Run compiled server
```

The API defaults to `http://localhost:5000`. Health check: `/api/health`.

## Main routes

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/studios`, `GET /api/studios/:id`, `GET /api/studios/mine`
- `POST /api/studios`, `PATCH /api/studios/:id`, `DELETE /api/studios/:id`
- `GET /api/bookings/mine`, `POST /api/bookings`, `PATCH /api/bookings/:id/cancel`

Mutating and personal routes use JWT authentication stored in an HTTPOnly cookie.
