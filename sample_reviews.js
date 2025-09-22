// Sample reviews and ratings data for events
// This file contains realistic reviews to populate the database

const sampleReviews = [
    // Paris Events
    {
        eventTitle: "Louvre Museum Special Exhibition",
        city: "Paris",
        reviews: [
            {
                user_name: "Sarah M.",
                rating: 5,
                review_text: "Absolutely breathtaking! The special exhibition was incredible. Spent 4 hours here and could have stayed longer. The audio guide was very informative."
            },
            {
                user_name: "James K.",
                rating: 4,
                review_text: "Great museum but very crowded. The Mona Lisa was smaller than expected but still amazing to see in person. Book tickets in advance!"
            },
            {
                user_name: "Emma L.",
                rating: 5,
                review_text: "A must-visit in Paris! The architecture alone is worth the visit. The special exhibition was well-curated and the staff was helpful."
            },
            {
                user_name: "Michael R.",
                rating: 4,
                review_text: "Beautiful museum with incredible art collection. The lines can be long but it's worth the wait. Don't miss the Egyptian section!"
            }
        ]
    },
    {
        eventTitle: "Eiffel Tower Sunset Views",
        city: "Paris",
        reviews: [
            {
                user_name: "Anna T.",
                rating: 5,
                review_text: "Magical experience! The sunset from the Eiffel Tower is unforgettable. The city looks absolutely stunning from up there. Perfect for photos!"
            },
            {
                user_name: "David W.",
                rating: 4,
                review_text: "Great views but very windy at the top. The elevator ride was smooth and the staff was professional. Book online to skip the queue."
            },
            {
                user_name: "Lisa P.",
                rating: 5,
                review_text: "Bucket list item checked off! The view of Paris at sunset is indescribable. Bring a jacket as it gets cold at the top."
            },
            {
                user_name: "Robert H.",
                rating: 3,
                review_text: "Nice views but expensive. The crowds can be overwhelming. Good experience overall but not sure if it's worth the price."
            }
        ]
    },
    {
        eventTitle: "Seine River Cruise",
        city: "Paris",
        reviews: [
            {
                user_name: "Maria G.",
                rating: 5,
                review_text: "Perfect way to see Paris! The cruise was relaxing and informative. Great for families and couples. The commentary was excellent."
            },
            {
                user_name: "John D.",
                rating: 4,
                review_text: "Beautiful views of the city from the water. The boat was clean and comfortable. Good value for money. Would recommend!"
            },
            {
                user_name: "Sophie B.",
                rating: 5,
                review_text: "Romantic and peaceful experience. The sunset cruise was magical. Perfect way to end a day in Paris. Highly recommended!"
            }
        ]
    },
    {
        eventTitle: "Montmartre Art Walk",
        city: "Paris",
        reviews: [
            {
                user_name: "Alex C.",
                rating: 5,
                review_text: "Charming neighborhood with amazing street art! The Sacré-Cœur Basilica is stunning. Great cafes and artists everywhere. Very authentic Paris experience."
            },
            {
                user_name: "Nina F.",
                rating: 4,
                review_text: "Beautiful area but quite hilly. The views from the top are worth the climb. Lots of souvenir shops and street performers."
            },
            {
                user_name: "Tom S.",
                rating: 5,
                review_text: "My favorite part of Paris! The bohemian atmosphere is incredible. Great for photography and people watching. Don't miss the artists' square!"
            }
        ]
    },
    {
        eventTitle: "French Cooking Class",
        city: "Paris",
        reviews: [
            {
                user_name: "Jennifer A.",
                rating: 5,
                review_text: "Amazing experience! The chef was fantastic and we learned so much. The food we cooked was delicious. Great for food lovers!"
            },
            {
                user_name: "Mark T.",
                rating: 4,
                review_text: "Fun and educational class. The instructor was patient and knowledgeable. The wine pairing was excellent. Would do it again!"
            },
            {
                user_name: "Rachel K.",
                rating: 5,
                review_text: "Perfect activity for couples! We had so much fun cooking together. The recipes were authentic and the atmosphere was great."
            }
        ]
    },
    {
        eventTitle: "Versailles Palace Tour",
        city: "Paris",
        reviews: [
            {
                user_name: "William B.",
                rating: 5,
                review_text: "Magnificent palace! The Hall of Mirrors is breathtaking. The gardens are huge and beautiful. Plan for a full day visit."
            },
            {
                user_name: "Grace M.",
                rating: 4,
                review_text: "Incredible history and architecture. Very crowded but worth it. The audio guide was helpful. Don't miss the gardens!"
            },
            {
                user_name: "Oliver R.",
                rating: 5,
                review_text: "A masterpiece of French architecture! The opulence is overwhelming. The guided tour was excellent. A must-see near Paris."
            }
        ]
    },

    // Tokyo Events
    {
        eventTitle: "Tokyo Skytree Observatory",
        city: "Tokyo",
        reviews: [
            {
                user_name: "Yuki T.",
                rating: 5,
                review_text: "Incredible views of Tokyo! On a clear day you can see Mount Fuji. The observation deck is spacious and the staff is very helpful."
            },
            {
                user_name: "Hiroshi S.",
                rating: 4,
                review_text: "Great views but expensive. The elevator is fast and smooth. Good for photography. Book tickets online to save time."
            },
            {
                user_name: "Aiko M.",
                rating: 5,
                review_text: "Amazing experience! The city looks so different from above. The sunset view is particularly beautiful. Highly recommended!"
            }
        ]
    },
    {
        eventTitle: "Senso-ji Temple Experience",
        city: "Tokyo",
        reviews: [
            {
                user_name: "Kenji N.",
                rating: 5,
                review_text: "Beautiful traditional temple! The atmosphere is peaceful and spiritual. Great for experiencing Japanese culture. The surrounding market is fun too."
            },
            {
                user_name: "Maya K.",
                rating: 4,
                review_text: "Historic and beautiful temple. Very crowded but that's part of the experience. Good for photos and cultural immersion."
            },
            {
                user_name: "Takeshi Y.",
                rating: 5,
                review_text: "Must-visit in Tokyo! The temple is stunning and the area around it is full of traditional shops and restaurants."
            }
        ]
    },
    {
        eventTitle: "Tsukiji Fish Market Tour",
        city: "Tokyo",
        reviews: [
            {
                user_name: "Sakura H.",
                rating: 5,
                review_text: "Incredible experience! The tuna auction was fascinating. The sushi we had was the freshest I've ever tasted. Early start but worth it!"
            },
            {
                user_name: "Kenta I.",
                rating: 4,
                review_text: "Great for food lovers! The market is busy and exciting. The guided tour was informative. Don't miss the outer market for snacks."
            },
            {
                user_name: "Yumi T.",
                rating: 5,
                review_text: "Amazing cultural experience! The energy of the market is incredible. The sushi breakfast was unforgettable. Highly recommended!"
            }
        ]
    },
    {
        eventTitle: "Shibuya Crossing Adventure",
        city: "Tokyo",
        reviews: [
            {
                user_name: "Ryo M.",
                rating: 4,
                review_text: "Iconic Tokyo experience! The crossing is chaotic but fun. Great for people watching. The surrounding area has great shopping and food."
            },
            {
                user_name: "Akiko S.",
                rating: 5,
                review_text: "Must-do in Tokyo! The energy is incredible. Perfect for photos and videos. The surrounding district is full of entertainment."
            },
            {
                user_name: "Daiki K.",
                rating: 4,
                review_text: "Busy but exciting! The crossing is smaller than expected but still impressive. Great area for shopping and nightlife."
            }
        ]
    },
    {
        eventTitle: "Traditional Tea Ceremony",
        city: "Tokyo",
        reviews: [
            {
                user_name: "Emiko W.",
                rating: 5,
                review_text: "Beautiful and peaceful experience! The ceremony was authentic and the instructor was very knowledgeable. Great for learning Japanese culture."
            },
            {
                user_name: "Brian L.",
                rating: 4,
                review_text: "Interesting cultural experience. The tea was delicious and the ceremony was meditative. Good for those interested in Japanese traditions."
            },
            {
                user_name: "Naomi F.",
                rating: 5,
                review_text: "Perfect introduction to Japanese tea culture! The setting was beautiful and the experience was very relaxing. Highly recommended!"
            }
        ]
    },
    {
        eventTitle: "Harajuku Fashion District",
        city: "Tokyo",
        reviews: [
            {
                user_name: "Mika A.",
                rating: 5,
                review_text: "Fashion paradise! So many unique shops and styles. Great for people watching and shopping. The street fashion is incredible."
            },
            {
                user_name: "Lucas P.",
                rating: 4,
                review_text: "Interesting area with lots of character. Good for shopping and photos. Very crowded on weekends but that's part of the experience."
            },
            {
                user_name: "Rei T.",
                rating: 5,
                review_text: "Amazing place to see Tokyo's youth culture! The fashion is bold and creative. Great cafes and shops. Perfect for Instagram photos!"
            }
        ]
    },

    // London Events
    {
        eventTitle: "Tower Bridge Exhibition",
        city: "London",
        reviews: [
            {
                user_name: "Emma W.",
                rating: 5,
                review_text: "Fascinating engineering marvel! The glass walkway is thrilling. The history exhibition was very informative. Great views of the Thames."
            },
            {
                user_name: "James H.",
                rating: 4,
                review_text: "Interesting tour of a London icon. The Victorian engine rooms are impressive. Good value for money. The views are spectacular."
            },
            {
                user_name: "Charlotte B.",
                rating: 5,
                review_text: "Amazing experience! Walking on the glass floor was exciting. The staff was friendly and knowledgeable. Perfect for history lovers."
            }
        ]
    },
    {
        eventTitle: "Hyde Park Stroll",
        city: "London",
        reviews: [
            {
                user_name: "Oliver T.",
                rating: 5,
                review_text: "Beautiful park in the heart of London! Perfect for a peaceful walk. The Serpentine Lake is lovely. Great for families and joggers."
            },
            {
                user_name: "Isabella M.",
                rating: 4,
                review_text: "Nice escape from the city bustle. The park is well-maintained and spacious. Good for picnics and outdoor activities."
            },
            {
                user_name: "Henry S.",
                rating: 5,
                review_text: "One of London's best parks! The Speaker's Corner is interesting. Great for people watching and relaxation. Highly recommended!"
            }
        ]
    },
    {
        eventTitle: "British Museum Highlights",
        city: "London",
        reviews: [
            {
                user_name: "Victoria R.",
                rating: 5,
                review_text: "Incredible collection! The Rosetta Stone is amazing to see in person. The museum is huge so plan your visit. Free entry is fantastic!"
            },
            {
                user_name: "Edward L.",
                rating: 4,
                review_text: "World-class museum with amazing artifacts. Very crowded but worth it. The Egyptian section is particularly impressive."
            },
            {
                user_name: "Amelia K.",
                rating: 5,
                review_text: "Must-visit in London! The collection is overwhelming in the best way. The Elgin Marbles are stunning. Great for history buffs."
            }
        ]
    },
    {
        eventTitle: "Thames River Walk",
        city: "London",
        reviews: [
            {
                user_name: "George P.",
                rating: 4,
                review_text: "Pleasant walk along the Thames. Great views of London landmarks. The path is well-maintained. Good for exercise and sightseeing."
            },
            {
                user_name: "Eleanor D.",
                rating: 5,
                review_text: "Beautiful walk with stunning views! Perfect for photography. The path takes you past many famous landmarks. Highly recommended!"
            },
            {
                user_name: "Arthur W.",
                rating: 4,
                review_text: "Nice way to see London from a different perspective. The walk is relaxing and the views are great. Good for all fitness levels."
            }
        ]
    },
    {
        eventTitle: "West End Theatre Show",
        city: "London",
        reviews: [
            {
                user_name: "Margaret F.",
                rating: 5,
                review_text: "Outstanding performance! The production quality was incredible. The actors were amazing. A must-do experience in London!"
            },
            {
                user_name: "Richard C.",
                rating: 4,
                review_text: "Great show with talented performers. The theater was beautiful and the acoustics were excellent. Book tickets in advance."
            },
            {
                user_name: "Dorothy M.",
                rating: 5,
                review_text: "Magical evening! The show was spectacular and the atmosphere was electric. Perfect for a special night out in London."
            }
        ]
    },
    {
        eventTitle: "Borough Market Food Tour",
        city: "London",
        reviews: [
            {
                user_name: "Thomas B.",
                rating: 5,
                review_text: "Foodie paradise! The market has incredible variety and quality. The guided tour was excellent. Great for trying new foods."
            },
            {
                user_name: "Patricia L.",
                rating: 4,
                review_text: "Delicious food and interesting vendors. The market is busy but that's part of the charm. Good for lunch and shopping."
            },
            {
                user_name: "Christopher G.",
                rating: 5,
                review_text: "Amazing food market! The quality is outstanding and the atmosphere is lively. Perfect for food lovers and tourists alike."
            }
        ]
    }
];

