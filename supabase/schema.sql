-- TradieHub Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('client', 'provider', 'admin')) NOT NULL DEFAULT 'client',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (extended user info)
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    abn TEXT,
    bio TEXT,
    vehicle_type TEXT,
    tools_available TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_id_verified BOOLEAN DEFAULT FALSE,
    is_insurance_verified BOOLEAN DEFAULT FALSE,
    is_police_checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider skills
CREATE TABLE provider_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    skill_category TEXT NOT NULL,
    years_experience INTEGER DEFAULT 0,
    certifications TEXT[],
    insurance_status TEXT DEFAULT 'unverified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider rates
CREATE TABLE provider_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    hourly_rate DECIMAL(10, 2),
    minimum_job_price DECIMAL(10, 2),
    call_out_fee DECIMAL(10, 2),
    emergency_surcharge DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider availability
CREATE TABLE provider_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME,
    end_time TIME,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location_address TEXT NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
    timeframe TEXT,
    status TEXT CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job photos
CREATE TABLE job_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job applications (quotes)
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    proposed_price DECIMAL(10, 2) NOT NULL,
    message TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, provider_id)
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    agreed_price DECIMAL(10, 2) NOT NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')) DEFAULT 'pending',
    commission_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    message_type TEXT CHECK (message_type IN ('text', 'photo', 'location')) DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    rating_quality INTEGER CHECK (rating_quality >= 1 AND rating_quality <= 5),
    rating_communication INTEGER CHECK (rating_communication >= 1 AND rating_communication <= 5),
    rating_punctuality INTEGER CHECK (rating_punctuality >= 1 AND rating_punctuality <= 5),
    rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id, reviewer_id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Users can read all users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all users" ON users FOR SELECT USING (true);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Provider skills policies
ALTER TABLE provider_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Provider skills are viewable by all" ON provider_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON provider_skills FOR ALL USING (auth.uid() = user_id);

-- Provider rates policies
ALTER TABLE provider_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Provider rates are viewable by all" ON provider_rates FOR SELECT USING (true);
CREATE POLICY "Users can manage own rates" ON provider_rates FOR ALL USING (auth.uid() = user_id);

-- Provider availability policies
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Provider availability is viewable by all" ON provider_availability FOR SELECT USING (true);
CREATE POLICY "Users can manage own availability" ON provider_availability FOR ALL USING (auth.uid() = user_id);

-- Jobs policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are viewable by all" ON jobs FOR SELECT USING (true);
CREATE POLICY "Clients can manage own jobs" ON jobs FOR ALL USING (auth.uid() = client_id);

-- Job photos policies
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Job photos are viewable by all" ON job_photos FOR SELECT USING (true);
CREATE POLICY "Job owners can manage photos" ON job_photos FOR ALL USING (
    auth.uid() IN (SELECT client_id FROM jobs WHERE id = job_photos.job_id)
);

-- Job applications policies
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applications visible to job owner and provider" ON job_applications FOR SELECT USING (
    auth.uid() = provider_id OR auth.uid() IN (SELECT client_id FROM jobs WHERE id = job_applications.job_id)
);
CREATE POLICY "Providers can manage own applications" ON job_applications FOR ALL USING (auth.uid() = provider_id);

-- Bookings policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bookings visible to involved parties" ON bookings FOR SELECT USING (
    auth.uid() = client_id OR auth.uid() = provider_id
);
CREATE POLICY "Clients can manage own bookings" ON bookings FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "Providers can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = provider_id);

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages visible to booking participants" ON messages FOR SELECT USING (
    auth.uid() IN (
        SELECT client_id FROM bookings WHERE id = messages.booking_id
        UNION
        SELECT provider_id FROM bookings WHERE id = messages.booking_id
    )
);
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() IN (
        SELECT client_id FROM bookings WHERE id = messages.booking_id
        UNION
        SELECT provider_id FROM bookings WHERE id = messages.booking_id
    )
);

-- Reviews policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by all" ON reviews FOR SELECT USING (true);
CREATE POLICY "Booking participants can manage reviews" ON reviews FOR ALL USING (
    auth.uid() = reviewer_id OR auth.uid() = reviewee_id
);

-- Notifications policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Functions

-- Function to get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate average rating for a provider
CREATE OR REPLACE FUNCTION get_provider_rating(provider_id UUID)
RETURNS TABLE (
    overall_rating DECIMAL(3, 2),
    quality_avg DECIMAL(3, 2),
    communication_avg DECIMAL(3, 2),
    punctuality_avg DECIMAL(3, 2),
    value_avg DECIMAL(3, 2),
    total_reviews INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(AVG((rating_quality + rating_communication + rating_punctuality + rating_value)::numeric / 4), 0)::DECIMAL(3, 2) AS overall_rating,
        COALESCE(AVG(rating_quality), 0)::DECIMAL(3, 2) AS quality_avg,
        COALESCE(AVG(rating_communication), 0)::DECIMAL(3, 2) AS communication_avg,
        COALESCE(AVG(rating_punctuality), 0)::DECIMAL(3, 2) AS punctuality_avg,
        COALESCE(AVG(rating_value), 0)::DECIMAL(3, 2) AS value_avg,
        COUNT(*)::INTEGER AS total_reviews
    FROM reviews
    WHERE reviewee_id = provider_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Seed data for testing
INSERT INTO users (id, email, full_name, role) VALUES
    (uuid_generate_v4(), 'admin@tradiehub.com.au', 'Admin User', 'admin'),
    (uuid_generate_v4(), 'client@test.com', 'John Client', 'client'),
    (uuid_generate_v4(), 'provider@test.com', 'Mike Tradie', 'provider')
ON CONFLICT (email) DO NOTHING;