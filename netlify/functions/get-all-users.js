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
    // Get all unique user IDs from ratings table
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('user_id')
      .not('user_id', 'is', null);

    if (error) {
      throw error;
    }

    // Extract unique user IDs
    const uniqueUserIds = [...new Set(ratings.map(rating => rating.user_id))];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(uniqueUserIds),
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch users' }),
    };
  }
};
