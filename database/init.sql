-- Initial database setup for fragrance-battle-ai

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    favorite_notes TEXT[], -- Array of favorite fragrance notes
    disliked_notes TEXT[], -- Array of disliked fragrance notes
    preferred_brands TEXT[], -- Array of preferred brands
    budget_min INTEGER, -- Minimum budget in cents
    budget_max INTEGER, -- Maximum budget in cents
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fragrance categories enum
CREATE TYPE fragrance_category AS ENUM (
    'daily_driver',
    'college',
    'summer',
    'office',
    'club',
    'date',
    'signature',
    'winter',
    'special'
);

-- Fragrance concentration enum
CREATE TYPE fragrance_concentration AS ENUM (
    'EDT',
    'EDP',
    'Parfum',
    'Cologne'
);

-- Fragrances table
CREATE TABLE fragrances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    concentration fragrance_concentration,
    top_notes TEXT[], -- Array of top notes
    middle_notes TEXT[], -- Array of middle notes
    base_notes TEXT[], -- Array of base notes
    versatility INTEGER CHECK (versatility >= 1 AND versatility <= 5),
    categories fragrance_category[], -- Array of categories this fragrance fits
    description TEXT,
    image_url VARCHAR(500),
    price_cents INTEGER, -- Price in cents
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test sessions table
CREATE TABLE test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    is_blind_test BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Test results table
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES test_sessions(id) ON DELETE CASCADE,
    category fragrance_category NOT NULL,
    selected_fragrances UUID[], -- Array of selected fragrance IDs
    max_selections INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI recommendations table
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category fragrance_category,
    recommended_fragrances UUID[], -- Array of recommended fragrance IDs
    reasoning TEXT NOT NULL,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_fragrances_brand ON fragrances(brand);
CREATE INDEX idx_fragrances_categories ON fragrances USING GIN(categories);
CREATE INDEX idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX idx_test_results_session_id ON test_results(session_id);
CREATE INDEX idx_test_results_category ON test_results(category);
CREATE INDEX idx_ai_recommendations_user_id ON ai_recommendations(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fragrances_updated_at BEFORE UPDATE ON fragrances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
