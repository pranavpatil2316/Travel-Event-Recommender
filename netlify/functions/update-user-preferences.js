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
    const { userId, preferences } = JSON.parse(event.body);

    if (!userId || !preferences) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID and preferences are required' }),
      };
    }

    // Update user preferences in users table
    const { error: updateError } = await supabase
      .from('users')
      .update({
        preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', userId);

    if (updateError) {
      throw updateError;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'User preferences updated successfully' 
      }),
    };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update user preferences' }),
    };
  }
};
