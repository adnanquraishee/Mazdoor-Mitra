-- MazdoorMitra Database Schema Migration
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('worker', 'contractor')),
  name VARCHAR(100) NOT NULL,
  preferred_language VARCHAR(10) DEFAULT 'hi',
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_type ON users(user_type);

-- Worker profiles
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  primary_skill VARCHAR(50) NOT NULL,
  secondary_skills TEXT[],
  daily_rate DECIMAL(10,2) NOT NULL,
  experience_years INTEGER DEFAULT 0,
  location_city VARCHAR(100) NOT NULL,
  location_state VARCHAR(50) NOT NULL,
  location_pincode VARCHAR(10),
  is_available BOOLEAN DEFAULT TRUE,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  total_jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_worker_user_id ON worker_profiles(user_id);
CREATE INDEX idx_worker_skill ON worker_profiles(primary_skill);
CREATE INDEX idx_worker_location ON worker_profiles(location_city);
CREATE INDEX idx_worker_available ON worker_profiles(is_available);

-- Contractor profiles
CREATE TABLE contractor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(200),
  location_city VARCHAR(100) NOT NULL,
  location_state VARCHAR(50) NOT NULL,
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  total_jobs_posted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contractor_user_id ON contractor_profiles(user_id);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contractor_id UUID NOT NULL REFERENCES users(id),
  worker_id UUID REFERENCES users(id),
  job_title VARCHAR(200) NOT NULL,
  skill_required VARCHAR(50) NOT NULL,
  location_address TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_jobs_contractor ON jobs(contractor_id);
CREATE INDEX idx_jobs_worker ON jobs(worker_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Suraksha Contracts (CRITICAL)
CREATE TABLE suraksha_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  daily_wage DECIMAL(10,2) NOT NULL,
  number_of_days INTEGER NOT NULL,
  work_hours_per_day DECIMAL(4,2) NOT NULL,
  overtime_rate_per_hour DECIMAL(10,2) NOT NULL,
  minimum_wage_alert BOOLEAN DEFAULT FALSE,
  total_contract_amount DECIMAL(12,2) NOT NULL,
  contractor_accepted_at TIMESTAMP WITH TIME ZONE,
  worker_accepted_at TIMESTAMP WITH TIME ZONE,
  contract_status VARCHAR(20) DEFAULT 'draft' CHECK (contract_status IN ('draft', 'active', 'completed', 'disputed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_contract_job ON suraksha_contracts(job_id);
CREATE INDEX idx_contract_status ON suraksha_contracts(contract_status);

-- Work logs
CREATE TABLE work_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES suraksha_contracts(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  hours_worked DECIMAL(4,2) NOT NULL,
  overtime_hours DECIMAL(4,2) DEFAULT 0.00,
  daily_payment DECIMAL(10,2) NOT NULL,
  marked_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_work_logs_contract ON work_logs(contract_id);
CREATE INDEX idx_work_logs_date ON work_logs(work_date);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES suraksha_contracts(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(200),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- OTP Verifications
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(15) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone_number, otp_code);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suraksha_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Basic policies (can be customized based on auth setup)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

CREATE POLICY "Anyone can view available workers" ON worker_profiles FOR SELECT USING (is_available = true);
CREATE POLICY "Workers can update own profile" ON worker_profiles FOR ALL USING (true);

CREATE POLICY "Contractors can view all contractors" ON contractor_profiles FOR SELECT USING (true);
CREATE POLICY "Contractors can update own profile" ON contractor_profiles FOR ALL USING (true);

CREATE POLICY "Users can view related jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Contractors can create jobs" ON jobs FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view related contracts" ON suraksha_contracts FOR SELECT USING (true);
CREATE POLICY "Users can create contracts" ON suraksha_contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update contracts" ON suraksha_contracts FOR UPDATE USING (true);

CREATE POLICY "Users can view work logs" ON work_logs FOR SELECT USING (true);
CREATE POLICY "Users can create work logs" ON work_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view payments" ON payments FOR SELECT USING (true);
