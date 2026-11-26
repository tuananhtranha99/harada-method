-- V1__init_schema.sql
-- Initial schema for Harada Pixel Quest (PostgreSQL / Supabase)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    character_name VARCHAR(60) NOT NULL,
    character_level INTEGER NOT NULL DEFAULT 1,
    total_xp INTEGER NOT NULL DEFAULT 0,
    hp INTEGER NOT NULL DEFAULT 100,
    max_hp INTEGER NOT NULL DEFAULT 100,
    current_streak INTEGER NOT NULL DEFAULT 0,
    consecutive_missed_days INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE harada_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    purpose TEXT,
    target_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE harada_pillars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES harada_goals(id) ON DELETE CASCADE,
    slot_index SMALLINT NOT NULL CHECK (slot_index BETWEEN 1 AND 8),
    title VARCHAR(120) NOT NULL,
    stat_code VARCHAR(16) NOT NULL,
    stat_level INTEGER NOT NULL DEFAULT 1,
    stat_xp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pillar_goal_slot UNIQUE (goal_id, slot_index)
);

CREATE TABLE harada_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pillar_id UUID NOT NULL REFERENCES harada_pillars(id) ON DELETE CASCADE,
    slot_index SMALLINT NOT NULL CHECK (slot_index BETWEEN 1 AND 8),
    title VARCHAR(200) NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 25,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_action_pillar_slot UNIQUE (pillar_id, slot_index)
);

CREATE TABLE daily_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID NOT NULL REFERENCES harada_actions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_daily_log_action_date UNIQUE (action_id, log_date)
);

CREATE TABLE gear_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(32) NOT NULL, -- WEAPON, ARMOR, ACCESSORY, VEHICLE
    required_level INTEGER NOT NULL,
    required_stat_code VARCHAR(16),
    sprite_key VARCHAR(64) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_gear_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gear_item_id UUID NOT NULL REFERENCES gear_items(id) ON DELETE CASCADE,
    is_equipped BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_gear UNIQUE (user_id, gear_item_id)
);

CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed starter pixel gear & vehicles
INSERT INTO gear_items (code, name, category, required_level, required_stat_code, sprite_key, description) VALUES
('WEAPON_WOODEN_SWORD', 'Wooden Bokken', 'WEAPON', 1, NULL, 'weapon_bokken', 'Starter training sword for your daily quest.'),
('ACCESSORY_RUNNING_SHOES', 'Pixel Sneakers', 'ACCESSORY', 3, NULL, 'acc_sneakers', 'Unlocked at Level 3 to keep your daily pace.'),
('WEAPON_STEEL_KATANA', 'Discipline Katana', 'WEAPON', 7, NULL, 'weapon_katana', 'Forged through consistent daily pillars.'),
('VEHICLE_PIXEL_BICYCLE', '8-Bit Bicycle', 'VEHICLE', 10, NULL, 'veh_bicycle', 'First pixel ride unlocked at Level 10.'),
('VEHICLE_PIXEL_MOTO', 'Cyber Scooter', 'VEHICLE', 20, NULL, 'veh_moto', 'High-speed ride for veteran Harada masters.');

