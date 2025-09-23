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
    const userData = JSON.parse(event.body);

    if (!userData.id || !userData.session_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID and session ID are required' }),
      };
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('session_id', userData.session_id)
      .single();

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          device_info: userData.device_info,
          preferences: userData.preferences,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', userData.session_id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Insert new user
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            session_id: userData.session_id,
            device_info: userData.device_info,
            preferences: userData.preferences,
            created_at: userData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

      if (insertError) {
        throw insertError;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'User data saved successfully' 
      }),
    };
  } catch (error) {
    console.error('Error saving user data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to save user data' }),
    };
  }
};
