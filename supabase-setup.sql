-- Supabase Database Setup for Travel Event Recommender
-- Run these commands in your Supabase SQL editor

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    indoor_outdoor TEXT CHECK (indoor_outdoor IN ('indoor', 'outdoor')),
    source TEXT DEFAULT 'sample',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    user_name TEXT DEFAULT 'Anonymous',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table (for tracking user sessions and preferences)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    device_info JSONB,
    preferences JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user preferences table for recommendation system
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    preferences JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_ratings_event_id ON ratings(event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON reviews(event_id);
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on events" ON events
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on ratings" ON ratings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on reviews" ON reviews
    FOR SELECT USING (true);

-- Create policies for public insert access
CREATE POLICY "Allow public insert on ratings" ON ratings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on reviews" ON reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert on events" ON events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on user_preferences" ON user_preferences
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on user_preferences" ON user_preferences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on user_preferences" ON user_preferences
    FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on users" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on users" ON users
    FOR UPDATE USING (true);

-- Insert some sample events
INSERT INTO events (title, description, category, city, start_time, end_time, lat, lon, indoor_outdoor, source) VALUES
('Eiffel Tower Visit', 'Iconic iron lattice tower and symbol of Paris', 'Sightseeing', 'Paris', '2024-01-15 09:00:00+00', '2024-01-15 11:00:00+00', 48.8584, 2.2945, 'outdoor', 'sample'),
('Louvre Museum Tour', 'World''s largest art museum and historic monument', 'Art & Culture', 'Paris', '2024-01-15 14:00:00+00', '2024-01-15 17:00:00+00', 48.8606, 2.3376, 'indoor', 'sample'),
('Tokyo Skytree', 'Broadcasting and observation tower in Tokyo', 'Sightseeing', 'Tokyo', '2024-01-16 10:00:00+00', '2024-01-16 12:00:00+00', 35.7101, 139.8107, 'indoor', 'sample'),
('Senso-ji Temple', 'Ancient Buddhist temple in Asakusa', 'History & Heritage', 'Tokyo', '2024-01-16 13:00:00+00', '2024-01-16 15:00:00+00', 35.7148, 139.7967, 'outdoor', 'sample'),
('Big Ben & Parliament', 'Iconic clock tower and Houses of Parliament', 'History & Heritage', 'London', '2024-01-17 10:00:00+00', '2024-01-17 12:00:00+00', 51.4994, -0.1245, 'outdoor', 'sample'),
('British Museum', 'Museum of human history, art and culture', 'Art & Culture', 'London', '2024-01-17 14:00:00+00', '2024-01-17 17:00:00+00', 51.5194, -0.1270, 'indoor', 'sample'),
('Colosseum Tour', 'Ancient amphitheater in the center of Rome', 'History & Heritage', 'Rome', '2024-01-18 09:00:00+00', '2024-01-18 11:00:00+00', 41.8902, 12.4922, 'outdoor', 'sample'),
('Vatican Museums', 'Art museums within Vatican City', 'Art & Culture', 'Rome', '2024-01-18 14:00:00+00', '2024-01-18 17:00:00+00', 41.9069, 12.4539, 'indoor', 'sample'),
('Sagrada Familia', 'Unfinished basilica designed by Antoni Gaudí', 'Art & Culture', 'Barcelona', '2024-01-19 10:00:00+00', '2024-01-19 12:00:00+00', 41.4036, 2.1744, 'indoor', 'sample'),
('Park Güell', 'Public park system with architectural elements', 'Nature & Parks', 'Barcelona', '2024-01-19 15:00:00+00', '2024-01-19 17:00:00+00', 41.4145, 2.1527, 'outdoor', 'sample');

-- Insert some sample ratings and reviews
INSERT INTO ratings (event_id, user_id, rating) VALUES
(1, 'user_1', 5),
(1, 'user_2', 4),
(1, 'user_3', 5),
(2, 'user_1', 5),
(2, 'user_2', 4),
(3, 'user_3', 5),
(4, 'user_1', 4),
(5, 'user_2', 5);

INSERT INTO reviews (event_id, user_id, rating, review_text, user_name) VALUES
(1, 'user_1', 5, 'Absolutely breathtaking! The view from the top is incredible. A must-visit when in Paris.', 'Sarah M.'),
(1, 'user_2', 4, 'Very crowded but worth the wait. The architecture is amazing.', 'James K.'),
(2, 'user_1', 5, 'Spent hours here and could have spent more. The art collection is world-class.', 'Sarah M.'),
(3, 'user_3', 5, 'Amazing views of Tokyo! The observation deck is spectacular.', 'Emma L.'),
(4, 'user_1', 4, 'Beautiful temple with great atmosphere. Very peaceful.', 'Sarah M.'),
(5, 'user_2', 5, 'Iconic landmark! The architecture is stunning.', 'James K.');

