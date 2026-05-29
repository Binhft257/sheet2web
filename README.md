# Sheet2Web

Sheet2Web is a NestJS backend API for turning public Google Sheets into publishable web views. It provides user authentication, Google Sheets data-source syncing, view publishing, public view access, viewer dashboards, permissions, share tokens, and supporting CRUD modules.

## Table of Contents

- [About The Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Current Features](#current-features)
- [System Flow](#system-flow)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running The Project](#running-the-project)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Future Updates](#future-updates)
- [Notes](#notes)

## About The Project

This project is a backend API built with NestJS and TypeScript. It lets authenticated users connect Google Sheets as data sources, read sheet metadata and values through the Google Sheets API, create views from full sheets or ranges, publish snapshots, and expose published views by slug with optional permissions or share tokens.

## Tech Stack

- NestJS 11
- TypeScript
- TypeORM
- PostgreSQL (`pg`)
- Passport Local and Passport JWT
- JWT (`@nestjs/jwt`)
- Class Validator and Class Transformer
- Google Sheets API (`googleapis`)
- Nest Config Module
- Nest Mailer Module with Handlebars templates
- Bcrypt
- Day.js
- UUID
- Jest
- ESLint and Prettier

## Current Features

- User registration, login, activation-code verification, and activation-code retry.
- Password hashing with `bcrypt`.
- JWT access token generation and validation.
- Global JWT protection with `APP_GUARD`, with selected public routes using `@Public()`.
- PostgreSQL persistence through TypeORM entities, repositories, transactions, and query builders.
- Google Sheets data-source creation from a Google Sheet URL.
- Google Sheet metadata sync, including spreadsheet title and sheet/tab metadata.
- Data-source listing, updating, soft deletion, sheet listing, and data preview.
- View creation, listing, updating, publishing, and published snapshot storage.
- Public view access by slug through `/api/v/:slug`.
- Optional authenticated access detection on public views.
- Viewer dashboard and viewer view listing for accessible views.
- View permissions by user email.
- Share-token creation, listing, and revocation.
- Mail sending for account activation.
- Basic CRUD modules for users, themes, source sheets, source tables, sync histories, audit logs, cell change logs, and view snapshots.

## System Flow

### Authentication Flow

1. A user registers with email, password, and full name.
2. The server hashes the password and creates an inactive user.
3. The server sends an activation code by email.
4. The user verifies the activation code.
5. The user logs in with email and password.
6. `LocalAuthGuard` validates the credentials.
7. `AuthService` creates a JWT payload and signs an access token.
8. The client sends the token in the `Authorization` header.
9. `JwtStrategy` validates the token.
10. The validated user payload is attached to `req.user`.

### Sheet-to-Web Flow

1. An authenticated user creates a data source with a Google Sheet URL.
2. The server extracts the Google spreadsheet ID from the URL.
3. `GoogleSheetsService` reads spreadsheet metadata using `GOOGLE_SHEETS_API_KEY`.
4. The server stores the data source and its sheet tabs.
5. The user creates a view from a data source and a source sheet.
6. The user publishes the view.
7. The server reads Google Sheet values for the selected full sheet or range.
8. The server stores the published data as a `ViewSnapshot`.
9. A published view can be opened through `/api/v/:slug`.
10. Private views require ownership, explicit permission, or a valid share token.

## Getting Started

### Prerequisites

- Node.js compatible with NestJS 11 and TypeScript target `ES2023`
- npm
- PostgreSQL database
- Google Sheets API key
- SMTP credentials for activation emails

### Installation

```bash
npm install
```

## Environment Variables

The project reads configuration through `ConfigService`. Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/sheet2web

JWT_SECRET=your_jwt_secret
JWT_ACCESS_TOKEN_EXPIRED=3600

GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key

MAIL_HOST=smtp.example.com
MAIL_PORT=465
MAIL_USER=your_mail_user
MAIL_PASS=your_mail_password
MAIL_FROM="Sheet2Web <no-reply@example.com>"
```

Notes:

- `DATABASE_URL` is used by TypeORM with `type: 'postgres'`.
- `JWT_ACCESS_TOKEN_EXPIRED` is converted to a number before being passed to JWT sign options.
- `MAIL_PORT` is read from the environment and passed directly to the mailer config.
- Google Sheets must be publicly readable when using the current API-key based integration.

## Running The Project

```bash
# Development
npm run start:dev

# Standard start
npm run start

# Build
npm run build

# Production
npm run start:prod
```

## Usage

The API uses a global prefix:

```txt
http://localhost:3000/api
```

There is no Swagger/OpenAPI setup in the current codebase.

### Login Example

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "passwordHash": "plain_password"
}
```

Successful login returns an access token:

```json
{
  "access_token": "<jwt_access_token>"
}
```

Send the token to protected routes:

```http
Authorization: Bearer <access_token>
```

### Create Data Source Example

```http
POST /api/data-sources
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "sourceUrl": "https://docs.google.com/spreadsheets/d/<spreadsheet_id>/edit",
  "title": "Sales Sheet"
}
```

### Create View Example

```http
POST /api/views
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "dataSourceId": "00000000-0000-0000-0000-000000000000",
  "sourceSheetId": "00000000-0000-0000-0000-000000000000",
  "name": "Public Sales View",
  "selectionType": "range",
  "rangeA1Notation": "A1:D20",
  "accessMode": "public",
  "useFirstRowAsHeader": true
}
```

## API Endpoints

All endpoints below include the `/api` global prefix.

### Auth

| Method | Endpoint                 | Description                                  | Auth Required |
| ------ | ------------------------ | -------------------------------------------- | ------------- |
| POST   | `/api/auth/register`     | Register a user and send an activation email | No            |
| POST   | `/api/auth/check-code`   | Verify an activation code                    | No            |
| POST   | `/api/auth/retry-active` | Send a new activation code                   | No            |
| POST   | `/api/auth/login`        | Login and receive a JWT access token         | No            |
| GET    | `/api/auth/mail`         | Send a hard-coded test email                 | No            |

### Users

| Method | Endpoint         | Description        | Auth Required |
| ------ | ---------------- | ------------------ | ------------- |
| POST   | `/api/users`     | Create a user      | No            |
| GET    | `/api/users`     | List users         | Yes           |
| GET    | `/api/users/:id` | Get a user by ID   | Yes           |
| PATCH  | `/api/users/:id` | Update a user      | Yes           |
| DELETE | `/api/users/:id` | Soft-delete a user | Yes           |

### Data Sources

| Method | Endpoint                        | Description                              | Auth Required |
| ------ | ------------------------------- | ---------------------------------------- | ------------- |
| GET    | `/api/data-sources`             | List current user's data sources         | Yes           |
| POST   | `/api/data-sources`             | Create a Google Sheets data source       | Yes           |
| PATCH  | `/api/data-sources/:id`         | Update a data source                     | Yes           |
| DELETE | `/api/data-sources/:id`         | Soft-delete a data source                | Yes           |
| GET    | `/api/data-sources/:id/sheets`  | List sheets for a data source            | Yes           |
| POST   | `/api/data-sources/:id/preview` | Preview values from a source sheet/range | Yes           |

### Views

| Method | Endpoint                   | Description                          | Auth Required |
| ------ | -------------------------- | ------------------------------------ | ------------- |
| POST   | `/api/views`               | Create a view                        | Yes           |
| GET    | `/api/views`               | List all views                       | Yes           |
| GET    | `/api/views/my`            | List current user's views            | Yes           |
| GET    | `/api/views/:id`           | Get a view by ID                     | Yes           |
| PATCH  | `/api/views/:id`           | Update a view                        | Yes           |
| PATCH  | `/api/views/:id/published` | Update published state/config fields | Yes           |
| POST   | `/api/views/:id/publish`   | Publish a view and create a snapshot | Yes           |
| DELETE | `/api/views/:id`           | Delete a view                        | Yes           |
| GET    | `/api/v/:slug`             | Read a published view by slug        | No            |

### View Permissions

| Method | Endpoint                                       | Description                | Auth Required |
| ------ | ---------------------------------------------- | -------------------------- | ------------- |
| POST   | `/api/views/:viewId/permissions`               | Grant view access by email | Yes           |
| GET    | `/api/views/:viewId/permissions`               | List view permissions      | Yes           |
| DELETE | `/api/views/:viewId/permissions/:permissionId` | Remove a permission        | Yes           |

### Share Tokens

| Method | Endpoint                                          | Description          | Auth Required |
| ------ | ------------------------------------------------- | -------------------- | ------------- |
| POST   | `/api/views/:viewId/share-tokens`                 | Create a share token | Yes           |
| GET    | `/api/views/:viewId/share-tokens`                 | List share tokens    | Yes           |
| PATCH  | `/api/views/:viewId/share-tokens/:tokenId/revoke` | Revoke a share token | Yes           |

### Viewer

| Method | Endpoint                | Description                                 | Auth Required |
| ------ | ----------------------- | ------------------------------------------- | ------------- |
| GET    | `/api/viewer/dashboard` | Get viewer dashboard data                   | Yes           |
| GET    | `/api/viewer/views`     | List views accessible to the current viewer | Yes           |

### Supporting CRUD Modules

The following controllers expose standard `POST`, `GET`, `GET :id`, `PATCH :id`, and `DELETE :id` endpoints:

- `/api/audit-logs`
- `/api/cell-change-logs`
- `/api/source-sheets`
- `/api/source-tables`
- `/api/sync-histories`
- `/api/themes`
- `/api/view-snapshots`

## Project Structure

```txt
src/
|-- auth/                 # Authentication, local strategy, JWT strategy, guards
|-- common/               # Shared enums
|-- decorator/            # Custom decorators such as @Public()
|-- google-sheets/        # Google Sheets API integration
|-- helpers/              # Shared helpers such as password hashing
|-- mail/                 # Mail templates
|-- modules/              # Feature modules and database entities
|-- app.module.ts         # Root module and infrastructure configuration
|-- app.controller.ts     # Root health-style endpoint
`-- main.ts               # Application bootstrap
```

Key feature modules under `src/modules/`:

- `users`: user persistence, activation code handling, and user CRUD.
- `data-sources`: Google Sheet data-source management and preview.
- `views`: view configuration, publishing, snapshots, and public view lookup.
- `viewer`: viewer dashboard and accessible view listing.
- `view-permissions`: user-level view access.
- `share-tokens`: token-based view sharing.
- `themes`, `source-sheets`, `source-tables`, `sync-histories`, `audit-logs`, `cell-change-logs`, `view-snapshots`: supporting domain modules.

## Scripts

| Script                | Description                                |
| --------------------- | ------------------------------------------ |
| `npm run build`       | Build the NestJS project                   |
| `npm run format`      | Format source and test files with Prettier |
| `npm run start`       | Start the NestJS app                       |
| `npm run start:dev`   | Start the app in watch mode                |
| `npm run start:debug` | Start the app in debug watch mode          |
| `npm run start:prod`  | Run the built app from `dist/main`         |
| `npm run lint`        | Run ESLint with auto-fix                   |
| `npm run test`        | Run unit tests                             |
| `npm run test:watch`  | Run tests in watch mode                    |
| `npm run test:cov`    | Run tests with coverage                    |
| `npm run test:debug`  | Run tests in debug mode                    |
| `npm run test:e2e`    | Run e2e tests                              |

## Future Updates

- Add Excel file support as an additional data source, allowing users to import and manage data from `.xlsx` files besides Google Sheets.
- Add Swagger/OpenAPI documentation.
- Add refresh token support.
- Expand role-based authorization; role metadata and guard scaffolding already exist.
- Improve automated test coverage for auth, data-source sync, publishing, permissions, and share tokens.
- Add Docker and Docker Compose for local PostgreSQL and app startup.
- Add CI checks for linting, tests, and build.
- Add write-back support from the web app to Google Sheets, enabling users to edit records in the web interface and sync those changes back to the source sheet.

## Notes

- Protected routes require `Authorization: Bearer <access_token>`.
- Public routes are marked with the custom `@Public()` decorator.
- `JWT_SECRET` must match between token signing and validation.
- `GOOGLE_SHEETS_API_KEY` is required for data-source creation, sheet listing, preview, and view publishing.
- The current Google Sheets integration uses an API key, so linked spreadsheets must be publicly readable.
- TypeORM is configured with `synchronize: false`; database schema creation/migration must be handled outside the current runtime configuration.
- `ValidationPipe` is enabled globally with `whitelist` and `forbidNonWhitelisted`.
- No Swagger endpoint or Postman collection is currently included in the repository.
