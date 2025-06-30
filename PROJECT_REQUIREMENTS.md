# Project Requirements Document: Jewelry CRM

## 1. Introduction

This document outlines the technical requirements for the Jewelry CRM, a web-based application designed to help jewelry businesses manage customer relationships, sales processes, and showroom operations. The system will support three distinct user roles: Salesperson, Manager, and Admin, each with tailored dashboards and functionalities.

## 2. Goals

*   Provide an efficient way for salespeople to manage customer information and appointments.
*   Enable managers to oversee sales teams, manage showroom operations, and track performance.
*   Offer admins a comprehensive overview of the entire business, including sales, customer lifecycle, and operational metrics.
*   Ensure data segregation and appropriate access levels based on user roles.

## 3. Technology Stack

*   **Frontend:** Next.js 15 with React & TypeScript
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Realtime)
*   **Styling:** Tailwind CSS
*   **Linting:** ESLint

## 4. User Roles and Permissions

The system will feature three primary user roles, all accessing the application via a common login URL and then being redirected to their respective dashboards based on their role.

### 4.1. Salesperson
*   **Access:** Limited to their own customers and appointments.
*   **Primary Focus:** Customer interaction, data entry, appointment scheduling.

### 4.2. Manager
*   **Access:** Data related to all salespeople and customers within their assigned showroom.
*   **Primary Focus:** Sales team management, performance monitoring, showroom-level operations.

### 4.3. Admin
*   **Access:** Global access to all data across all showrooms and operations.
*   **Primary Focus:** Business-wide oversight, strategic decision-making, system administration.

## 5. Core Features

### 5.1. Authentication & Authorization
*   **Common Login:** Single login URL for all roles.
*   **Role-Based Redirect:** Users are redirected to their role-specific dashboard upon login.
*   **Supabase Auth:** Leverage Supabase for user authentication (email/password or magic links).
*   **Role Management:** User roles will be stored in the database (e.g., in a `profiles` table linked to Supabase `auth.users`).
*   **Route Protection:** Implement middleware or higher-order components to protect routes based on user roles.

### 5.2. Salesperson Features

#### 5.2.1. Dashboard
*   View a summary of upcoming appointments.
*   Quick access to "Add New Customer".

#### 5.2.2. Add New Customer
*   **Form:** Capture customer details. (Specific fields to be provided, e.g., Name, Contact Info, Preferences, Budget, Occasion, Next Visit Date).
*   **Database:** New customer records are added to a central `customers` table, linked to the salesperson who added them.
*   **Visibility:**
    *   Salesperson sees only customers they added.
    *   Manager sees all customers from their showroom.
    *   Admin sees all customers.

#### 5.2.3. Appointments Management
*   **View:** List of upcoming appointments for their customers.
*   **Schedule:** Ability to set/update "Next Meeting Date" or "Next Walk-in Date" for a customer (this could trigger an appointment creation).
*   **Reminders/Follow-ups:** System to remind salesperson to call customer for upcoming visit/appointment.
*   **Log Interactions:** (Optional) A way to log call outcomes or brief notes about appointment confirmations.

#### 5.2.4. My Customer Database
*   **View:** Access to a list of all customers they have personally added.
*   **Details:** View full details of their customers.
*   **Search/Filter:** Ability to search or filter their customer list.
*   **Edit:** Ability to update customer information they have added.

### 5.3. Manager Features

#### 5.3.1. Dashboard
*   Overview of team performance (e.g., appointments scheduled/met, new customers added by team within their showroom).
*   Key metrics for their assigned showroom.
*   Alerts or notifications (e.g., unassigned leads in their showroom, overdue tasks assigned to their team, customer escalations).

#### 5.3.2. Salesperson Management (Showroom-Specific)
*   **Create Salesperson:** Ability to add new salesperson accounts within their assigned showroom. This will involve creating a Supabase Auth user and assigning the "salesperson" role and their showroom ID.
*   **Monitor Salespeople:**
    *   View a list of salespeople in their showroom.
    *   Track individual salesperson performance (e.g., number of customers added, appointments met, sales value – all within their showroom).
    *   View activity logs or reports for each salesperson in their team.

#### 5.3.3. Showroom Customer Database
*   **View:** Access to all customer records associated with their showroom (i.e., added by any salesperson in that showroom).
*   **Search/Filter:** Ability to search and filter customers by salesperson, date added, status, etc., within their showroom.
*   **Edit Permissions:** Managers have read-only access to most customer details entered by salespeople. They can add their own managerial notes to a customer record and can override/update customer status (e.g., lead status), with changes attributed to the manager. Full edit of core data entered by salespeople is restricted to prevent data conflicts.

#### 5.3.4. Showroom Appointment Management
*   **Assign Appointments:** Ability to assign new leads or unassigned appointments (within their showroom) to specific salespeople in their team.
*   **Oversee Schedule:** View a consolidated calendar or list of all appointments for their showroom.
*   **Reassign:** Ability to reassign appointments within their showroom if needed.

