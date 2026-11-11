<div align="center">

# Business Platform

### A full-stack business management system with fine-grained Role-Based Access Control (RBAC)

Products · Inventory · Customers · Sales · Reports — all behind a permission-driven security layer.

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-Web_API-5C2D91?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-EF_Core-4479A1?logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![xUnit](https://img.shields.io/badge/Tests-xUnit_v3-512BD4)

[**Live Demo**](#) · [**API Docs (Swagger)**](#) · [**Project Synopsis**](#)

</div>

> **Status:** Core features complete. Docker setup and live deployment are in progress.

---

## Table of Contents

- [Overview](#overview)
- [Why This Project](#why-this-project)
- [Key Features](#key-features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [RBAC Design](#rbac-design)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [About the Author](#about-the-author)

---

## Overview

Small and medium businesses often manage products, stock, customers and sales across spreadsheets and paper registers. That leads to duplicated data, human error, and no control over **who can see or change sensitive information**.

**Business Platform** brings product, inventory, customer and sales management into a single web application and enforces **permission-based access on every API request**, so each user can only do what their role allows. For example, an employee can create an invoice but cannot delete a customer or change product prices.

The backend follows **Clean Architecture** to stay maintainable, testable and loosely coupled. The frontend is a typed, component-based **React + TypeScript** single-page app.

## Why This Project

This project was built to demonstrate production-style engineering practices, not just CRUD screens:

| Skill | Where it shows up |
|---|---|
| **Software architecture** | Four-layer Clean Architecture with dependencies pointing inward to the Domain |
| **Security engineering** | JWT authentication, BCrypt password hashing, custom permission middleware, secure-by-default authorization policy, bot protection on public endpoints |
| **API design** | RESTful ASP.NET Core Web API, DTOs, FluentValidation, global exception handling, Swagger/OpenAPI |
| **Data modelling** | Relational schema with EF Core code-first migrations and a consistent audit pattern |
| **Full-stack delivery** | Typed React client consuming the API, protected routes, permission-aware UI |
| **Quality** | Unit and integration tests with xUnit, Moq and `WebApplicationFactory` |

## Key Features

**Security and access control**
- JWT-based authentication with BCrypt password hashing
- Dynamic RBAC: **User → Role → Permission → Module**
- Permissions checked on **every API request** by custom middleware
- Fallback authorization policy: every endpoint requires an authenticated user unless explicitly opened
- Cloudflare Turnstile integration to protect against automated abuse
- Admin interface for managing users, roles, permissions and assignments
- Changing what a role can do requires **no code change**, only an update to the role-permission mapping

**Business modules**
- **Products and categories:** create, update and categorise products
- **Inventory:** stock quantity, minimum/maximum levels and reorder levels
- **Customers:** customer profiles linked to purchase history
- **Sales:** invoices with line items, discounts and tax; payment recording; sales returns
- **Reports:** sales summaries, top-selling products and low-stock alerts, with **PDF** (QuestPDF) and **Excel** (ClosedXML) export

**Engineering quality**
- Audit fields on core tables (`CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`, `IsActive`) supporting soft deletion and traceability
- Centralised exception-handling middleware
- Permission-aware dashboard that only shows modules the signed-in user may access
- Interactive API documentation via Swagger with JWT support

## Screenshots

> Screenshots will be added here once the live deployment is ready.

| Login | Dashboard |
|---|---|
| _coming soon_ | _coming soon_ |

| Sales / Invoice | Role & Permission Management |
|---|---|
| _coming soon_ | _coming soon_ |

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router, Axios, Tailwind CSS 4, Recharts, Lucide Icons |
| **Backend** | ASP.NET Core Web API (.NET 8), Clean Architecture |
| **Data** | MySQL, Entity Framework Core 8 (Pomelo provider), code-first migrations |
| **Auth & Security** | JWT Bearer, BCrypt.Net, custom RBAC permission middleware, Cloudflare Turnstile |
| **Application layer** | FluentValidation, AutoMapper |
| **Reporting** | QuestPDF (PDF), ClosedXML (Excel) |
| **Testing** | xUnit v3, Moq, `Microsoft.AspNetCore.Mvc.Testing`, EF Core InMemory and SQLite |
| **API docs** | Swagger / OpenAPI (Swashbuckle) |
| **Tooling** | Git and GitHub, Postman, HeidiSQL, Visual Studio / VS Code, oxlint |

## Architecture

The system is a three-tier application. The React client talks to the ASP.NET Core API over HTTPS/JSON, and the API talks to MySQL through EF Core. Inside the backend, code is organised using **Clean Architecture**:

```
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
        Dependencies always point inward ➜
```

| Layer | Responsibility |
|---|---|
| **Domain** | Core entities (Product, Sale, Customer, Role, Permission…) and business rules. No dependency on any other layer. |
| **Application** | Use cases and services, DTOs, validators, and interfaces (e.g. `IProductService`, `IUnitOfWork`). Defines *what* the system does, not *how*. |
| **Infrastructure** | Implements Application interfaces: EF Core repositories, MySQL access, JWT/identity services. |
| **API** | Controllers, middleware (exception handling, permission checks), authentication and Swagger setup. |

**Request pipeline:** `CORS → HTTPS redirect → Exception middleware → Authentication → Authorization → Permission middleware → Controllers`

## RBAC Design

```
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

> An ER diagram will be added to `/docs`.

## Project Structure

```
business-platform/
├── BusinessPlatform/                  # API layer: controllers, middleware, startup
├── BusinessPlatform.Application/      # Services, DTOs, validators, interfaces
├── BusinessPlatform.Domain/           # Entities and core business rules
├── BusinessPlatform.Infrastructure/   # EF Core, repositories, JWT, MySQL
├── BusinessPlatform.Tests/            # Unit and integration tests (xUnit)
├── client/                            # React + TypeScript frontend (Vite)
└── README.md
```

> Folder names above reflect the solution layout; adjust the test and client folder names if yours differ.

## Testing

The solution includes automated tests covering both isolated logic and the full HTTP pipeline:

- **Unit tests:** xUnit v3 with Moq to isolate services from their dependencies
- **Integration tests:** `WebApplicationFactory<Program>` boots the real API in-memory to test endpoints, authentication and permission enforcement end to end
- **Test databases:** EF Core InMemory and SQLite providers, so tests run fast without needing a MySQL server

```bash
dotnet test
```

## Getting Started

> **Docker setup and a live demo are coming soon.** Full installation instructions will be added here once containerisation is complete.

**Planned:**
- One-command startup with Docker Compose (API + React client + MySQL)
- Seed data with demo accounts for each role (Admin, Manager, Employee)
- Hosted live demo

<details>
<summary><b>Prerequisites (for local development)</b></summary>

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (LTS)
- [MySQL 8](https://dev.mysql.com/downloads/)

</details>

## Roadmap

- [x] Authentication with JWT and password hashing
- [x] Dynamic RBAC with permission middleware
- [x] Product, Inventory, Customer and Sales modules
- [x] Sales returns and payment recording
- [x] PDF and Excel report export
- [x] Unit and integration tests
- [ ] Docker Compose setup
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
- LinkedIn: _add your link_
- Email: _add your email_

---

<div align="center">

If you found this project interesting, a ⭐ on the repo is much appreciated.

</div>
