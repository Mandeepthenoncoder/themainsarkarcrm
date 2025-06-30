-- ENUM Types

CREATE TYPE user_role_enum AS ENUM (
    'admin',
    'manager',
    'salesperson'
);

CREATE TYPE user_status_enum AS ENUM (
    'active',
    'inactive',
    'pending_approval'
);

CREATE TYPE showroom_status_enum AS ENUM (
    'active',
    'inactive',
    'under_renovation'
);

CREATE TYPE lead_status_enum AS ENUM (
    'New Lead',
    'Contacted',
    'Qualified',
    'Proposal Sent',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
);

CREATE TYPE manager_lead_override_enum AS ENUM (
    'Hot',
    'Warm',
    'Cold'
);

CREATE TYPE appointment_status_enum AS ENUM (
    'Scheduled',
    'Confirmed',
    'Completed',
    'Cancelled',
    'Rescheduled',
    'No Show'
);

CREATE TYPE task_priority_enum AS ENUM (
    'High',
    'Medium',
    'Low'
);

CREATE TYPE task_status_enum AS ENUM (
    'To Do',
    'In Progress',
    'Completed',
    'Blocked'
);

CREATE TYPE goal_type_enum AS ENUM (
    'Showroom',
    'ManagerTeam',
    'SalespersonIndividual'
);

CREATE TYPE goal_status_enum AS ENUM (
    'Active',
    'Achieved',
    'Partially Achieved',
    'Not Achieved',
    'Cancelled'
);

CREATE TYPE announcement_status_enum AS ENUM (
    'Draft',
    'Published',
    'Archived'
);

CREATE TYPE announcement_target_role_enum AS ENUM (
    'All',
    'Admin',
    'Manager',
    'Salesperson'
);

CREATE TYPE escalation_priority_enum AS ENUM (
    'High',
    'Medium',
    'Low'
);

CREATE TYPE escalation_status_enum AS ENUM (
    'Open',
    'In Progress',
    'Pending Customer',
    'Resolved',
    'Closed'
);

CREATE TYPE flag_severity_enum AS ENUM (
    'low',
    'medium',
    'high'
);