#### 5.3.5. Task Management (for Salespeople in their Showroom)
*   Ability to assign tasks to salespeople in their team (e.g., "Follow up with Customer X", "Prepare for VIP appointment").
*   Track task completion for their team.

#### 5.3.6. Advanced Sales Analytics & Reporting (Showroom-Specific)
*   **Customizable Reports:** Generate showroom-specific reports (e.g., Sales by Product Category, Lead Source Effectiveness, Sales Cycle Analysis).
*   **Trend Analysis:** Visual charts showing trends over time for key showroom metrics.

#### 5.3.7. Team Goal Setting & Performance Dashboards
*   **Set Targets:** Define monthly/quarterly targets for their showroom team and individual salespeople.
*   **Progress Tracking:** Visual dashboards showing team and individual progress against set targets.

#### 5.3.8. Internal Communication & Knowledge Sharing
*   **Team Announcements:** Create, view, and manage announcements visible to their showroom team.
*   **Shared Resource Hub (Optional - Post MVP):** A place to upload and share documents like training materials for their team.

#### 5.3.9. Customer Escalation & Feedback Management
*   **View Escalations:** Review and manage customer issues or feedback flagged by their salespeople.
*   **Track Resolution:** Monitor the status and resolution of escalated issues.

#### 5.3.10. Showroom Calendar Enhancements
*   **Team Meetings:** Ability to schedule and view team meetings in the showroom calendar.
*   **Resource Allocation (Optional - Post MVP):** View availability of specific showroom resources (e.g., private viewing rooms).

### 5.4. Admin Features

#### 5.4.1. Global Dashboard (Bird's Eye View)
*   **Operational Metrics:**
    *   Total new customers (walk-ins) across all showrooms (e.g., daily, weekly, monthly).
    *   Total customers in the appointment loop.
    *   Customer segmentation/status (e.g., warm, interested, negotiation, closed-won, closed-lost).
    *   Sales cycle length analysis.
*   **Revenue Metrics:**
    *   Total revenue (filterable by showroom, salesperson, period).
    *   Average deal size.
*   **Product Insights:**
    *   Reports on which products or categories are most inquired about or sold.
*   **Salesperson & Showroom Performance:**
    *   Comparative performance of different showrooms and salespeople.

#### 5.4.2. User Management (System-wide)
*   Create, view, edit, and deactivate Manager accounts.
*   Potentially oversee Salesperson accounts across all showrooms.
*   Manage role assignments.

#### 5.4.3. Global Data Access
*   View all customers, appointments, sales data, etc., across the entire system without restriction.
*   Advanced search and filtering capabilities.

#### 5.4.4. Reporting & Analytics
*   Generate and export comprehensive reports on all aspects of the CRM data.
*   Customizable reporting views.

#### 5.4.5. System Configuration (Potentially)
*   Manage showroom details (if the system supports multiple distinct showroom entities).
*   Define custom fields or tags if needed.

## 6. Data Model (High-Level Tentative Schema)

This is an initial, high-level schema. Details will be refined during development.

*   **`profiles`** (extends `auth.users` from Supabase)
    *   `id` (UUID, Foreign Key to `auth.users.id`, Primary Key)
    *   `full_name` (TEXT)
    *   `role` (ENUM: 'salesperson', 'manager', 'admin')
    *   `showroom_id` (UUID, Foreign Key to `showrooms.id`, nullable for admin)
    *   `created_at` (TIMESTAMPTZ)
    *   `updated_at` (TIMESTAMPTZ)

*   **`customers`**
    *   `id` (UUID, Primary Key, `gen_random_uuid()`)
    *   `first_name` (TEXT)
    *   `last_name` (TEXT)
    *   `email` (TEXT, potentially UNIQUE)
    *   `phone_number` (TEXT, potentially UNIQUE)
    *   `address` (TEXT)
    *   `preferences` (TEXT or JSONB for structured preferences)
    *   `budget_range` (TEXT or NUMERIC)
    *   `occasion` (TEXT)
    *   `status` (ENUM: 'new', 'contacted', 'appointment_scheduled', 'warm', 'hot', 'negotiation', 'won', 'lost', 'inactive')
    *   `added_by_salesperson_id` (UUID, Foreign Key to `profiles.id`)
    *   `showroom_id` (UUID, Foreign Key to `showrooms.id`)
    *   `last_interaction_date` (TIMESTAMPTZ)
    *   `next_follow_up_date` (DATE)
    *   `created_at` (TIMESTAMPTZ)
    *   `updated_at` (TIMESTAMPTZ)
    *   *Other custom fields as provided by the user*

