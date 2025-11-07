import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export type ApiType = 'standard' | 'key_metrics';

interface RateLimitConfig {
  hourly: number;
  daily: number;
}

const RATE_LIMITS: Record<ApiType, RateLimitConfig> = {
  standard: {
    hourly: 100,
    daily: 1000,
  },
  key_metrics: {
    hourly: 10,
    daily: 100,
  },
};

interface RateLimitResult {
  allowed: boolean;
  remainingHourly: number;
  remainingDaily: number;
  retryAfter?: number; // seconds until next allowed request
}

/**
 * Check if a user has exceeded their rate limits
 * @param userId - The user ID
 * @param apiType - Type of API (standard or key_metrics)
 * @returns Rate limit check result
 */
export async function checkRateLimit(
  userId: string,
  apiType: ApiType
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[apiType];
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Get all API calls for this user and API type in the last hour
    const { data: hourlyCalls, error: hourlyError } = await supabase
      .from('api_rate_limits')
      .select('created_at')
      .eq('user_id', userId)
      .eq('api_type', apiType)
      .gte('created_at', oneHourAgo.toISOString())
      .order('created_at', { ascending: false });

    if (hourlyError) {
      console.error('Error checking hourly rate limit:', hourlyError);
      // On error, allow the request but log it
      return {
        allowed: true,
        remainingHourly: config.hourly,
        remainingDaily: config.daily,
      };
    }

    // Get all API calls for this user and API type in the last day
    const { data: dailyCalls, error: dailyError } = await supabase
      .from('api_rate_limits')
      .select('created_at')
      .eq('user_id', userId)
      .eq('api_type', apiType)
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false });

    if (dailyError) {
      console.error('Error checking daily rate limit:', dailyError);
      return {
        allowed: true,
        remainingHourly: config.hourly,
        remainingDaily: config.daily,
      };
    }

    const hourlyCount = hourlyCalls?.length || 0;
    const dailyCount = dailyCalls?.length || 0;

    const remainingHourly = Math.max(0, config.hourly - hourlyCount);
    const remainingDaily = Math.max(0, config.daily - dailyCount);

    // Check if limits are exceeded
    const hourlyExceeded = hourlyCount >= config.hourly;
    const dailyExceeded = dailyCount >= config.daily;

    if (hourlyExceeded || dailyExceeded) {
      // Calculate retry after time
      let retryAfter: number | undefined;
      
      if (hourlyExceeded && hourlyCalls && hourlyCalls.length > 0) {
        // Find the oldest call in the current hour window
        const oldestCall = new Date(hourlyCalls[hourlyCalls.length - 1].created_at);
        const nextAvailableTime = new Date(oldestCall.getTime() + 60 * 60 * 1000);
        retryAfter = Math.ceil((nextAvailableTime.getTime() - now.getTime()) / 1000);
      } else if (dailyExceeded && dailyCalls && dailyCalls.length > 0) {
        // Find the oldest call in the current day window
        const oldestCall = new Date(dailyCalls[dailyCalls.length - 1].created_at);
        const nextAvailableTime = new Date(oldestCall.getTime() + 24 * 60 * 60 * 1000);
        retryAfter = Math.ceil((nextAvailableTime.getTime() - now.getTime()) / 1000);
      }

      return {
        allowed: false,
        remainingHourly,
        remainingDaily,
        retryAfter,
      };
    }

    return {
      allowed: true,
      remainingHourly,
      remainingDaily,
    };
  } catch (error) {
    console.error('Unexpected error in rate limit check:', error);
    // On error, allow the request
    return {
      allowed: true,
      remainingHourly: config.hourly,
      remainingDaily: config.daily,
    };
  }
}

/**
 * Record an API call for rate limiting
 * @param userId - The user ID
 * @param apiType - Type of API (standard or key_metrics)
 */
export async function recordApiCall(
  userId: string,
  apiType: ApiType
): Promise<void> {
  try {
    const { error } = await supabase.from('api_rate_limits').insert({
      user_id: userId,
      api_type: apiType,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error recording API call:', error);
      // Don't throw - we don't want to fail the request if recording fails
    }
  } catch (error) {
    console.error('Unexpected error recording API call:', error);
    // Don't throw - we don't want to fail the request if recording fails
  }
}

/**
 * Clean up old rate limit records (older than 2 days)
 * This should be run periodically via a cron job
 */
export async function cleanupOldRateLimitRecords(): Promise<void> {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    
    const { error } = await supabase
      .from('api_rate_limits')
      .delete()
      .lt('created_at', twoDaysAgo.toISOString());

    if (error) {
      console.error('Error cleaning up rate limit records:', error);
    }
  } catch (error) {
    console.error('Unexpected error cleaning up rate limit records:', error);
  }
}