// Function to get sample reviews for an event
function getSampleReviews(eventTitle, city) {
    const eventReviews = sampleReviews.find(review => 
        review.eventTitle === eventTitle && review.city === city
    );
    return eventReviews ? eventReviews.reviews : [];
}

// Function to get random sample reviews (for events without specific reviews)
function getRandomSampleReviews() {
    const allReviews = sampleReviews.flatMap(event => event.reviews);
    const shuffled = allReviews.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 random reviews
}

// Generate random reviews for events that don't have specific reviews
function generateRandomReviews(eventTitle, eventCategory, city, count = 3) {
    const reviewTemplates = {
        'Art & Culture': [
            "Amazing cultural experience! The art was incredible and the atmosphere was perfect.",
            "Great place to learn about local culture. The exhibits were well-curated and informative.",
            "Beautiful venue with stunning artwork. Perfect for art lovers and history enthusiasts.",
            "Educational and inspiring! The cultural significance really comes through.",
            "Wonderful experience! The attention to detail in the exhibits was impressive."
        ],
        'History & Heritage': [
            "Fascinating historical site! The guided tour was excellent and very informative.",
            "Rich history and beautiful architecture. A must-visit for history buffs.",
            "Incredible preservation of historical artifacts. The stories behind them are captivating.",
            "Step back in time! The historical significance is overwhelming in the best way.",
            "Educational and awe-inspiring. The heritage of this place is truly remarkable."
        ],
        'Nature & Parks': [
            "Beautiful natural setting! Perfect for a peaceful walk and relaxation.",
            "Stunning scenery and fresh air. Great escape from the city hustle.",
            "Wonderful place to connect with nature. The trails are well-maintained.",
            "Serene and picturesque! Perfect for photography and outdoor activities.",
            "Refreshing natural environment. Great for families and nature lovers."
        ],
        'Food & Drink': [
            "Delicious food and great atmosphere! The local cuisine was outstanding.",
            "Amazing culinary experience! The flavors were authentic and memorable.",
            "Perfect place for food lovers! The variety and quality were impressive.",
            "Great dining experience with excellent service. Highly recommended!",
            "Wonderful food and drinks! The local specialties were a real treat."
        ],
        'Adventure & Sports': [
            "Thrilling adventure! The activity was exciting and well-organized.",
            "Great adrenaline rush! Perfect for adventure seekers and thrill lovers.",
            "Exciting experience with professional guides. Safety was a top priority.",
            "Amazing outdoor activity! The views and experience were unforgettable.",
            "Perfect adventure for active travelers! The challenge was just right."
        ],
        'Shopping & Fashion': [
            "Great shopping experience! The variety and quality were excellent.",
            "Perfect place to find unique items! The local crafts were beautiful.",
            "Wonderful market with friendly vendors. Great for souvenirs and gifts.",
            "Excellent shopping destination! The prices were reasonable and fair.",
            "Amazing variety of goods! Perfect for finding something special."
        ],
        'Entertainment': [
            "Fantastic entertainment! The show was engaging and well-produced.",
            "Great night out! The performance was entertaining and memorable.",
            "Excellent entertainment venue! The atmosphere was lively and fun.",
            "Wonderful show with talented performers! Highly recommended for visitors.",
            "Amazing entertainment experience! Perfect for a fun evening out."
        ],
        'Sightseeing': [
            "Breathtaking views! The landmark is even more impressive in person.",
            "Iconic location with stunning architecture. Perfect for photos and memories.",
            "Must-see attraction! The historical significance is fascinating.",
            "Beautiful landmark with rich history. Great for tourists and locals alike.",
            "Spectacular views and interesting history! A highlight of the city."
        ]
    };

    const userNames = [
        "Alex Johnson", "Sarah Williams", "Michael Brown", "Emma Davis", "James Wilson",
        "Olivia Miller", "William Garcia", "Sophia Rodriguez", "Benjamin Martinez", "Isabella Anderson",
        "Lucas Taylor", "Charlotte Thomas", "Henry Jackson", "Amelia White", "Alexander Harris",
        "Mia Martin", "Mason Thompson", "Harper Garcia", "Ethan Martinez", "Evelyn Robinson",
        "Noah Clark", "Abigail Rodriguez", "Liam Lewis", "Emily Lee", "Mason Walker",
        "Elizabeth Hall", "Logan Allen", "Sofia Young", "Jackson King", "Avery Wright"
    ];

    const reviews = [];
    const templates = reviewTemplates[eventCategory] || reviewTemplates['Sightseeing'];
    
    for (let i = 0; i < count; i++) {
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
        const template = templates[Math.floor(Math.random() * templates.length)];
        const userName = userNames[Math.floor(Math.random() * userNames.length)];
        
        // Add some variation to the review text
        let reviewText = template;
        if (Math.random() > 0.5) {
            reviewText += ` The staff was friendly and helpful.`;
        }
        if (Math.random() > 0.7) {
            reviewText += ` Would definitely recommend to others!`;
        }
        if (Math.random() > 0.8) {
            reviewText += ` Great value for money.`;
        }
        
        reviews.push({
            user_name: userName,
            rating: rating,
            review_text: reviewText
        });
    }
    
    return reviews;
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sampleReviews, getSampleReviews, getRandomSampleReviews, generateRandomReviews };
}
