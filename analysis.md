# B&B Inventory Management Application Analysis

This document provides a detailed analysis of the B&B Inventory Management Application, a full-stack SaaS solution built with Next.js, Convex, and TypeScript.

## 1. Project Overview

The B&B Inventory Management Application is a comprehensive system designed for construction companies to manage their inventory, projects, and vendors. The application provides a user-friendly interface for tracking inventory levels, managing stock movements, and associating inventory usage with specific construction projects. It also includes features for managing vendors, purchase orders, and user access control.

### Key Features:

*   **Inventory Management:** Track products, quantities, prices, and stock levels. Includes support for Moving Average Unit Cost (MAUC) calculation.
*   **Project Management:** Create and manage construction projects, and track inventory usage against each project.
*   **Vendor Management:** Maintain a database of vendors and their product offerings.
*   **User Roles:** Supports different user roles (worker, supervisor, admin) with varying levels of access and permissions.
*   **Analytics:** Provides a dashboard with key performance indicators (KPIs) and analytics on inventory and project data.
*   **Authentication:** Secure user authentication and authorization.
*   **Email Notifications:** Sends email notifications for purchase orders and other important events.

## 2. Tech Stack

The application is built using a modern, full-stack JavaScript/TypeScript technology stack:

*   **Frontend:**
    *   **Framework:** [Next.js](https://nextjs.org/) (React framework)
    *   **UI Components:** [Radix UI](https://www.radix-ui.com/) and [shadcn/ui](https://ui.shadcn.com/)
    *   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
    *   **Icons:** [Lucide React](https://lucide.dev/guide/packages/lucide-react)
    *   **Charts:** [Recharts](https://recharts.org/)
    *   **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
*   **Backend:**
    *   **Platform:** [Convex](https://www.convex.dev/) (Serverless backend platform)
    *   **Database:** Convex's built-in real-time database
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Authentication:** [@convex-dev/auth](https://github.com/get-convex/convex-auth-example)
*   **Email:** [Resend](https://resend.com/) and [@convex-dev/resend](https://github.com/get-convex/resend-for-convex)
*   **Linting:** [ESLint](https://eslint.org/)
*   **Package Manager:** [npm](https://www.npmjs.com/)

## 3. Project Structure

The project is organized into the following main directories:

*   `convex/`: Contains all the backend logic, including the database schema, queries, mutations, and authentication configuration.
*   `src/app/`: The main application directory for the Next.js frontend, following the App Router structure.
*   `src/components/`: Contains reusable React components used throughout the application.
*   `src/contexts/`: Contains React context providers, such as the `AuthContext`.
*   `public/`: Contains static assets like images and icons.

## 4. Modules

The application is divided into several logical modules, each responsible for a specific set of functionalities.

### 4.1. Backend Modules (Convex)

*   **Authentication (`auth.config.ts`, `auth.ts`):** Manages user sign-up, login, and session management using `@convex-dev/auth`.
*   **Data Schema (`schema.ts`):** Defines the entire database structure, including tables, indexes, and relationships.
*   **Product Management (`products.ts`):** Handles all CRUD (Create, Read, Update, Delete) operations for products. This module also includes logic for inventory tracking, such as `pullInventory`, `returnInventory`, and `receiveInventory`, which calculates the Moving Average Unit Cost (MAUC).
*   **Project Management (`projects.ts`):** Manages CRUD operations for construction projects and provides analytics for individual projects.
*   **Vendor Management (`vendors.ts`):** Handles CRUD operations for vendors and manages the relationship between vendors and products.
*   **User Management (`users.ts`):** Manages application-specific user data, including user roles and profiles.
*   **Analytics (`analytics.ts`):** Provides data for the main analytics dashboard, including KPIs and recent activity.
*   **Email (`emails.ts`):** Sends email notifications, such as purchase order requests, using the Resend service.
*   **Logging (`logs.ts`):** Logs user actions for auditing and debugging purposes.

### 4.2. Frontend Modules (Next.js)

*   **Core App (`src/app/`):**
    *   **`layout.tsx`:** The main application layout, which includes the theme provider, authentication provider, and other global components.
    *   **`page.tsx`:** The application's home/dashboard page, which provides an overview of the system.
    *   **`ConvexClientProvider.tsx`:** A crucial component that connects the Next.js frontend to the Convex backend.
*   **Pages (`src/app/.../page.tsx`):**
    *   **Inventory (`src/app/inventory/`):** The user interface for managing products, including a product table, filtering, and dialogs for various actions.
    *   **Projects (`src/app/projects/`):** The UI for managing construction projects, including a project list and creation/editing forms.
    *   **Vendors (`src/app/vendors/`):** The UI for managing vendors and their associated products.
    *   **Analytics (`src/app/analytics/`):** The UI for displaying analytics and KPIs.
    *   **Login (`src/app/login/`):** The user login and authentication page.
    *   **Admin Setup (`src/app/admin-setup/`):** A page for the initial setup of an administrator account.
*   **Components (`src/components/`):**
    *   **UI Primitives (`src/components/ui/`):** A collection of reusable UI components (e.g., `Button`, `Dialog`, `Table`) built with `shadcn/ui` and Radix UI.
    *   **Layout (`src/components/layout/`):** The main layout for logged-in users, which includes the sidebar and header.
    *   **Auth (`src/components/auth/`):** Components related to user authentication, such as the `AuthUserSetup` component.
*   **Contexts (`src/contexts/`):**
    *   **`AuthContext.tsx`:** Provides authentication state and user information to the entire application.

## 5. Data Model

The application's data model is defined in `convex/schema.ts`. The main tables are:

*   `appUsers`: Stores application-specific user information, including roles.
*   `products`: The central table for inventory items, with fields for quantity, price, category, and construction-specific details.
*   `projects`: Manages construction projects.
*   `inventoryTransactions`: Logs all inventory movements (e.g., sales, purchases, adjustments).
*   `purchaseOrders`: Manages purchase orders for new inventory.
*   `logs`: A general-purpose table for logging user actions.
*   `vendors`: Stores information about suppliers.
*   `vendorProducts`: A join table that links vendors to the products they supply.
*   `categories`: For organizing products into different categories.
*   `unitsOfMeasure`: Defines the units of measure for products.
*   `files`: For storing product images and other files.

## 6. Backend (Convex)

The backend is built on the Convex platform, which provides a serverless environment for running TypeScript code. The `convex/` directory contains all the backend logic:

*   **`schema.ts`:** Defines the database schema using Convex's schema definition functions.
*   **`products.ts`, `projects.ts`, `vendors.ts`, etc.:** These files contain the queries and mutations for interacting with the database. Queries are used for reading data, and mutations are used for writing data.
*   **`auth.config.ts` and `auth.ts`:** Configure the authentication system using `@convex-dev/auth`.
*   **`http.ts`:** Defines HTTP endpoints for handling webhooks and other external requests.
*   **`_generated/`:** This directory is automatically generated by Convex and contains the typed API for the backend functions.

## 7. Frontend (Next.js)

The frontend is a Next.js application that uses the App Router for routing and server-side rendering.

*   **`src/app/`:** The main application directory, with each subdirectory representing a route.
*   **`layout.tsx`:** The root layout for the application, which includes the main HTML structure and providers.
*   **`page.tsx`:** The main entry point of the application, which is the home page.
*   **`inventory/page.tsx`, `projects/page.tsx`, etc.:** These are the main pages of the application, each responsible for a specific feature.
*   **`ConvexClientProvider.tsx`:** A client-side provider that sets up the Convex client and makes it available to the rest of the application.
*   **`components/`:** The `src/components/` directory contains a rich set of reusable UI components, built with Radix UI and styled with Tailwind CSS.

## 8. Key Functionalities and Code Analysis

### 8.1. Inventory Management

The inventory management functionality is primarily handled in `src/app/inventory/page.tsx` on the frontend and `convex/products.ts` on the backend.

*   **`src/app/inventory/page.tsx`:** This page provides a comprehensive UI for managing products. It includes a table of products with filtering and sorting capabilities, as well as dialogs for adding, editing, and deleting products. It also allows users to "pull" and "return" inventory, which creates `inventoryTransactions` in the database.
*   **`convex/products.ts`:** This file contains the backend logic for managing products. It includes mutations for creating, updating, and deleting products, as well as for handling inventory movements like `pullInventory` and `returnInventory`. The `receiveInventory` mutation is particularly important as it calculates the Moving Average Unit Cost (MAUC) for each product.

### 8.2. Project Management

The project management functionality is handled in `src/app/projects/page.tsx` and `convex/projects.ts`.

*   **`src/app/projects/page.tsx`:** This page allows users to create, view, and manage construction projects. It displays a list of projects and provides options for editing and deleting them.
*   **`convex/projects.ts`:** This file contains the backend logic for projects, including mutations for creating, updating, and deleting projects. It also includes a query for fetching project analytics.

### 8.3. Authentication and User Roles

Authentication is handled by the `@convex-dev/auth` package. The `convex/auth.config.ts` file configures the authentication providers (e.g., email/password, social logins). The `appUsers` table in the database stores user roles, which are used to control access to different parts of the application.

## 9. Conclusion

The B&B Inventory Management Application is a well-structured and feature-rich application that demonstrates the power of a modern full-stack TypeScript setup. The combination of Next.js for the frontend and Convex for the backend provides a seamless development experience and a highly performant and scalable application. The use of TypeScript throughout the stack ensures type safety and improves code quality.