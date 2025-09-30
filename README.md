# Burrow

This repository contains the Burrow delivery reschedule web experience. It now includes an Express based backend that connects to MongoDB Atlas for persisting authentication, warehouse, and delivery request data.

## Project Structure

```
.
├── server/              # Express + MongoDB backend
│   ├── index.js         # API entry point
│   ├── lib/             # Database helpers
│   ├── routes/          # Express routers
│   └── utils/           # Shared utilities
├── src/                 # React frontend
└── .env.sample          # Example environment variables for the API
```

## Backend API

### Prerequisites

- Node.js 18+
- Access to a MongoDB Atlas cluster

### Environment configuration

1. Copy `.env.sample` to `.env` in the project root.
2. Update the MongoDB credentials. For the shared development cluster use:
   - **Connection string**: `mongodb+srv://dev:dev123@cluster0.rhivlko.mongodb.net/`
   - **Database name**: `dev`
3. Optionally update `CORS_ORIGIN` with the allowed frontend origins (comma separated) and `PORT` if you want the server to listen on a custom port.

### Installing dependencies

```bash
npm install
```

### Running the backend locally

```bash
npm run server
```

The server will start on `http://localhost:4000` by default and exposes a `/health` endpoint you can use for readiness checks.

### Database Collections

The backend uses the following collections inside the configured MongoDB database:

- **users** – Stores users with `name`, `email`, `passwordHash`, `role`, and audit fields.
- **deliveryRequests** – Stores delivery reschedule requests, destination addresses, payment details, and status history.
- **warehouses** – Stores warehouse metadata such as address, capacity, and operating hours.
- **timeSlots** – Optional collection for configurable delivery time slots. When empty the API falls back to sensible defaults.

### Available endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/auth/register` | Create a user with DB-backed authentication (bcrypt hashed). |
| `POST` | `/auth/login` | Validates credentials via database lookup and returns the sanitised user. |
| `POST` | `/auth/logout` | Stateless logout helper for the frontend. |
| `GET` | `/auth/:id` | Fetch a specific user (no password fields). |
| `GET` | `/warehouses` | List active warehouses. |
| `POST` | `/warehouses` | Create a warehouse record. |
| `PATCH` | `/warehouses/:id` | Update warehouse metadata. |
| `GET` | `/warehouses/time-slots` | Retrieve available time slots (database driven with default fallback). |
| `GET` | `/warehouses/time-slots/defaults` | Retrieve the built-in default time slots. |
| `GET` | `/requests` | List delivery requests. Supports `userId` and `status` query parameters. |
| `GET` | `/requests/:id` | Fetch a specific delivery request. |
| `POST` | `/requests` | Create a new delivery reschedule request with initial status history. |
| `PUT` | `/requests/:id/reschedule` | Update the scheduled date/time and mark the request as reschedule requested. |
| `PATCH` | `/requests/:id/status` | Transition a request status and append to the history. |
| `PATCH` | `/requests/:id/payment` | Update payment status and charge breakdown. |

All endpoints respond with JSON and use database-backed authentication (no JWTs). Authentication is handled by validating credentials directly against MongoDB on each login request.

### Seeding data

You can seed initial data using the Atlas UI or MongoDB Shell. Below is an example command to insert an operator user and one warehouse:

```javascript
use dev;

db.users.insertOne({
  name: 'Operator One',
  email: 'operator@example.com',
  passwordHash: '$2a$10$Q9Vn8h1oIYcM2h4mSMNoROiSfmC8S4IUsabfpxiC3i0xQO4kibUti', // password: Passw0rd!
  role: 'operator',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

db.warehouses.insertMany([
  {
    name: 'Burrow Delhi Hub',
    address: 'Sector 18, Noida, Uttar Pradesh 201301',
    capacity: 1000,
    operatingHours: '9:00 AM - 7:00 PM',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

## Frontend

The frontend continues to use Vite + React + Tailwind. Refer to the existing scripts for development (`npm run dev`) and building (`npm run build`).

## License

MIT
