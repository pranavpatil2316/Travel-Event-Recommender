const { connectToDatabase } = require('./db');

module.exports = async function handler(req, res) {
  const { client, db } = await connectToDatabase();

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const likesCollection = db.collection('likes');

    switch (req.method) {
      case 'GET':
        const { userId, eventId } = req.query;
        
        if (userId && eventId) {
          // Check if user liked a specific event
          const like = await likesCollection.findOne({ userId, eventId });
          res.status(200).json({ success: true, liked: !!like });
        } else if (userId) {
          // Get all events liked by user
          const likes = await likesCollection
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();
          
          res.status(200).json({ success: true, likes });
        } else {
          // Get all likes (for admin purposes)
          const likes = await likesCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
          
          res.status(200).json({ success: true, likes });
        }
        break;

      case 'POST':
        const { userId, eventId } = req.body;

        if (!userId || !eventId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: userId, eventId' 
          });
        }

        // Check if like already exists
        const existingLike = await likesCollection.findOne({ userId, eventId });
        
        if (existingLike) {
          return res.status(200).json({ 
            success: true, 
            message: 'Event already liked',
            liked: true
          });
        }

        const newLike = {
          userId,
          eventId,
          createdAt: new Date()
        };

        const result = await likesCollection.insertOne(newLike);
        
        res.status(201).json({ 
          success: true, 
          like: { ...newLike, _id: result.insertedId },
          liked: true
        });
        break;

      case 'DELETE':
        const { userId: deleteUserId, eventId: deleteEventId } = req.query;

        if (!deleteUserId || !deleteEventId) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: userId, eventId' 
          });
        }

        const deleteResult = await likesCollection.deleteOne({ 
          userId: deleteUserId, 
          eventId: deleteEventId 
        });

        if (deleteResult.deletedCount === 0) {
          return res.status(404).json({ 
            success: false, 
            error: 'Like not found' 
          });
        }

        res.status(200).json({ 
          success: true, 
          message: 'Like removed',
          liked: false
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Likes API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  } finally {
    // Don't close the connection in serverless environment
    // client.close();
  }
}
