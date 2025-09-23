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
    const eventData = JSON.parse(event.body);

    // Check if event already exists
    const { data: existingEvents } = await supabase
      .from('events')
      .select('id')
      .eq('title', eventData.title)
      .eq('city', eventData.city);

    if (existingEvents && existingEvents.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          eventId: existingEvents[0].id,
          message: 'Event already exists' 
        }),
      };
    }

    // Add new event
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          ...eventData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        eventId: data[0].id,
        message: 'Event added successfully' 
      }),
    };
  } catch (error) {
    console.error('Error adding event:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to add event' }),
    };
  }
};

