-- ============================================
-- Campus Recruitment Management System (CRMS)
-- PostgreSQL Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'coordinator')),
    roll_number VARCHAR(50),
    branch VARCHAR(50),
    cgpa DECIMAL(4, 2),
    department VARCHAR(100),
    employee_id VARCHAR(50),
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch);

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    logo_url VARCHAR(255),
    role_offered VARCHAR(150) NOT NULL,
    package_lpa DECIMAL(5, 2) NOT NULL,
    eligibility_cgpa DECIMAL(4, 2) NOT NULL,
    visit_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    description TEXT,
    hiring_process TEXT,
    jd_pdf_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_visit_date ON companies(visit_date);
CREATE INDEX IF NOT EXISTS idx_companies_package ON companies(package_lpa);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- ============================================
-- NOTIFICATION READS TABLE (read tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS notification_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, notification_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_student ON notification_reads(student_id);

-- ============================================
-- INTERVIEW EXPERIENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS interview_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    batch_year VARCHAR(10) NOT NULL,
    interview_rounds TEXT NOT NULL,
    experience TEXT NOT NULL,
    preparation_tips TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiences_status ON interview_experiences(status);
CREATE INDEX IF NOT EXISTS idx_experiences_company ON interview_experiences(company_name);
CREATE INDEX IF NOT EXISTS idx_experiences_student ON interview_experiences(student_id);
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON interview_experiences(created_at);

-- ============================================
-- SEED: Default Coordinator Account
-- Password: coordinator123 (hashed with bcrypt)
-- ============================================
-- Run this after you set up bcrypt: insert manually or via seed script