*   **`appointments`**
    *   `id` (UUID, Primary Key)
    *   `customer_id` (UUID, Foreign Key to `customers.id`)
    *   `salesperson_id` (UUID, ForeignKey to `profiles.id`)
    *   `appointment_datetime` (TIMESTAMPTZ)
    *   `status` (ENUM: 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')
    *   `notes` (TEXT)
    *   `created_by_id` (UUID, Foreign Key to `profiles.id` - who created it, could be salesperson or manager)
    *   `showroom_id` (UUID, Foreign Key to `showrooms.id`)
    *   `created_at` (TIMESTAMPTZ)
    *   `updated_at` (TIMESTAMPTZ)

*   **`showrooms`** (if multiple distinct showroom entities are managed)
    *   `id` (UUID, Primary Key)
    *   `name` (TEXT)
    *   `location` (TEXT)
    *   `manager_id` (UUID, Foreign Key to `profiles.id` - could be multiple managers per showroom or one primary)
    *   `created_at` (TIMESTAMPTZ)
    *   `updated_at` (TIMESTAMPTZ)

*   **`products`** (basic for now, can be expanded)
    *   `id` (UUID, Primary Key)
    *   `name` (TEXT)
    *   `category` (TEXT)
    *   `description` (TEXT)

*   **`customer_product_interest`** (to link customers to products they are interested in)
    *   `id` (UUID, Primary Key)
    *   `customer_id` (UUID, Foreign Key to `customers.id`)
    *   `product_id` (UUID, Foreign Key to `products.id`)
    *   `interest_level` (TEXT)
    *   `notes` (TEXT)
    *   `recorded_by_id` (UUID, Foreign Key to `profiles.id`)
    *   `created_at` (TIMESTAMPTZ)

*   **`sales_transactions`** (for tracking revenue)
    *   `id` (UUID, Primary Key)
    *   `customer_id` (UUID, Foreign Key to `customers.id`)
    *   `product_id` (UUID, Foreign Key to `products.id`, can be nullable if sale is not product-specific or for custom items)
    *   `salesperson_id` (UUID, Foreign Key to `profiles.id`)
    *   `showroom_id` (UUID, Foreign Key to `showrooms.id`)
    *   `amount` (NUMERIC)
    *   `transaction_date` (TIMESTAMPTZ)
    *   `notes` (TEXT)
    *   `created_at` (TIMESTAMPTZ)

*   **`tasks`** (for manager assigning tasks to salespeople)
    *   `id` (UUID, Primary Key)
    *   `assigned_to_salesperson_id` (UUID, Foreign Key to `profiles.id`)
    *   `assigned_by_manager_id` (UUID, Foreign Key to `profiles.id`)
    *   `customer_id` (UUID, Foreign Key to `customers.id`, optional)
    *   `title` (TEXT)
    *   `description` (TEXT)
    *   `due_date` (TIMESTAMPTZ)
    *   `status` (ENUM: 'pending', 'in_progress', 'completed', 'overdue')
    *   `created_at` (TIMESTAMPTZ)
    *   `updated_at` (TIMESTAMPTZ)


**Row Level Security (RLS) will be critical for Supabase tables to enforce data access rules.**

## 7. UI/UX Considerations (High Level)
*   **Role-Specific Dashboards:** Each role should land on a dashboard tailored to their most common tasks and information needs.
*   **Intuitive Navigation:** Clear and consistent navigation.
*   **Responsive Design:** The application should be usable on various screen sizes, primarily desktop/tablet for CRM operations.
*   **Data Tables:** Use well-structured tables for displaying lists of customers, appointments, etc., with sorting, filtering, and pagination.
*   **Forms:** Clear and user-friendly forms for data entry (e.g., adding new customers).

## 8. Non-Functional Requirements
*   **Security:**
    *   Secure authentication and authorization.
    *   Data protection through Supabase RLS.
    *   Protection against common web vulnerabilities.
*   **Scalability:** The system should be able to handle a growing number of users (e.g., 200+ salespeople) and data. Supabase provides good scalability.
*   **Performance:** Fast load times and responsive UI, especially for data-heavy views. Utilize Next.js features like SSR/SSG where appropriate.
*   **Usability:** The system should be intuitive and easy to use for non-technical users.

## 9. Future Considerations (Optional - Post MVP)
*   Direct integration with email/SMS for appointment reminders.
*   Advanced reporting and data visualization tools.
*   Inventory management (if jewelry pieces are tracked individually).
*   Integration with other business systems (e.g., accounting software).
*   Mobile application for salespeople.
*   Customer portal for viewing purchase history or upcoming appointments.

## 10. Questions for Clarification
*   For "Add New Customer" by Salesperson: A detailed list of questions/fields to be included in the form.
*   Specific metrics or KPIs for each dashboard.
*   Detailed workflow for appointment assignment by managers.
*   Clarification on edit permissions for Managers regarding customer data added by their salespeople.
*   Are there multiple, distinct showroom entities to manage, or is it one "showroom" concept for now? (The data model includes `showrooms` table for now).

This document will be updated as the project progresses and more details are clarified. 