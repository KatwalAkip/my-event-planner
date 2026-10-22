-- Gatherwise PostgreSQL Database Schema with Row Level Security (RLS)
-- Supports persistent accounts, events, budget items, tasks, vendors, ideas, and assistant messages

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  default_currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  event_type VARCHAR(32) NOT NULL, -- 'wedding', 'birthday', 'community', etc.
  date DATE NOT NULL,
  time TIME,
  time_zone VARCHAR(64) DEFAULT 'America/New_York',
  location TEXT NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 1,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  budget_limit BIGINT NOT NULL DEFAULT 0, -- Minor units (cents)
  style TEXT DEFAULT 'Warm & Celebratory',
  notes TEXT,
  dietary_preferences TEXT,
  accessibility_needs TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_owner ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON public.events FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own events"
  ON public.events FOR DELETE
  USING (auth.uid() = owner_id);

-- 3. BUDGET ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  planned_amount BIGINT NOT NULL DEFAULT 0, -- Minor units
  actual_amount BIGINT NOT NULL DEFAULT 0,  -- Minor units
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'deposit_paid', 'paid_in_full'
  due_date DATE,
  notes TEXT,
  vendor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_budget_event_id ON public.budget_items(event_id);

ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access budget items for their events"
  ON public.budget_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE public.events.id = public.budget_items.event_id
      AND public.events.owner_id = auth.uid()
    )
  );

-- 4. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'medium', -- 'urgent', 'high', 'medium', 'low'
  status VARCHAR(20) NOT NULL DEFAULT 'todo',     -- 'todo', 'in_progress', 'completed'
  notes TEXT,
  assignee TEXT,
  source VARCHAR(24) DEFAULT 'manual',            -- 'manual', 'ai_suggested', 'template'
  milestone_phase TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access tasks for their events"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE public.events.id = public.tasks.event_id
      AND public.events.owner_id = auth.uid()
    )
  );

-- 5. VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  status VARCHAR(24) NOT NULL DEFAULT 'to_find', -- 'to_find', 'contacted', 'quote_received', 'booked', 'not_proceeding'
  quoted_amount BIGINT NOT NULL DEFAULT 0,
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON public.vendors(event_id);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access vendors for their events"
  ON public.vendors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE public.events.id = public.vendors.event_id
      AND public.events.owner_id = auth.uid()
    )
  );

-- 6. IDEAS TABLE
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  category VARCHAR(32) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  fit_rationale TEXT NOT NULL,
  estimated_cost_range TEXT NOT NULL,
  state VARCHAR(16) NOT NULL DEFAULT 'browsing', -- 'browsing', 'saved', 'dismissed'
  source VARCHAR(16) DEFAULT 'curated',          -- 'ai', 'curated', 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ideas_event_id ON public.ideas(event_id);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access ideas for their events"
  ON public.ideas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE public.events.id = public.ideas.event_id
      AND public.events.owner_id = auth.uid()
    )
  );

-- 7. ASSISTANT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(16) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  structured_output JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assistant_messages_event_id ON public.assistant_messages(event_id);

ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access assistant messages for their events"
  ON public.assistant_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE public.events.id = public.assistant_messages.event_id
      AND public.events.owner_id = auth.uid()
    )
  );
