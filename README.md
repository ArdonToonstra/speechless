# Toast

A Payload 3.0 (Beta) application with Next.js App Router and Postgres.

## Prerequisites

- Node.js (v18.20.2+ or >=20.9.0)
- pnpm
- Docker

## Getting Started

You can run this project entirely within Docker, or run the application locally while hosting the database in Docker.

### 1. Setup Environment

Copy the example environment file:

```bash
cp .env.example .env
```

If running locally, the default `.env.example` is configured to connect to the Postgres database provided by `docker-compose.yml` (mapped to port 5435).

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the Application

#### Option A: Run Everything in Docker

This will start both the Postgres database and the Next.js application in containers.

```bash
docker compose up
```

The app will be available at [http://localhost:3001](http://localhost:3001).

#### Option B: Local Development (Recommended)

Run the database in Docker, but the application code on your host machine for a better developer experience (HMR, faster rebuilds).

1. Start the database only:
   ```bash
   docker compose up -d postgres
   ```

2. Run the development server:
   ```bash
   pnpm dev
   ```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev`: Starts the Next.js development server.
- `pnpm build`: Builds the application for production.
- `pnpm start`: Starts the production server.
- `pnpm generate:types`: Generates Payload TypeScript types.
- `pnpm generate:importmap`: Generates the Payload import map.

## Testing

This project uses Playwright for end-to-end testing.

### Running Tests

- Run all tests:
  ```bash
  pnpm test
  ```

- Run tests with UI mode:
  ```bash
  pnpm test:ui
  ```

### Test Artifacts

All test results, including the HTML report and traces, are output to the `test-results` directory.
- **HTML Report**: `test-results/report/index.html`
- **Artifacts**: `test-results/artifacts`

The `test-results` directory is git-ignored to keep the repository clean.
