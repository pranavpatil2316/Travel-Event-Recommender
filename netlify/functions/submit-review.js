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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { eventId, rating, reviewText, userName } = JSON.parse(event.body);

    if (!eventId || !rating) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Event ID and rating are required' }),
      };
    }

    // Generate a unique user ID for this session
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add rating
    const { error: ratingError } = await supabase
      .from('ratings')
      .insert([
        {
          event_id: eventId,
          user_id: userId,
          rating: rating,
          created_at: new Date().toISOString(),
        },
      ]);

    if (ratingError) {
      throw ratingError;
    }

    // Add review if text provided
    if (reviewText && reviewText.trim()) {
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert([
          {
            event_id: eventId,
            user_id: userId,
            rating: rating,
            review_text: reviewText.trim(),
            user_name: userName || 'Anonymous',
            created_at: new Date().toISOString(),
          },
        ]);

      if (reviewError) {
        throw reviewError;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Review submitted successfully' 
      }),
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to submit review' }),
    };
  }
};

