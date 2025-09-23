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
    const { city, category } = event.queryStringParameters || {};

    let query = supabase.from('events').select('*');

    if (city) {
      query = query.eq('city', city);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: events, error } = await query;

    if (error) {
      throw error;
    }

    // Get ratings and reviews for each event
    const eventsWithStats = await Promise.all(
      (events || []).map(async (event) => {
        // Get ratings
        const { data: ratings } = await supabase
          .from('ratings')
          .select('rating')
          .eq('event_id', event.id);

        // Get reviews
        const { data: reviews } = await supabase
          .from('reviews')
          .select('*')
          .eq('event_id', event.id)
          .order('created_at', { ascending: false });

        const averageRating = ratings && ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
          : 0;

        return {
          ...event,
          averageRating,
          ratingCount: ratings ? ratings.length : 0,
          reviews: reviews || [],
        };
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(eventsWithStats),
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch events' }),
    };
  }
};

