const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { userId } = event.queryStringParameters || {};

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID is required' }),
      };
    }

    // Get user's recommendation history (events they've rated)
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select(`
        *,
        events (
          id,
          title,
          description,
          category,
          city,
          indoor_outdoor,
          start_time,
          end_time,
          lat,
          lon
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform the data
    const recommendationHistory = ratings.map(rating => ({
      id: rating.id,
      rating: rating.rating,
      created_at: rating.created_at,
      event: rating.events
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(recommendationHistory),
    };
  } catch (error) {
    console.error('Error fetching user recommendation history:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch recommendation history' }),
    };
  }
};
