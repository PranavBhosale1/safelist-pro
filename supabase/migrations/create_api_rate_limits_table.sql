-- Create api_rate_limits table for tracking per-user API usage
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_type TEXT NOT NULL CHECK (api_type IN ('standard', 'key_metrics')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient queries on user_id and api_type
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_user_api_type ON api_rate_limits(user_id, api_type);

-- Create index for efficient time-based queries
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_created_at ON api_rate_limits(created_at);

-- Create composite index for common query pattern (user_id, api_type, created_at)
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_user_api_type_created ON api_rate_limits(user_id, api_type, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own rate limit records
CREATE POLICY "Users can view their own rate limit records"
  ON api_rate_limits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for server-side operations)
-- Note: Service role bypasses RLS, so this is implicit but documented here

