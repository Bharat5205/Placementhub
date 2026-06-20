Build a production-quality full-stack web application named **Campus Recruitment Management System (CRMS)**.

The application should be designed for engineering colleges to manage placement drives, company information, student notifications, interview experiences, and placement coordination activities.

The project should be suitable for showcasing on a software engineering resume and should demonstrate backend development, database design, authentication, authorization, API design, and clean architecture.

=========================
TECH STACK
==========

Frontend:

* React.js (Vite)
* Tailwind CSS
* React Router
* Axios
* React Query (TanStack Query)

Backend:

* Node.js
* Express.js

Database:

* PostgreSQL

Database Access:

* pg (node-postgres)
* Raw SQL Queries

Authentication:

* JWT Authentication
* Refresh Tokens
* bcrypt Password Hashing

Charts:

* Recharts

=========================
APPLICATION ROLES
=================

There are two roles:

1. Student
2. Placement Coordinator

Implement complete Role-Based Access Control (RBAC).

Students should only access student features.

Placement Coordinators should have access to management and administrative features.

=========================
AUTHENTICATION MODULE
=====================

Features:

* Student Registration
* Student Login
* Coordinator Login
* Logout
* JWT Access Tokens
* Refresh Tokens
* Protected Routes
* Password Hashing

User Table:

* id
* name
* email
* password_hash
* role
* roll_number
* branch
* cgpa
* created_at

=========================
STUDENT DASHBOARD
=================

Create a modern dashboard.

Sidebar:

* Dashboard
* Companies
* Notifications
* Interview Experiences
* Profile

Dashboard Cards:

* Total Companies
* Upcoming Companies
* Eligible Companies
* Recent Notifications

Dashboard Widgets:

* Upcoming Drives
* Recent Notifications
* Placement Timeline

=========================
COMPANIES MODULE
================

Students should view all company drives.

Company Fields:

* Company Name
* Logo
* Role Offered
* Package
* Eligibility CGPA
* Visit Date
* Application Deadline
* Job Description PDF

Features:

* Search Companies
* Filter by Package
* Filter by Role
* Filter by Date
* Pagination
* Sorting

Company Detail Page:

Display:

* Company Description
* Hiring Process
* Eligibility Criteria
* Package Details
* Application Deadline
* Previous Year Statistics
* Interview Experiences
* Job Description Download

=========================
INTERVIEW EXPERIENCE MODULE
===========================

Students can:

* Read Experiences
* Search Experiences
* Filter by Company
* Filter by Year

Experience Fields:

* Student Name
* Batch Year
* Company Name
* Interview Rounds
* Detailed Experience
* Preparation Tips

Students can submit experiences.

Submission workflow:

PENDING
→ APPROVED
→ VISIBLE TO STUDENTS

Coordinator approval required.

=========================
NOTIFICATION MODULE
===================

Students can:

* View Notifications
* Mark Notifications as Read

Notification Fields:

* Title
* Message
* Priority
* Created Date

Priority:

* High
* Medium
* Low

Features:

* Unread Badge Count
* Pagination

=========================
PROFILE MODULE
==============

Student Profile:

* Name
* Roll Number
* Email
* Branch
* CGPA

Allow profile updates.

Eligibility Checker:

Automatically compare student CGPA with company requirements.

Show:

* Eligible
* Not Eligible

for every company.

=========================
COORDINATOR DASHBOARD
=====================

Sidebar:

* Dashboard
* Manage Companies
* Manage Notifications
* Manage Experiences
* Student Directory

Dashboard Statistics:

* Total Students
* Total Companies
* Upcoming Drives
* Approved Experiences

Analytics:

* Placement Trends
* Company Visits by Year
* Branch-wise Statistics
* Package Distribution

Use Recharts.

=========================
COMPANY MANAGEMENT
==================

Coordinator can:

* Add Company
* Edit Company
* Delete Company

Company Form Fields:

* Name
* Logo
* Role
* Package
* Eligibility CGPA
* Visit Date
* Deadline
* Description
* Hiring Process
* Job Description PDF

File Upload Support:

* Logos
* PDFs

Store locally with clean architecture.

=========================
NOTIFICATION MANAGEMENT
=======================

Coordinator can:

* Create Notification
* Edit Notification
* Delete Notification

Notifications should immediately appear for students after refresh.

Backend architecture should support future WebSocket integration.

=========================
EXPERIENCE MANAGEMENT
=====================

Coordinator can:

* View Pending Experiences
* Approve Experiences
* Reject Experiences
* Delete Experiences

Only approved experiences are visible.

=========================
STUDENT DIRECTORY
=================

Coordinator can:

* View Students
* Search Students
* Filter by Branch
* Filter by CGPA

Display:

* Name
* Roll Number
* Branch
* CGPA
* Email

=========================
DATABASE DESIGN
===============

Use PostgreSQL.

Create normalized tables.

Tables:

users
companies
notifications
interview_experiences
notification_reads

Relationships:

users -> interview_experiences

companies -> interview_experiences

users -> notifications (read tracking)

Use proper Foreign Keys.

Create indexes on:

* email
* company_name
* visit_date
* created_at

Generate complete SQL schema.

=========================
BACKEND ARCHITECTURE
====================

Folder Structure:

src/

controllers/
routes/
middleware/
services/
database/
utils/
validations/
uploads/

Implement:

* Global Error Handler
* Request Validation
* Authentication Middleware
* Authorization Middleware
* Pagination Utility
* Search Utility
* Logging Middleware

Follow REST API best practices.

Return consistent JSON responses.

=========================
FRONTEND ARCHITECTURE
=====================

Folder Structure:

src/

pages/
components/
layouts/
hooks/
services/
context/
routes/

Create reusable components:

* Sidebar
* Navbar
* Dashboard Cards
* Data Table
* Search Bar
* Pagination
* Modal
* Toast Notifications
* Forms

=========================
UI REQUIREMENTS
===============

Design should look like a modern SaaS dashboard.

Inspired by:

* Linear
* Notion
* Vercel
* Stripe Dashboard

Include:

* Responsive Design
* Mobile Support
* Dark Mode
* Loading Skeletons
* Empty States
* Error States
* Confirmation Dialogs
* Form Validation

Avoid generic student-project styling.

=========================
SECURITY REQUIREMENTS
=====================

Implement:

* Password Hashing
* JWT Authentication
* Protected Routes
* Input Validation
* SQL Injection Protection using Parameterized Queries
* Secure Environment Variables

=========================
BONUS FEATURES
==============

If time permits, implement:

* Real-time Notifications using Socket.io
* Email Notifications
* Company Bookmarking
* Placement Calendar
* CSV Export
* Admin Audit Logs

=========================
CODE QUALITY
============

Generate production-ready code.

Requirements:

* Clean Architecture
* Modular Design
* Reusable Components
* Proper Naming Conventions
* SQL Queries Organized in Services
* Well-Structured Backend
* Scalable Folder Structure

Generate complete frontend, backend, PostgreSQL schema, SQL queries, authentication system, dashboards, and all required functionality.
