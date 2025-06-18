-- Football Player Contracts Database Schema
-- Designed for Supabase with JSON fields for bonuses, wage progressions, and appearance fees

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clubs table
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  league VARCHAR(100),
  country VARCHAR(100),
  founded_year INTEGER,
  stadium VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  nationality VARCHAR(100),
  position VARCHAR(50),
  preferred_foot VARCHAR(10) CHECK (preferred_foot IN ('left', 'right', 'both')),
  height_cm INTEGER,
  weight_kg INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contract types enum
CREATE TYPE contract_status AS ENUM (
  'active',
  'expired',
  'terminated',
  'pending',
  'cancelled'
);

-- Main contracts table with JSON fields
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  
  -- Basic contract information
  contract_type VARCHAR(50) DEFAULT 'professional', -- professional, loan, youth, etc.
  status contract_status DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Financial details
  base_weekly_wage DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  
  -- JSON fields for complex financial structures
  bonuses JSONB DEFAULT '{}', -- Performance, loyalty, signing bonuses
  wage_progressions JSONB DEFAULT '{}', -- Yearly increases, promotion clauses
  appearance_fees JSONB DEFAULT '{}', -- Per game, per start, per minute fees
  
  -- Additional contract details
  agent_commission_percentage DECIMAL(5,2),
  release_clause DECIMAL(15,2),
  contract_value_total DECIMAL(15,2),
  
  -- Contract clauses and conditions
  clauses JSONB DEFAULT '{}', -- Break clauses, renewal options, etc.
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID, -- Could reference auth.users
  
  -- Constraints
  CONSTRAINT valid_contract_dates CHECK (end_date > start_date),
  CONSTRAINT positive_base_wage CHECK (base_weekly_wage > 0)
);

-- Contract amendments/modifications tracking
CREATE TABLE contract_amendments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  amendment_type VARCHAR(100) NOT NULL, -- wage_increase, extension, bonus_adjustment, etc.
  description TEXT,
  old_values JSONB,
  new_values JSONB,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID
);

-- Create indexes for performance
CREATE INDEX idx_contracts_player_id ON contracts(player_id);
CREATE INDEX idx_contracts_club_id ON contracts(club_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date);
CREATE INDEX idx_contracts_bonuses ON contracts USING GIN(bonuses);
CREATE INDEX idx_contracts_wage_progressions ON contracts USING GIN(wage_progressions);
CREATE INDEX idx_contracts_appearance_fees ON contracts USING GIN(appearance_fees);
CREATE INDEX idx_players_name ON players(last_name, first_name);
CREATE INDEX idx_clubs_name ON clubs(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data to demonstrate JSON structure

-- Sample clubs
INSERT INTO clubs (name, league, country) VALUES 
('Manchester United', 'Premier League', 'England'),
('FC Barcelona', 'La Liga', 'Spain'),
('Bayern Munich', 'Bundesliga', 'Germany');

-- Sample players - Manchester United
INSERT INTO players (first_name, last_name, date_of_birth, nationality, position) VALUES 
('Diogo', 'Dalot', '1999-03-18', 'Portugal', 'Defender'),
('André', 'Onana', '1996-04-02', 'Cameroon', 'Goalkeeper'),
('Kobbie', 'Mainoo', '2005-04-19', 'England', 'Midfielder');

-- Real Manchester United player contracts
-- Diogo Dalot Contract
INSERT INTO contracts (
  player_id, 
  club_id, 
  start_date, 
  end_date, 
  base_weekly_wage,
  bonuses,
  wage_progressions,
  appearance_fees,
  clauses
) VALUES (
  (SELECT id FROM players WHERE last_name = 'Dalot'),
  (SELECT id FROM clubs WHERE name = 'Manchester United'),
  '2024-07-01',
  '2028-06-30',
  110000.00,
  '{
    "signing_bonus": {
      "amount": 1000000,
      "currency": "GBP",
      "payment_schedule": "annual_instalments",
      "instalments": [
        {"date": "2024-07-31", "amount": 250000},
        {"date": "2025-07-31", "amount": 250000},
        {"date": "2026-07-31", "amount": 250000},
        {"date": "2027-07-31", "amount": 250000}
      ]
    },
    "performance_bonuses": {
      "clean_sheets": {
        "amount_per_clean_sheet": 100,
        "condition": "if_played"
      },
      "team_achievements": {
        "europa_league_final": {
          "amount": 200000,
          "condition": "appears_in_50_percent_plus_matches"
        }
      }
    },
    "loyalty_bonus": {
      "amount": 50000000,
      "payment_date": "2025-06-12"
    }
  }',
  '{
    "annual_increases": {
      "2024": {"period": "2024-07-01_2025-06-30", "weekly_wage": 110000},
      "2025": {"period": "2025-07-01_2026-06-30", "weekly_wage": 120000},
      "2026": {"period": "2026-07-01_2027-06-30", "weekly_wage": 130000},
      "2027": {"period": "2027-07-01_2028-06-30", "weekly_wage": 140000}
    },
    "conditional_increases": {
      "europa_league_final_qualification": {
        "wage_increase_percentage": 50,
        "effective_immediately": true
      },
      "premier_league_starts": {
        "every_5_starts_immediate": 20000,
        "every_5_starts_next_season": 5000
      }
    },
    "option_year": {
      "period": "2028-07-01_2029-06-30",
      "weekly_wage": 200000
    }
  }',
  '{
    "match_fees": {
      "premier_league": {
        "per_win_as_starter_2024_25": 1000,
        "per_first_half_substitute_2024_25": 500
      }
    }
  }',
  '{
    "release_clause": {
      "condition": "if_player_does_not_make_100_percent_of_appearances"
    },
    "image_rights": {
      "payment": {
        "amount": 500000,
        "vat_included": true,
        "payment_date": "2025-06-30"
      },
      "revenue_split": {
        "player_percentage": 50,
        "club_percentage": 50
      }
    },
    "option_period": {
      "start_date": "2028-07-01",
      "end_date": "2029-06-30"
    }
  }'
);

