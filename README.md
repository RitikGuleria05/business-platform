<div align="center">

# Business Platform

### A full-stack business management system with fine-grained Role-Based Access Control (RBAC)

Products · Inventory · Customers · Sales · Reports — all behind a permission-driven security layer.

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-Web_API-5C2D91?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![xUnit](https://img.shields.io/badge/Tests-xUnit_v3-512BD4)

</div>

> **Status:** Core application features and Docker Compose setup are implemented. The application can be run locally using Docker Compose. Live deployment is not currently provided.

---

## Table of Contents

- [Overview](#overview)
- [Why This Project](#why-this-project)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Docker Architecture](#docker-architecture)
- [RBAC Design](#rbac-design)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Getting Started with Docker](#getting-started-with-docker)
- [Docker Commands](#docker-commands)
- [Database Backup and Recovery](#database-backup-and-recovery)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [About the Author](#about-the-author)

---

## Overview

Small and medium businesses often manage products, stock, customers and sales across spreadsheets and paper registers. That leads to duplicated data, human error, and no control over **who can see or change sensitive information**.

**Business Platform** brings product, inventory, customer and sales management into a single web application and enforces **permission-based access on every API request**, so each user can only do what their role allows. For example, an employee can create an invoice but cannot delete a customer or change product prices.

The backend follows **Clean Architecture** to stay maintainable, testable and loosely coupled. The frontend is a typed, component-based **React + TypeScript** single-page app.

## Why This Project

This project was built to demonstrate practical software engineering practices, not just CRUD screens:

| Skill | Where it shows up |
|---|---|
| **Software architecture** | Four-layer Clean Architecture with dependencies pointing inward to the Domain |
| **Security engineering** | JWT authentication, BCrypt password hashing, custom permission middleware, secure-by-default authorization policy, bot protection on public endpoints |
| **API design** | RESTful ASP.NET Core Web API, DTOs, FluentValidation, global exception handling, Swagger/OpenAPI |
| **Data modelling** | Relational schema with EF Core code-first migrations |
| **Full-stack delivery** | Typed React client consuming the API, protected routes, permission-aware UI |
| **Containerization** | Docker images and Docker Compose for the frontend, API and MySQL database |
| **Quality** | Unit and integration tests with xUnit, Moq and `WebApplicationFactory` |

## Key Features

**Security and access control**
- JWT-based authentication with BCrypt password hashing
- Dynamic RBAC: **User → Role → Permission → Module**
- Permissions checked on API requests by custom middleware
- Fallback authorization policy: endpoints require an authenticated user unless explicitly opened
- Cloudflare Turnstile integration to protect public endpoints
- Admin interface for managing users, roles, permissions and assignments
- Role permissions can be changed through role-permission mappings without changing application code

**Business modules**
- **Products and categories:** create, update and categorise products
- **Inventory:** stock quantity, minimum/maximum levels and reorder levels
- **Customers:** customer profiles linked to purchase history
- **Sales:** invoices with line items, discounts and tax; payment recording; sales returns
- **Reports:** sales summaries, top-selling products and low-stock alerts, with PDF (QuestPDF) and Excel (ClosedXML) export

**Engineering**
- Audit fields on core tables (`CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `IsActive`)
- Centralised exception-handling middleware
- Permission-aware dashboard
- Interactive API documentation through Swagger with JWT support
- Docker Compose setup for running the application services together
- MySQL backup script and a tested restore workflow

## Screenshots

_Add screenshots or GIFs of the running application here._

| Login | Dashboard |
|---|---|
| _Add screenshot_ | _Add screenshot_ |

| Sales / Invoice | Role & Permission Management |
|---|---|
| _Add screenshot_ | _Add screenshot_ |

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router, Axios, Tailwind CSS 4, Recharts, Lucide Icons |
| **Backend** | ASP.NET Core Web API (.NET 8), Clean Architecture |
| **Data** | MySQL 8.4, Entity Framework Core 8 (Pomelo provider), code-first migrations |
| **Auth & Security** | JWT Bearer, BCrypt.Net, custom RBAC permission middleware, Cloudflare Turnstile |
| **Application layer** | FluentValidation, AutoMapper |
| **Reporting** | QuestPDF (PDF), ClosedXML (Excel) |
| **Testing** | xUnit v3, Moq, `Microsoft.AspNetCore.Mvc.Testing`, EF Core InMemory and SQLite |
| **API docs** | Swagger / OpenAPI (Swashbuckle) |
| **Containerization** | Docker, Docker Compose, Nginx |
| **Tooling** | Git and GitHub, Postman, HeidiSQL, Visual Studio / VS Code, oxlint |

## Architecture

The system is a three-tier application. The React client talks to the ASP.NET Core API over HTTP/JSON, and the API talks to MySQL through EF Core. Inside the backend, code is organised using **Clean Architecture**:

```text
┌──────────────────────────────────────────────┐
│  API / Presentation   (Controllers, Middleware)│
│  ┌──────────────────────────────────────────┐ │
│  │  Infrastructure   (EF Core, MySQL, JWT)    │ │
│  │  ┌──────────────────────────────────────┐ │ │
│  │  │  Application   (Services, DTOs,       │ │ │
│  │  │                 Validators, Interfaces)│ │ │
│  │  │  ┌──────────────────────────────────┐ │ │ │
│  │  │  │  Domain  (Entities, Rules)        │ │ │ │
│  │  │  └──────────────────────────────────┘ │ │ │
│  │  └──────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
        Dependencies always point inward →
```

| Layer | Responsibility |
|---|---|
| **Domain** | Core entities (Product, Sale, Customer, Role, Permission…) and business rules. No dependency on any other layer. |
| **Application** | Use cases and services, DTOs, validators, and interfaces (e.g. `IProductService`, `IUnitOfWork`). Defines *what* the system does, not *how*. |
| **Infrastructure** | Implements Application interfaces: EF Core repositories, MySQL access, JWT/identity services. |
| **API** | Controllers, middleware (exception handling, permission checks), authentication and Swagger setup. |

**Request pipeline:** `CORS → HTTPS redirect → Exception middleware → Authentication → Authorization → Permission middleware → Controllers`

## Docker Architecture

Docker Compose runs the application as three services:

```text
                 Browser
                    |
             http://localhost:3000
                    |
          ┌─────────────────────┐
          │      frontend       │
          │   React + Nginx     │
          └──────────┬──────────┘
                     |
             API requests
                     |
          ┌──────────▼──────────┐
          │        api          │
          │   ASP.NET Core      │
          │      .NET 8         │
          └──────────┬──────────┘
                     |
                MySQL connection
                     |
          ┌──────────▼──────────┐
          │        mysql        │
          │      MySQL 8.4      │
          └─────────────────────┘
```

| Compose service | Container role | Host access |
|---|---|---|
| `frontend` | Serves the production React build through Nginx | `http://localhost:3000` |
| `api` | Runs the ASP.NET Core Web API | `http://localhost:8080` |
| `mysql` | Stores application data in MySQL | Host port `3307` → container port `3306` |

**How the services communicate**

- The browser opens the frontend at `http://localhost:3000`.
- The frontend sends API requests to the API service using the configured API base URL.
- The API connects to MySQL using the Compose service name `mysql` and the container port `3306`.
- The host port `3307` is for database tools running on the host machine. Containers should communicate with MySQL through the Compose network using `mysql:3306`.

> The port mappings above reflect the local Docker Compose configuration. If you change the ports in the Compose file, update these URLs accordingly.

## RBAC Design

```text
 USER  ──assigned a──►  ROLE  ──grants a set of──►  PERMISSION  ──belongs to a──►  MODULE
 (JWT)                 (Admin / Manager /          (e.g. Product.Create,           (Product, Sales,
                        Employee)                   Sales.View)                     Customer, …)
```

Permissions follow a `Module.Action` convention (for example `Product.View`, `Product.Create`, `Product.Edit`) and are linked to roles through a `RolePermissions` mapping table.

| Role | Typical access |
|---|---|
| **Admin** | Full access to all modules, including Security (role and permission management) |
| **Manager** | Product, Inventory, Sales and Reports; limited Security access |
| **Employee** | Restricted: typically View and Create on Sales and Customer modules |

## Database Design

MySQL, managed with EF Core code-first migrations, split into two logical groups:

- **Security / RBAC:** `Users`, `Roles`, `Permissions`, `Modules`, `RolePermissions`, `Employees`
- **Product and Sales:** `Categories`, `Products`, `Inventories`, `Customers`, `Sales`, `SaleItems`, `SaleReturns`, `SaleReturnItems`, `Payments`

Every core table carries a consistent audit pattern (`CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `IsActive`).

## Project Structure

The repository contains separate backend and frontend directories:

```text
business-platform/
├── Backend/
│   └── BusinessPlatform/
│       ├── BusinessPlatform.API/
│       ├── BusinessPlatform.Application/
│       ├── BusinessPlatform.Domain/
│       ├── BusinessPlatform.Infrastructure/
│       ├── BusinessPlatform.Tests/       # If included in this solution
│       ├── docker-compose.yml            # Compose file location
│       ├── scripts/
│       │   └── backup-mysql.ps1
│       └── backups/                      # Generated backups; do not commit
├── Frontend/
│   └── business-platform-client/
└── README.md
```

_The tree highlights the main project folders and Docker-related files. Keep it aligned with the actual repository if folder names change._

## Getting Started with Docker

Docker is the recommended way to run the complete application locally. It starts the frontend, API and MySQL database together.

### Prerequisites

- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with the Docker Compose plugin
- Docker Desktop running before you execute Compose commands

You do **not** need to install Node.js, the .NET SDK or MySQL separately just to run the containerized application. Those tools are needed if you want to develop or run the services outside Docker.

### 1. Clone the repository

```powershell
git clone https://github.com/RitikGuleria05/business-platform.git
cd business-platform
```

### 2. Open the Docker Compose directory

The Compose file is in the backend solution directory:

```powershell
cd Backend/BusinessPlatform
```

Run the following commands from this directory unless a command says otherwise.

### 3. Configure environment variables

Before starting the application, inspect `docker-compose.yml` and the API configuration to identify the required environment variables.

Configure the values required by your Compose file and API, including:

- MySQL database name and credentials
- JWT signing key, issuer and audience
- Frontend API base URL
- Any required Cloudflare Turnstile settings

Use local environment configuration (for example, a `.env` file if the Compose file is configured to read one). **Do not commit real passwords, JWT keys, API secrets or production credentials to Git.**

The database name used by this project is `BusinessPlatformDb`. The Compose MySQL service is named `mysql`.

### 4. Build and start the application

Build the images:

```powershell
docker compose build
```

Start all services in the background:

```powershell
docker compose up -d
```

Or build and start in one command:

```powershell
docker compose up -d --build
```

### 5. Verify the containers

```powershell
docker compose ps
```

The Compose services should show as running:

- `frontend`
- `api`
- `mysql`

A running container only confirms that its process is running. Also check the logs and test the application in your browser.

### 6. Open the application

| Component | URL |
|---|---|
| React frontend | [http://localhost:3000](http://localhost:3000) |
| ASP.NET Core API | [http://localhost:8080](http://localhost:8080) |
| MySQL from host tools | `localhost:3307` |

If Swagger is enabled in the running API environment, open:

`http://localhost:8080/swagger`

### 7. View application logs

All services:

```powershell
docker compose logs -f
```

Only the API:

```powershell
docker compose logs -f api
```

Only the frontend:

```powershell
docker compose logs -f frontend
```

Only MySQL:

```powershell
docker compose logs -f mysql
```

Press `Ctrl + C` to stop following logs. This does not stop the containers.

### 8. Stop the application

Stop and remove the Compose containers and network:

```powershell
docker compose down
```

This does not remove named volumes unless you explicitly ask Compose to remove them. Avoid `docker compose down -v` if you want to preserve database data.

To start the existing services again:

```powershell
docker compose up -d
```

## Docker Commands

| Command | Purpose |
|---|---|
| `docker compose config` | Validates and displays the resolved Compose configuration |
| `docker compose build` | Builds images for all services |
| `docker compose build api` | Builds only the API image |
| `docker compose build frontend` | Builds only the frontend image |
| `docker compose up -d` | Starts services in the background |
| `docker compose up -d --build` | Builds images and starts services |
| `docker compose ps` | Shows Compose service/container status |
| `docker compose images` | Lists images used by Compose |
| `docker compose logs -f` | Streams logs from all services |
| `docker compose logs -f api` | Streams API logs |
| `docker compose restart` | Restarts services |
| `docker compose stop` | Stops services without removing containers |
| `docker compose start` | Starts previously stopped containers |
| `docker compose down` | Stops and removes containers and the Compose network |
| `docker compose exec mysql sh` | Opens a shell inside the MySQL container |
| `docker compose exec api sh` | Opens a shell inside the API container, if its image includes a shell |
| `docker stats` | Shows live container resource usage |
| `docker system df` | Shows Docker disk usage |

### Useful container checks

Check the frontend's built files inside the Nginx container:

```powershell
docker compose exec frontend sh
```

Then inside the container:

```sh
ls -la /usr/share/nginx/html
ls -la /usr/share/nginx/html/assets
exit
```

Check the database service logs:

```powershell
docker compose logs --tail=100 mysql
```

Check the API service logs:

```powershell
docker compose logs --tail=100 api
```

## Database Backup and Recovery

A database backup is useful only if it can be restored. This project includes a PowerShell backup script that creates a MySQL dump from the running `mysql` service and stores the resulting `.sql` file on the host machine.

### Create a backup manually

From `Backend/BusinessPlatform`, run:

```powershell
powershell -ExecutionPolicy Bypass -File ".\scripts\backup-mysql.ps1"
```

The script:
1. Runs `mysqldump` inside the MySQL container.
2. Copies the SQL dump from the container to the host.
3. Checks that the backup file exists and is not empty.
4. Removes the temporary dump from the container.
5. Removes generated SQL backups older than 14 days.

Backups are stored in:

```text
Backend/BusinessPlatform/backups/
```

The generated backup files and logs can contain sensitive business data. Keep the `backups/` directory out of source control and store an additional copy somewhere safe.

### Restore a backup for verification

**Do not test recovery against your live database.** Restore into a separate temporary database.

First, copy a selected backup into the MySQL container. Replace the filename with the backup you want to test:

```powershell
docker compose cp .\backups\BusinessPlatformDb_YYYY-MM-DD_HH-mm-ss.sql mysql:/tmp/restore.sql
```

Create a temporary database:

```powershell
docker compose exec mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE BusinessPlatformDb_RestoreTest;"'
```

Restore the dump into the temporary database:

```powershell
docker compose exec mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" BusinessPlatformDb_RestoreTest < /tmp/restore.sql'
```

List the restored tables:

```powershell
docker compose exec mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SHOW TABLES FROM BusinessPlatformDb_RestoreTest;"'
```

Compare record counts for important tables in the original and restored databases. For example, if the `Products` table exists:

```sql
SELECT COUNT(*) FROM BusinessPlatformDb.Products;
SELECT COUNT(*) FROM BusinessPlatformDb_RestoreTest.Products;
```

After verifying the restore, remove the temporary database:

```powershell
docker compose exec mysql sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE BusinessPlatformDb_RestoreTest;"'
```

### Automated backups

The PowerShell script can be scheduled using Windows Task Scheduler. Configure the task to run daily while Docker Desktop is available and the MySQL service is running. The current script retains the most recent 14 days of generated SQL backups.

> A backup stored only on the same computer does not protect against disk failure or loss of that computer. For anything beyond local development, keep a protected copy on separate storage.

## Testing

The solution includes automated tests covering isolated business logic and the HTTP pipeline:

- **Unit tests:** xUnit v3 with Moq to isolate services from dependencies
- **Integration tests:** `WebApplicationFactory<Program>` to test API endpoints, authentication and permission enforcement
- **Test databases:** EF Core InMemory and SQLite providers

Run tests from the backend solution directory:

```powershell
dotnet test
```

This requires the .NET SDK to be installed on the host machine.

## Troubleshooting

| Problem | Things to check |
|---|---|
| `docker compose` is not recognised | Install/update Docker Desktop and ensure its Compose plugin is available |
| A service is not running | Run `docker compose ps` and inspect `docker compose logs <service>` |
| Frontend cannot call the API | Check the frontend API base URL, browser Network tab, API port and CORS configuration |
| API cannot connect to MySQL | Check that the database service is named `mysql`, that the API uses the Compose network address `mysql:3306`, and that credentials match |
| MySQL data disappears after removing a container | Check that the Compose file uses a persistent volume for the MySQL data directory |
| Frontend page loads but assets fail | Inspect the browser Network tab; check asset paths and filename casing because Linux containers are case-sensitive |
| Port is already in use | Stop the process using the port or change the host-side port mapping in the Compose file |
| API returns a database/schema error | Check database logs and confirm EF Core migrations have been applied |

## Roadmap

- [x] Authentication with JWT and password hashing
- [x] Dynamic RBAC with permission middleware
- [x] Product, Inventory, Customer and Sales modules
- [x] Sales returns and payment recording
- [x] PDF and Excel report export
- [x] Unit and integration tests
- [x] Docker Compose setup for frontend, API and MySQL
- [x] MySQL backup script and manual restore verification
- [ ] Live deployment
- [ ] Multi-branch / multi-warehouse inventory
- [ ] Payment gateway integration
- [ ] Audit log and notifications for critical actions (e.g. permission changes)
- [ ] Advanced analytics dashboards
- [ ] Mobile app (React Native) on top of the existing API

## About the Author

**Ritik Guleria**  
B.Tech, Computer Science and Engineering

I build full-stack applications with .NET and React, with a focus on clean architecture and secure design.

- GitHub: [@RitikGuleria05](https://github.com/RitikGuleria05)
- LinkedIn: _Add your LinkedIn URL_
- Email: _Add your contact email_

---

<div align="center">

If you found this project interesting, a ⭐ on the repository is much appreciated.

</div>
