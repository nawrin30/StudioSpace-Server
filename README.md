# StudioSpace API

Express and TypeScript API for StudioSpace.

## Setup


npm install


Copy `.env.example` to `.env` and configure `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`.

## Commands


npm run dev      
npm run build    
npm start        

The API defaults to `http://localhost:5000`. Health check: `/api/health`.

## Main routes

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/studios`, `GET /api/studios/:id`, `GET /api/studios/mine`
- `POST /api/studios`, `PATCH /api/studios/:id`, `DELETE /api/studios/:id`
- `GET /api/bookings/mine`, `POST /api/bookings`, `PATCH /api/bookings/:id/cancel`

