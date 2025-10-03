module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test basic functionality
    const testResponse = {
      success: true,
      message: 'API is working',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // Test database connection
    try {
      const { connectToDatabase } = require('./db');
      const { db } = await connectToDatabase();
      
      testResponse.database = 'Connected';
      testResponse.databaseVersion = await db.admin().serverInfo();
      
      // Test collections
      const collections = await db.listCollections().toArray();
      testResponse.collections = collections.map(c => c.name);
      
    } catch (dbError) {
      testResponse.database = 'Error: ' + dbError.message;
      testResponse.databaseVersion = null;
      testResponse.collections = [];
    }

    res.status(200).json(testResponse);

  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
};