-- André Onana Contract
INSERT INTO contracts (
  player_id, 
  club_id, 
  start_date, 
  end_date, 
  base_weekly_wage,
  bonuses,
  wage_progressions,
  appearance_fees,
  clauses
) VALUES (
  (SELECT id FROM players WHERE last_name = 'Onana'),
  (SELECT id FROM clubs WHERE name = 'Manchester United'),
  '2024-07-01',
  '2025-06-30',
  10000.00,
  '{
    "loyalty_bonus": {
      "amount": 200000,
      "payment_date": "2025-02-01"
    }
  }',
  '{}',
  '{
    "match_fees": {
      "premier_league": {
        "per_start": 5000
      },
      "champions_league": {
        "per_start": 10000
      }
    }
  }',
  '{}'
);

-- Kobbie Mainoo Contract
INSERT INTO contracts (
  player_id, 
  club_id, 
  start_date, 
  end_date, 
  base_weekly_wage,
  bonuses,
  wage_progressions,
  appearance_fees,
  clauses
) VALUES (
  (SELECT id FROM players WHERE last_name = 'Mainoo'),
  (SELECT id FROM clubs WHERE name = 'Manchester United'),
  '2024-07-01',
  '2026-06-30',
  45000.00,
  '{
    "signing_bonus": {
      "amount": 2500000,
      "currency": "GBP",
      "payment_schedule": "annual_instalments",
      "instalments": [
        {"date": "2024-07-31", "amount": 1250000},
        {"date": "2025-07-31", "amount": 1250000}
      ]
    },
    "performance_bonuses": {
      "goals": {
        "amount_per_goal": 3000,
        "competition": "premier_league"
      },
      "team_achievements": {
        "europa_league_quarter_final": {
          "amount": 300000,
          "seasons": ["2024_25", "2025_26"]
        }
      }
    },
    "loyalty_bonus": {
      "amount": 300000,
      "payment_date": "2025-03-06"
    }
  }',
  '{
    "annual_increases": {
      "2024": {"period": "2024-07-01_2025-06-30", "weekly_wage": 45000},
      "2025": {"period": "2025-07-01_2026-06-30", "weekly_wage": 65000}
    },
    "conditional_increases": {
      "qualification_bonus": {
        "amount": 3000,
        "condition": "efl_championship_or_europa_league_group_stage",
        "requirement": "5_plus_premier_league_starts"
      },
      "premier_league_starts": {
        "amount": 5000,
        "per_10_starts": true,
        "max_starts": 100,
        "condition": "club_remains_in_premier_league"
      }
    }
  }',
  '{
    "match_fees": {
      "premier_league": {
        "per_start": 15000,
        "per_substitute_appearance": 7500
      }
    }
  }',
  '{
    "other_payments": {
      "accommodation": 30000,
      "relocation": 8000,
      "trigger": "manual"
    }
  }'
);

-- Views for easier querying

-- Active contracts with player and club details
CREATE VIEW active_contracts_view AS
SELECT 
  c.id as contract_id,
  p.first_name || ' ' || p.last_name as player_name,
  p.nationality,
  p.position,
  cl.name as club_name,
  cl.league,
  c.start_date,
  c.end_date,
  c.base_weekly_wage,
  c.status,
  c.bonuses,
  c.wage_progressions,
  c.appearance_fees
FROM contracts c
JOIN players p ON c.player_id = p.id
JOIN clubs cl ON c.club_id = cl.id
WHERE c.status = 'active';

-- Contract financial summary view
CREATE VIEW contract_financials_view AS
SELECT 
  c.id as contract_id,
  p.first_name || ' ' || p.last_name as player_name,
  cl.name as club_name,
  c.base_weekly_wage,
  c.base_weekly_wage * 52 as annual_base_wage,
  (c.bonuses->>'signing_bonus')::jsonb->>'amount' as signing_bonus,
  c.contract_value_total,
  (c.end_date - c.start_date)::integer as contract_duration_days
FROM contracts c
JOIN players p ON c.player_id = p.id
JOIN clubs cl ON c.club_id = cl.id;

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_amendments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your authentication needs)
CREATE POLICY "Enable read access for all users" ON clubs
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON players
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON contracts
  FOR SELECT USING (true);

-- More restrictive policies for INSERT/UPDATE/DELETE can be added based on user roles

-- Helpful functions for JSON queries

-- Function to calculate total potential bonus value
CREATE OR REPLACE FUNCTION calculate_max_annual_bonus(contract_bonuses JSONB)
RETURNS DECIMAL AS $$
DECLARE
  total_bonus DECIMAL := 0;
  performance_bonuses JSONB;
BEGIN
  -- Extract performance bonuses
  performance_bonuses := contract_bonuses->'performance_bonuses';
  
  IF performance_bonuses IS NOT NULL THEN
    -- Add goal bonuses cap
    total_bonus := total_bonus + COALESCE((performance_bonuses->'goals'->>'season_cap')::DECIMAL, 0);
    
    -- Add assist bonuses cap
    total_bonus := total_bonus + COALESCE((performance_bonuses->'assists'->>'season_cap')::DECIMAL, 0);
  END IF;
  
  RETURN total_bonus;
END;
$$ LANGUAGE plpgsql; 