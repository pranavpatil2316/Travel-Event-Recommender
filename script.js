// Global variables
let eventsData = [];
let map;
let markers = [];
let apiCache = new Map(); // Cache for API responses
let eventRatings = new Map(); // Store event ratings
let currentUser = null;
let recommendationEngine = null; // Global recommendation engine instance

// City coordinates for map centering
const cityCoordinates = {
    'Paris': [48.8566, 2.3522],
    'Tokyo': [35.6762, 139.6503],
    'London': [51.5074, -0.1278],
    'Rome': [41.9028, 12.4964],
    'Madrid': [40.4168, -3.7038],
    'Berlin': [52.5200, 13.4050],
    'New York': [40.7128, -74.0060],
    'Los Angeles': [34.0522, -118.2437],
    'Toronto': [43.6532, -79.3832],
    'Vancouver': [49.2827, -123.1207],
    'Sydney': [-33.8688, 151.2093],
    'Melbourne': [-37.8136, 144.9631],
    'Mumbai': [19.0760, 72.8777],
    'Delhi': [28.7041, 77.1025],
    'Bangkok': [13.7563, 100.5018],
    'Chiang Mai': [18.7883, 98.9853],
    'São Paulo': [-23.5505, -46.6333],
    'Rio de Janeiro': [-22.9068, -43.1729],
    'Mexico City': [19.4326, -99.1332],
    'Cancun': [21.1619, -86.8515],
    'Seoul': [37.5665, 126.9780],
    'Busan': [35.1796, 129.0756],
    'Singapore': [1.3521, 103.8198]
};

// Country to cities mapping with famous places
const countryCities = {
    'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse', 'Nantes', 'Strasbourg', 'Montpellier'],
    'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Edinburgh', 'Bristol', 'Leeds'],
    'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence'],
    'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma'],
    'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund'],
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
    'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra'],
    'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune'],
    'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 'Koh Samui', 'Hua Hin', 'Ayutthaya'],
    'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba'],
    'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Cancun'],
    'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Ulsan', 'Seongnam'],
    'Singapore': ['Singapore']
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing application...');
    
    // Initialize form first to ensure it works
    initializeForm();
    loadEventsData();
    
    // Initialize shared database in background
    try {
        if (typeof initSharedDatabase === 'function') {
            await initSharedDatabase();
            console.log('Shared database initialized');
        }
        
        if (typeof getCurrentUser === 'function') {
            currentUser = await getCurrentUser();
            console.log('Current user:', currentUser);
        }

        // Initialize recommendation engine
        if (typeof RecommendationEngine !== 'undefined') {
            recommendationEngine = new RecommendationEngine();
            await recommendationEngine.initializeUserPreferences(currentUser.id);
            console.log('Recommendation engine initialized');
        }
    } catch (error) {
        console.error('Error initializing shared database:', error);
        // Continue without database - form will still work
    }
});

// Initialize form functionality
function initializeForm() {
    const form = document.getElementById('recommendationForm');
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');
    const cityLoading = document.getElementById('cityLoading');
    
    if (!form) {
        console.error('Form element not found!');
        return;
    }

    // Handle country selection
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        const citySelect = document.getElementById('city');
        
        if (selectedCountry) {
            // Show loading state
            cityLoading.classList.remove('hidden');
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">Loading cities...</option>';
            
            // Simulate API call delay for better UX
            setTimeout(() => {
                loadCitiesForCountry(selectedCountry);
            }, 500);
        } else {
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">Select a country first...</option>';
            cityLoading.classList.add('hidden');
        }
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted - preventDefault() worked!');
        handleFormSubmission();
        return false;
    });

    // Set default season based on current month
    const currentMonth = new Date().getMonth() + 1;
    let defaultSeason = 'spring';
    if (currentMonth >= 3 && currentMonth <= 5) defaultSeason = 'spring';
    else if (currentMonth >= 6 && currentMonth <= 8) defaultSeason = 'summer';
    else if (currentMonth >= 9 && currentMonth <= 11) defaultSeason = 'autumn';
    else defaultSeason = 'winter';
    
    document.getElementById('season').value = defaultSeason;

    // Add upcoming events filter
    const upcomingDaysSelect = document.getElementById('upcomingDays');
    if (upcomingDaysSelect) {
        upcomingDaysSelect.addEventListener('change', function() {
            loadUpcomingEvents();
        });
    }
}

// Load cities for selected country using API
async function loadCitiesForCountry(country) {
    const citySelect = document.getElementById('city');
    const cityLoading = document.getElementById('cityLoading');
    
    try {
        // Check cache first
        const cacheKey = `cities_${country}`;
        if (apiCache.has(cacheKey)) {
            populateCityDropdown(apiCache.get(cacheKey));
            return;
        }
        
        // Use REST Countries API to get country info
        const countryResponse = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name,capital,latlng`);
        const countryData = await countryResponse.json();
        
        if (countryData && countryData.length > 0) {
            const countryInfo = countryData[0];
            let cities = [];
            
            // Add capital city
            if (countryInfo.capital && countryInfo.capital.length > 0) {
                cities.push(countryInfo.capital[0]);
            }
            
            // Add major cities from our predefined list
            const majorCities = countryCities[country] || [];
            majorCities.forEach(city => {
                if (!cities.includes(city)) {
                    cities.push(city);
                }
            });
            
            // Cache the result
            apiCache.set(cacheKey, cities);
            populateCityDropdown(cities);
        } else {
            // Fallback to predefined cities
            const fallbackCities = countryCities[country] || [];
            populateCityDropdown(fallbackCities);
        }
    } catch (error) {
        console.error('Error loading cities:', error);
        // Fallback to predefined cities
        const fallbackCities = countryCities[country] || [];
        populateCityDropdown(fallbackCities);
    }
}

// Populate city dropdown
function populateCityDropdown(cities) {
    const citySelect = document.getElementById('city');
    const cityLoading = document.getElementById('cityLoading');
    
    // Populate city dropdown
    citySelect.innerHTML = '<option value="">All cities in country...</option>';
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    // Enable city selection and hide loading
    citySelect.disabled = false;
    cityLoading.classList.add('hidden');
}

// Load events data from JSON file
async function loadEventsData() {
    try {
        const response = await fetch('sample_events.json');
        if (!response.ok) {
            throw new Error('Failed to load events data');
        }
        eventsData = await response.json();
    } catch (error) {
        console.error('Error loading events data:', error);
        showError('Failed to load events data. Please check if sample_events.json exists.');
    }
}

// Handle form submission
function handleFormSubmission() {
    const formData = new FormData(document.getElementById('recommendationForm'));
    const country = formData.get('country');
    const city = formData.get('city');
    const season = formData.get('season');
    const duration = formData.get('duration');

    console.log('Form submission started:', { country, city, season, duration });

    if (!country || !season || !duration) {
        alert('Please fill in country, season, and duration fields');
        return;
    }
    
    // Show results section and loading state
    showResultsSection();
    showLoadingState();

    // Simulate processing delay for better UX
    setTimeout(async () => {
        try {
            console.log('Attempting to get recommendations...');
            
            // Try to get personalized recommendations first
            if (recommendationEngine && currentUser) {
                console.log('Recommendation engine and user available, generating recommendations...');
                const recommendations = await recommendationEngine.generateRecommendations(
                    currentUser.id, country, city, 10
                );
                
                if (recommendations && recommendations.length > 0) {
                    console.log('Recommendations found:', recommendations.length);
                    await displayRecommendations(recommendations, city || 'All Cities', country, season);
                    return;
                } else {
                    console.log('No recommendations found, falling back to regular events');
                }
            } else {
                console.log('Recommendation engine or user not available, using fallback');
            }
            
            // Fallback to regular events if no recommendations
            console.log('Loading regular events...');
            const allEvents = await getAllEventsForCountryOrCity(country, city, season, duration);
            console.log('Events loaded:', allEvents.length);
            await displayResults(allEvents, city || 'All Cities', country, season);
        } catch (error) {
            console.error('Error in form submission:', error);
            // Show a more user-friendly error message
            document.getElementById('resultsSection').innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-600 mb-4">
                        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Events</h3>
                    <p class="text-gray-600 mb-4">We're having trouble loading events right now. Please try again.</p>
                    <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Reload Page
                    </button>
                </div>
            `;
        }
    }, 1000);
}

// Get all events for a country or specific city
async function getAllEventsForCountryOrCity(country, city, season, duration) {
    let allEvents = [];

    if (city && city.trim() !== '') {
        // Get events for specific city
        allEvents = await getAllEventsForCity(city, season, duration);
    } else {
        // Get events for all cities in the country
        allEvents = await getAllEventsForCountry(country, season, duration);
    }

    if (!allEvents || allEvents.length === 0) {
        return null;
    }

    // Save events to shared database and get with ratings
    const eventsWithStats = await Promise.all(allEvents.map(async (event) => {
        try {
            // Save event to shared database if not exists
            const eventId = await saveEventToSharedDatabase(event);
            
            // Get event with stats from shared database
            const eventWithStats = await sharedEventDB.getEventWithStats(eventId);
            
            if (eventWithStats && eventWithStats.ratingCount > 0) {
                return {
                    ...event,
                    id: eventId,
                    interests: extractInterestsFromEvent(event),
                    rating: eventWithStats.averageRating,
                    ratingCount: eventWithStats.ratingCount,
                    reviews: eventWithStats.reviews
                };
            } else {
                // Fallback to generated rating
                return {
                    ...event,
                    id: eventId,
                    interests: extractInterestsFromEvent(event),
                    rating: getEventRating(event),
                    ratingCount: getRatingCount(event),
                    reviews: []
                };
            }
        } catch (error) {
            console.error('Error processing event:', error);
            // Fallback to generated rating
            return {
                ...event,
                id: Date.now(),
                interests: extractInterestsFromEvent(event),
                rating: getEventRating(event),
                ratingCount: getRatingCount(event),
                reviews: []
            };
        }
    }));

    // Sort by rating (highest first)
    return eventsWithStats.sort((a, b) => b.rating - a.rating);
}

// Save event to shared database
async function saveEventToSharedDatabase(event) {
    try {
        // Check if event already exists
        const existingEvents = await sharedEventDB.getEvents(event.city, event.category);
        const existingEvent = existingEvents.find(e => 
            e.title === event.title && e.city === event.city
        );
        
        if (existingEvent) {
            return existingEvent.id;
        }
        
        // Add new event
        return await sharedEventDB.addEvent(event);
    } catch (error) {
        console.error('Error saving event to shared database:', error);
        return Date.now(); // Fallback ID
    }
}

// Seed database with sample reviews and ratings
async function seedDatabaseWithSampleData() {
    try {
        console.log('Seeding database with sample data...');
        
        // Load sample events from JSON
        const response = await fetch('sample_events.json');
        const sampleEvents = await response.json();
        
        // Create sample users for reviews
        const sampleUsers = [
            { id: 1, name: 'Sarah M.' },
            { id: 2, name: 'James K.' },
            { id: 3, name: 'Emma L.' },
            { id: 4, name: 'Michael R.' },
            { id: 5, name: 'Anna T.' },
            { id: 6, name: 'David W.' },
            { id: 7, name: 'Lisa P.' },
            { id: 8, name: 'Robert H.' },
            { id: 9, name: 'Maria G.' },
            { id: 10, name: 'John D.' }
        ];
        
        // Add events to database
        for (const event of sampleEvents) {
            // Check if event already exists
            const existingEvents = await eventDB.getEvents();
            const eventExists = existingEvents.some(e => 
                e.title === event.title && e.city === event.city
            );
            
            let eventId;
            if (eventExists) {
                // Find existing event ID
                const existingEvent = existingEvents.find(e => 
                    e.title === event.title && e.city === event.city
                );
                eventId = existingEvent.id;
            } else {
                // Add new event
                eventId = await eventDB.addEvent(event);
            }
            
            // Check if this event already has reviews
            const existingReviews = await eventDB.getEventReviews(eventId);
            
            if (existingReviews.length === 0) {
                // Get specific reviews for this event
                let eventReviews = getSampleReviews(event.title, event.city);
                
                // If no specific reviews, generate random ones
                if (eventReviews.length === 0) {
                    eventReviews = generateRandomReviews(event.title, event.category, event.city, 3);
                }
                
                // Ensure at least 2 reviews
                if (eventReviews.length < 2) {
                    const additionalReviews = generateRandomReviews(event.title, event.category, event.city, 2 - eventReviews.length);
                    eventReviews = eventReviews.concat(additionalReviews);
                }
                
                // Add reviews and ratings for this event
                for (let i = 0; i < eventReviews.length; i++) {
                    const review = eventReviews[i];
                    const user = sampleUsers[i % sampleUsers.length];
                    
                    // Add rating
                    await eventDB.addRating(eventId, user.id, review.rating);
                    
                    // Add review
                    await eventDB.addReview(eventId, user.id, review.rating, review.review_text, review.user_name);
                }
                
                console.log(`Added ${eventReviews.length} reviews for event: ${event.title}`);
            }
        }
        
        console.log('Database seeded successfully with sample data');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

// Get event rating (simulate real ratings)
function getEventRating(event) {
    const eventKey = `${event.title}_${event.city}`;
    
    // Check if we have a cached rating
    if (eventRatings.has(eventKey)) {
        return eventRatings.get(eventKey);
    }
    
    // Generate a realistic rating based on event type and popularity
    let baseRating = 3.5; // Base rating
    
    // Adjust based on event category
    const categoryBonuses = {
        'Art & Culture': 0.3,
        'History & Heritage': 0.2,
        'Nature & Parks': 0.4,
        'Food & Drink': 0.5,
        'Adventure & Sports': 0.3,
        'Shopping & Fashion': 0.2,
        'Entertainment': 0.4,
        'Sightseeing': 0.3
    };
    
    baseRating += categoryBonuses[event.category] || 0;
    
    // Add some randomness
    const randomFactor = (Math.random() - 0.5) * 0.8;
    const finalRating = Math.max(1, Math.min(5, baseRating + randomFactor));
    
    // Cache the rating
    eventRatings.set(eventKey, finalRating);
    
    return finalRating;
}

// Get rating count (simulate number of reviews)
function getRatingCount(event) {
    const eventKey = `${event.title}_${event.city}_count`;
    
    if (eventRatings.has(eventKey)) {
        return eventRatings.get(eventKey);
    }
    
    // Generate realistic review counts
    const count = Math.floor(Math.random() * 500) + 10; // 10-510 reviews
    eventRatings.set(eventKey, count);
    
    return count;
}

// Get all events for a specific city
async function getAllEventsForCity(city, season, duration) {
    let cityEvents = [];

    // First, try to get events from shared database
    try {
        const dbEvents = await sharedEventDB.getEvents(city);
        if (dbEvents && dbEvents.length > 0) {
            cityEvents = dbEvents;
        }
    } catch (error) {
        console.error('Error getting events from shared database:', error);
    }

    // If no database events, try sample data
    if (cityEvents.length === 0) {
        cityEvents = eventsData.filter(event => 
            event.city.toLowerCase() === city.toLowerCase()
        );
    }

    // Try to get real events from APIs
    try {
        const apiEvents = await getRealEventsFromAPI(city, season);
        if (apiEvents && apiEvents.length > 0) {
            cityEvents = cityEvents.concat(apiEvents);
        }
    } catch (error) {
        console.error('Error fetching real events:', error);
    }

    // If no events found, try to get coordinates and create a fallback event
    if (cityEvents.length === 0) {
        try {
            const coordinates = await getCityCoordinates(city);
            if (coordinates) {
                // Create a fallback event for the city
                const fallbackEvent = createFallbackEvent(city, coordinates, season);
                cityEvents = [fallbackEvent];
            }
        } catch (error) {
            console.error('Error getting city coordinates:', error);
        }
    }

    return cityEvents;
}

// Get real events from APIs
async function getRealEventsFromAPI(city, season) {
    try {
        // Use Eventbrite API (free tier) or similar
        // For demo purposes, we'll simulate API calls
        const cacheKey = `events_${city}_${season}`;
        if (apiCache.has(cacheKey)) {
            return apiCache.get(cacheKey);
        }

        // Simulate API response with realistic events
        const apiEvents = await simulateEventAPI(city, season);
        
        // Cache the results
        apiCache.set(cacheKey, apiEvents);
        
        return apiEvents;
    } catch (error) {
        console.error('Error fetching events from API:', error);
        return [];
    }
}

// Simulate real event API response
async function simulateEventAPI(city, season) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const eventTemplates = {
        spring: [
            { title: `${city} Spring Festival`, category: 'Art & Culture', indoor_outdoor: 'outdoor' },
            { title: `${city} Cherry Blossom Viewing`, category: 'Nature & Parks', indoor_outdoor: 'outdoor' },
            { title: `${city} Spring Market`, category: 'Food & Drink', indoor_outdoor: 'outdoor' }
        ],
        summer: [
            { title: `${city} Summer Music Festival`, category: 'Entertainment', indoor_outdoor: 'outdoor' },
            { title: `${city} Beach Party`, category: 'Entertainment', indoor_outdoor: 'outdoor' },
            { title: `${city} Summer Food Fair`, category: 'Food & Drink', indoor_outdoor: 'outdoor' }
        ],
        autumn: [
            { title: `${city} Autumn Harvest Festival`, category: 'Food & Drink', indoor_outdoor: 'outdoor' },
            { title: `${city} Fall Colors Tour`, category: 'Nature & Parks', indoor_outdoor: 'outdoor' },
            { title: `${city} Cultural Heritage Week`, category: 'Art & Culture', indoor_outdoor: 'indoor' }
        ],
        winter: [
            { title: `${city} Winter Wonderland`, category: 'Entertainment', indoor_outdoor: 'outdoor' },
            { title: `${city} Holiday Market`, category: 'Shopping & Fashion', indoor_outdoor: 'outdoor' },
            { title: `${city} Cozy Cafe Tour`, category: 'Food & Drink', indoor_outdoor: 'indoor' }
        ]
    };

    const templates = eventTemplates[season] || eventTemplates.spring;
    const events = [];
    
    // Generate 2-4 random events
    const numEvents = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numEvents; i++) {
        const template = templates[Math.floor(Math.random() * templates.length)];
        const coordinates = await getCityCoordinates(city);
        
        if (coordinates) {
            const startTime = new Date();
            startTime.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + 2 + Math.floor(Math.random() * 4));

            events.push({
                title: template.title,
                description: `Experience the best of ${city} during ${season}. This ${template.category.toLowerCase()} event offers a unique way to explore the city.`,
                category: template.category,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                lat: coordinates[0] + (Math.random() - 0.5) * 0.01, // Add some variation
                lon: coordinates[1] + (Math.random() - 0.5) * 0.01,
                city: city,
                indoor_outdoor: template.indoor_outdoor,
                source: 'API' // Mark as API-sourced
            });
        }
    }
    
    return events;
}

// Get all events for a country (multiple cities)
async function getAllEventsForCountry(country, season, duration) {
    let countryEvents = [];

    // First, try to get all events from shared database for the country
    try {
        const allDbEvents = await sharedEventDB.getEvents();
        const countryDbEvents = allDbEvents.filter(event => {
            const eventCountry = getCountryFromCity(event.city);
            return eventCountry === country;
        });
        
        if (countryDbEvents.length > 0) {
            countryEvents = countryDbEvents;
        }
    } catch (error) {
        console.error('Error getting country events from shared database:', error);
    }

    // If no database events, get events for each city
    if (countryEvents.length === 0) {
        const cities = countryCities[country] || [];
        
        for (const city of cities) {
            try {
                const cityEvents = await getAllEventsForCity(city, season, duration);
                if (cityEvents && cityEvents.length > 0) {
                    countryEvents = countryEvents.concat(cityEvents);
                }
            } catch (error) {
                console.error(`Error getting events for ${city}:`, error);
            }
        }
    }

    // If no events found, create a few fallback events for major cities
    if (countryEvents.length === 0 && cities.length > 0) {
        const majorCities = cities.slice(0, 3); // Take first 3 cities
        for (const city of majorCities) {
            try {
                const coordinates = await getCityCoordinates(city);
                if (coordinates) {
                    const fallbackEvent = createFallbackEvent(city, coordinates, season);
                    countryEvents.push(fallbackEvent);
                }
            } catch (error) {
                console.error(`Error creating fallback event for ${city}:`, error);
            }
        }
    }

    return countryEvents;
}

// Helper function to get country from city
function getCountryFromCity(city) {
    for (const [country, cities] of Object.entries(countryCities)) {
        if (cities.includes(city)) {
            return country;
        }
    }
    return null;
}

// Get city coordinates using API
async function getCityCoordinates(city) {
    try {
        // Check cache first
        const cacheKey = `coords_${city}`;
        if (apiCache.has(cacheKey)) {
            return apiCache.get(cacheKey);
        }

        // Use Nominatim API (OpenStreetMap) for geocoding
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            apiCache.set(cacheKey, coords);
            return coords;
        }
    } catch (error) {
        console.error('Error getting city coordinates:', error);
    }
    
    // Fallback to predefined coordinates
    return cityCoordinates[city] || null;
}

// Create a fallback event for cities without sample data
function createFallbackEvent(city, coordinates, season) {
    const seasonEvents = {
        spring: [
            { title: `${city} Spring Festival`, category: 'Art & Culture', indoor_outdoor: 'outdoor' },
            { title: `${city} City Walking Tour`, category: 'Sightseeing', indoor_outdoor: 'outdoor' },
            { title: `${city} Local Market Visit`, category: 'Food & Drink', indoor_outdoor: 'outdoor' }
        ],
        summer: [
            { title: `${city} Summer Music Festival`, category: 'Entertainment', indoor_outdoor: 'outdoor' },
            { title: `${city} Beach Day Experience`, category: 'Nature & Parks', indoor_outdoor: 'outdoor' },
            { title: `${city} Outdoor Adventure`, category: 'Adventure & Sports', indoor_outdoor: 'outdoor' }
        ],
        autumn: [
            { title: `${city} Autumn Cultural Tour`, category: 'Art & Culture', indoor_outdoor: 'outdoor' },
            { title: `${city} Historical Sites Visit`, category: 'History & Heritage', indoor_outdoor: 'outdoor' },
            { title: `${city} Local Cuisine Experience`, category: 'Food & Drink', indoor_outdoor: 'indoor' }
        ],
        winter: [
            { title: `${city} Winter Wonderland`, category: 'Nature & Parks', indoor_outdoor: 'outdoor' },
            { title: `${city} Museum & Gallery Tour`, category: 'Art & Culture', indoor_outdoor: 'indoor' },
            { title: `${city} Cozy Cafe Experience`, category: 'Food & Drink', indoor_outdoor: 'indoor' }
        ]
    };

    const eventTemplates = seasonEvents[season] || seasonEvents.spring;
    const randomEvent = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
    
    // Generate random times for the event
    const startTime = new Date();
    startTime.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 2 + Math.floor(Math.random() * 4));

    return {
        title: randomEvent.title,
        description: `Experience the best of ${city} during ${season}. This ${randomEvent.category.toLowerCase()} activity offers a unique way to explore the city.`,
        category: randomEvent.category,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        lat: coordinates[0],
        lon: coordinates[1],
        city: city,
        indoor_outdoor: randomEvent.indoor_outdoor
    };
}

// Extract interests from event data
function extractInterestsFromEvent(event) {
    const interests = [];
    const text = (event.title + ' ' + event.description + ' ' + event.category).toLowerCase();
    
    // Define interest keywords
    const interestKeywords = {
        'Art & Culture': ['art', 'museum', 'gallery', 'culture', 'exhibition', 'painting', 'sculpture', 'architecture', 'opera', 'theatre', 'music', 'concert', 'performance'],
        'History & Heritage': ['history', 'heritage', 'ancient', 'historical', 'monument', 'palace', 'castle', 'temple', 'church', 'cathedral', 'fort', 'ruins'],
        'Nature & Parks': ['park', 'garden', 'nature', 'outdoor', 'hiking', 'beach', 'lake', 'mountain', 'forest', 'wildlife', 'scenic', 'view'],
        'Food & Drink': ['food', 'restaurant', 'cooking', 'cuisine', 'market', 'wine', 'beer', 'local', 'traditional', 'taste', 'dining'],
        'Adventure & Sports': ['adventure', 'sport', 'climbing', 'hiking', 'biking', 'swimming', 'diving', 'surfing', 'skiing', 'extreme', 'active'],
        'Shopping & Fashion': ['shopping', 'market', 'fashion', 'boutique', 'store', 'mall', 'souvenir', 'local', 'craft', 'design'],
        'Entertainment': ['entertainment', 'show', 'performance', 'concert', 'theatre', 'cinema', 'nightlife', 'club', 'bar', 'party'],
        'Sightseeing': ['sightseeing', 'landmark', 'view', 'panoramic', 'observation', 'tower', 'bridge', 'square', 'plaza', 'famous']
    };
    
    // Check which interests match
    Object.keys(interestKeywords).forEach(interest => {
        if (interestKeywords[interest].some(keyword => text.includes(keyword))) {
            interests.push(interest);
        }
    });
    
    // If no specific interests found, add based on category
    if (interests.length === 0) {
        interests.push(event.category);
    }
    
    return interests;
}

// Calculate season suitability score
function calculateSeasonScore(event, season) {
    const isIndoor = event.indoor_outdoor === 'indoor';
    
    // Season preferences
    const seasonPreferences = {
        'spring': { indoor: 0.7, outdoor: 0.9 },
        'summer': { indoor: 0.6, outdoor: 1.0 },
        'autumn': { indoor: 0.8, outdoor: 0.8 },
        'winter': { indoor: 1.0, outdoor: 0.5 }
    };
    
    return seasonPreferences[season][isIndoor ? 'indoor' : 'outdoor'];
}

// Calculate duration suitability score
function calculateDurationScore(event, duration) {
    // Simple scoring based on event type and duration
    const eventDuration = new Date(event.end_time) - new Date(event.start_time);
    const hours = eventDuration / (1000 * 60 * 60);
    
    const durationPreferences = {
        'weekend': { short: 1.0, medium: 0.8, long: 0.5 },
        'week': { short: 0.8, medium: 1.0, long: 0.9 },
        'extended': { short: 0.6, medium: 0.9, long: 1.0 }
    };
    
    let eventLength = 'medium';
    if (hours <= 2) eventLength = 'short';
    else if (hours >= 6) eventLength = 'long';
    
    return durationPreferences[duration][eventLength];
}

// Calculate content similarity using simple bag-of-words approach
function calculateContentSimilarity(event, userInterests) {
    const eventText = (event.title + ' ' + event.description + ' ' + event.category).toLowerCase();
    let matches = 0;
    
    userInterests.forEach(interest => {
        if (eventText.includes(interest)) {
            matches++;
        }
    });
    
    return Math.min(matches / userInterests.length, 1);
}

// Calculate time match score
function calculateTimeMatch(event, startDate, endDate) {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);
    
    // Check if event overlaps with travel dates
    if (eventStart <= endDate && eventEnd >= startDate) {
        return 1;
    }
    return 0;
}

// Calculate proximity score based on distance from city center
function calculateProximityScore(event, destination) {
    const cityCenter = cityCoordinates[destination];
    if (!cityCenter) return 0.5; // Default score for unknown cities
    
    const distance = calculateHaversineDistance(
        cityCenter[0], cityCenter[1],
        event.lat, event.lon
    );
    
    // Score decays from 1 at 0km to 0 at 20km
    return Math.max(0, 1 - (distance / 20));
}

// Calculate weather suitability score
function calculateWeatherScore(event) {
    // Simulate "bad weather" randomly for demo purposes
    const isBadWeather = Math.random() < 0.3; // 30% chance of bad weather
    
    if (event.indoor_outdoor === 'indoor') {
        return isBadWeather ? 1 : 0.8; // Indoor events are good in bad weather
    } else {
        return isBadWeather ? 0.3 : 1; // Outdoor events are bad in bad weather
    }
}

// Calculate haversine distance between two points
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Show results section
function showResultsSection() {
    document.getElementById('resultsSection').classList.remove('hidden');
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// Show loading state
function showLoadingState() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('resultsContent').classList.add('hidden');
}

// Show error state
function showError(message) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('resultsContent').classList.add('hidden');
    document.getElementById('errorMessage').textContent = message;
}

// Display personalized recommendations
async function displayRecommendations(recommendations, city, country, season) {
    document.getElementById('loadingState').classList.add('hidden');
    
    if (!recommendations || recommendations.length === 0) {
        showError(`No recommendations for ${city}, ${country} yet. Try rating some events first!`);
        return;
    }
    
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('resultsContent').classList.remove('hidden');
    
    // Convert recommendations to events format
    const events = recommendations.map(rec => ({
        ...rec.event,
        recommendationScore: rec.score,
        recommendationReason: rec.reason,
        isRecommendation: true
    }));
    
    displaySummary(events, city, country, season);
    displayInterestCategories(events);
    displayEventsList(events);
    await displayMap(events, city);
    await loadUpcomingEvents();
}

// Display results
async function displayResults(events, city, country, season) {
    document.getElementById('loadingState').classList.add('hidden');
    
    if (!events || events.length === 0) {
        showError(`No sample data for ${city}, ${country} yet.`);
        return;
    }
    
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('resultsContent').classList.remove('hidden');
    
    displaySummary(events, city, country, season);
    displayInterestCategories(events);
    displayEventsList(events);
    await displayMap(events, city);
    await loadUpcomingEvents();
}

// Display summary statistics
function displaySummary(events, city, country, season) {
    const summaryContainer = document.getElementById('summaryStats');
    const avgRating = (events.reduce((sum, event) => sum + event.rating, 0) / events.length).toFixed(1);
    const indoorEvents = events.filter(event => event.indoor_outdoor === 'indoor').length;
    const outdoorEvents = events.filter(event => event.indoor_outdoor === 'outdoor').length;
    const uniqueInterests = [...new Set(events.flatMap(event => event.interests))].length;
    const uniqueCities = [...new Set(events.map(event => event.city))].length;
    const apiEvents = events.filter(event => event.source === 'API').length;
    
    summaryContainer.innerHTML = `
        <div class="bg-blue-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">${events.length}</div>
            <div class="text-sm text-gray-600">Total Events</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-green-600">${avgRating} ⭐</div>
            <div class="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">${indoorEvents}/${outdoorEvents}</div>
            <div class="text-sm text-gray-600">Indoor/Outdoor</div>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
            <div class="text-2xl font-bold text-orange-600">${apiEvents}</div>
            <div class="text-sm text-gray-600">Live Events</div>
        </div>
    `;
}

// Display interest categories with popup functionality
function displayInterestCategories(events) {
    const categoriesContainer = document.getElementById('interestCategories');
    
    // Group events by interest
    const interestGroups = {};
    events.forEach(event => {
        event.interests.forEach(interest => {
            if (!interestGroups[interest]) {
                interestGroups[interest] = [];
            }
            interestGroups[interest].push(event);
        });
    });
    
    // Create category cards
    categoriesContainer.innerHTML = Object.keys(interestGroups).map(interest => `
        <div class="interest-category bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg border border-gray-200 cursor-pointer" onclick="showInterestPopup('${interest}', ${JSON.stringify(interestGroups[interest]).replace(/"/g, '&quot;')})">
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold text-gray-800">${interest}</h4>
                <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">${interestGroups[interest].length}</span>
            </div>
            <p class="text-sm text-gray-600">Click to see ${interestGroups[interest].length} events in this category</p>
        </div>
    `).join('');
}

// Show interest category popup
function showInterestPopup(interest, events) {
    // Create popup overlay
    const popupOverlay = document.createElement('div');
    popupOverlay.className = 'popup-overlay';
    popupOverlay.onclick = () => popupOverlay.remove();
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    popupContent.onclick = (e) => e.stopPropagation();
    
    popupContent.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-800">${interest} Events</h3>
            <button onclick="this.closest('.popup-overlay').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="space-y-3 max-h-96 overflow-y-auto">
            ${events.map(event => `
                <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-semibold text-gray-800 text-sm">${event.title}</h4>
                        <div class="flex items-center space-x-1">
                            ${event.source === 'API' ? '<span class="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">LIVE</span>' : ''}
                            <div class="rating-badge text-white text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                                ${event.rating.toFixed(1)} ⭐
                            </div>
                        </div>
                    </div>
                    <p class="text-xs text-gray-600 mb-2">${event.description}</p>
                    <div class="flex items-center justify-between text-xs text-gray-500">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${event.category}</span>
                        <span class="flex items-center">
                            ${event.indoor_outdoor === 'indoor' ? '🏠' : '🌳'}
                            ${event.indoor_outdoor}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
}

// Display events list
function displayEventsList(events) {
    const eventsContainer = document.getElementById('eventsList');
    
    eventsContainer.innerHTML = events.map(event => `
        <div class="event-card bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-semibold text-gray-800">${event.title}</h4>
                <div class="flex items-center space-x-2">
                    ${event.source === 'API' ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">LIVE</span>' : ''}
                    <div class="rating-badge text-white text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                        ${event.rating.toFixed(1)} ⭐
                    </div>
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">${event.description}</p>
            <div class="flex items-center justify-between text-xs text-gray-500 mb-2">
                <div class="flex items-center space-x-2">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${event.category}</span>
                    <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded">${event.city}</span>
                    <span class="flex items-center">
                        ${event.indoor_outdoor === 'indoor' ? '🏠' : '🌳'}
                        ${event.indoor_outdoor}
                    </span>
                </div>
                <div class="text-right">
                    <div>${formatDateTime(event.start_time)}</div>
                    <div>to ${formatDateTime(event.end_time)}</div>
                </div>
            </div>
            <div class="flex flex-wrap gap-1 mb-2">
                ${event.interests.map(interest => `
                    <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">${interest}</span>
                `).join('')}
            </div>
            <div class="mt-2 text-xs text-gray-400">
                <div class="flex justify-between">
                    <span>${event.ratingCount} reviews</span>
                    <span>${event.source === 'API' ? 'Live Event' : 'Sample Data'}</span>
                </div>
            </div>
            <div class="mt-3 flex space-x-2">
                <button onclick="showEventDetails(${event.id})" class="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600">
                    View Details
                </button>
                <button onclick="showEventReviews(${event.id})" class="bg-green-500 text-white text-xs px-3 py-1 rounded hover:bg-green-600">
                    Reviews (${event.reviews ? event.reviews.length : 0})
                </button>
            </div>
            ${event.isRecommendation ? `
                <div class="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <div class="text-xs text-yellow-800">
                        <strong>Why recommended:</strong> ${event.recommendationReason}
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Display map with event markers
async function displayMap(events, destination) {
    // Clear existing map
    if (map) {
        map.remove();
    }
    
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];
    
    // Initialize map with a default center
    let mapCenter = [0, 0];
    let mapZoom = 2;
    
    // If we have events, use their coordinates to center the map
    if (events && events.length > 0) {
        const group = new L.featureGroup();
        events.forEach(event => {
            const marker = L.marker([event.lat, event.lon])
                .bindPopup(`
                    <div class="p-2">
                        <h4 class="font-semibold">${event.title}</h4>
                        <p class="text-sm text-gray-600">${event.category}</p>
                        <p class="text-xs text-gray-500">${event.city}</p>
                        <p class="text-xs text-gray-500">${formatDateTime(event.start_time)}</p>
                        <div class="mt-1">
                            <span class="rating-badge text-white text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                                ${event.rating.toFixed(1)} ⭐
                            </span>
                            ${event.source === 'API' ? '<span class="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded ml-1">LIVE</span>' : ''}
                        </div>
                        <div class="mt-1">
                            ${event.interests.map(interest => `
                                <span class="bg-purple-100 text-purple-800 text-xs px-1 py-0.5 rounded mr-1">${interest}</span>
                            `).join('')}
                        </div>
                    </div>
                `);
            markers.push(marker);
            group.addLayer(marker);
        });
        
        // Create map and add tiles
        map = L.map('map');
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add markers to map
        markers.forEach(marker => marker.addTo(map));
        
        // Fit map to show all markers
        if (markers.length > 0) {
            map.fitBounds(group.getBounds().pad(0.1));
        }
    } else {
        // No events, show world map
        map = L.map('map').setView(mapCenter, mapZoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
}

// Format date and time for display
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Load upcoming events
async function loadUpcomingEvents() {
    try {
        const upcomingDays = document.getElementById('upcomingDays')?.value || 30;
        const upcomingEvents = await sharedEventDB.getUpcomingEvents(null, parseInt(upcomingDays));
        
        const upcomingContainer = document.getElementById('upcomingEvents');
        if (!upcomingContainer) return;
        
        if (upcomingEvents.length === 0) {
            upcomingContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No upcoming events found.</p>';
            return;
        }
        
        upcomingContainer.innerHTML = upcomingEvents.map(event => `
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-800">${event.title}</h4>
                    <div class="rating-badge text-white text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500">
                        ${event.rating ? event.rating.toFixed(1) : 'N/A'} ⭐
                    </div>
                </div>
                <p class="text-sm text-gray-600 mb-2">${event.description}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <div class="flex items-center space-x-2">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${event.category}</span>
                        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded">${event.city}</span>
                    </div>
                    <div class="text-right">
                        <div>${formatDateTime(event.start_time)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading upcoming events:', error);
    }
}

// Show event details with rating and review functionality
async function showEventDetails(eventId) {
    try {
        const event = await sharedEventDB.getEventWithStats(eventId);
        if (!event) {
            alert('Event not found');
            return;
        }
        
        // Create popup overlay
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        popupOverlay.onclick = () => popupOverlay.remove();
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        popupContent.onclick = (e) => e.stopPropagation();
        
        popupContent.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-800">${event.title}</h3>
                <button onclick="this.closest('.popup-overlay').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div class="mb-4">
                <p class="text-gray-600 mb-2">${event.description}</p>
                <div class="flex items-center space-x-2 mb-2">
                    <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">${event.category}</span>
                    <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">${event.city}</span>
                </div>
                <div class="text-sm text-gray-500">
                    <div>Start: ${formatDateTime(event.start_time)}</div>
                    <div>End: ${formatDateTime(event.end_time)}</div>
                </div>
            </div>
            
            <div class="mb-4">
                <h4 class="font-semibold mb-2">Rate this event:</h4>
                <div class="star-rating" id="ratingStars">
                    <span class="star" data-rating="1">★</span>
                    <span class="star" data-rating="2">★</span>
                    <span class="star" data-rating="3">★</span>
                    <span class="star" data-rating="4">★</span>
                    <span class="star" data-rating="5">★</span>
                </div>
            </div>
            
            <div class="mb-4">
                <h4 class="font-semibold mb-2">Write a review:</h4>
                <textarea id="reviewText" class="w-full p-2 border border-gray-300 rounded-md" rows="3" placeholder="Share your experience..."></textarea>
                <input type="text" id="userName" class="w-full p-2 border border-gray-300 rounded-md mt-2" placeholder="Your name (optional)" value="Anonymous">
            </div>
            
            <div class="flex space-x-2">
                <button onclick="submitRating(${eventId})" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Submit Rating & Review
                </button>
                <button onclick="showEventReviews(${eventId})" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    View Reviews
                </button>
            </div>
        `;
        
        popupOverlay.appendChild(popupContent);
        document.body.appendChild(popupOverlay);
        
        // Add star rating functionality
        const stars = popupContent.querySelectorAll('.star');
        let selectedRating = 0;
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                stars.forEach((s, i) => {
                    s.classList.toggle('active', i < selectedRating);
                });
            });
            
            star.addEventListener('mouseenter', () => {
                stars.forEach((s, i) => {
                    s.classList.toggle('active', i <= index);
                });
            });
        });
        
        popupContent.addEventListener('mouseleave', () => {
            stars.forEach((s, i) => {
                s.classList.toggle('active', i < selectedRating);
            });
        });
        
    } catch (error) {
        console.error('Error showing event details:', error);
        alert('Error loading event details');
    }
}

// Submit rating and review
async function submitRating(eventId) {
    try {
        const stars = document.querySelectorAll('.star');
        const selectedRating = Array.from(stars).filter(s => s.classList.contains('active')).length;
        const reviewText = document.getElementById('reviewText').value;
        const userName = document.getElementById('userName').value || 'Anonymous';
        
        if (selectedRating === 0) {
            alert('Please select a rating');
            return;
        }
        
        // Ensure we have a current user
        if (!currentUser) {
            currentUser = await getCurrentUser();
        }
        
        // Add rating
        await sharedEventDB.addRating(eventId, currentUser.id, selectedRating);
        
        // Add review if text provided
        if (reviewText.trim()) {
            await sharedEventDB.addReview(eventId, currentUser.id, selectedRating, reviewText.trim(), userName);
        }
        
        // Update user preferences for recommendations
        if (recommendationEngine) {
            await recommendationEngine.updateUserPreferences(currentUser.id, eventId, selectedRating);
        }
        
        alert('Thank you for your rating and review! Your recommendations will improve!');
        
        // Close popup
        document.querySelector('.popup-overlay').remove();
        
        // Update the event display with new rating without page refresh
        await updateEventDisplay(eventId);
        
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Error submitting rating. Please try again.');
    }
}

// Update event display with new rating data
async function updateEventDisplay(eventId) {
    try {
        // Get updated event data
        const updatedEvent = await sharedEventDB.getEventWithStats(eventId);
        if (!updatedEvent) return;
        
        // Find the event card in the DOM and update its rating display
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            const viewDetailsBtn = card.querySelector('button[onclick*="showEventDetails"]');
            if (viewDetailsBtn && viewDetailsBtn.getAttribute('onclick').includes(eventId)) {
                // Update rating badge
                const ratingBadge = card.querySelector('.rating-badge');
                if (ratingBadge) {
                    ratingBadge.textContent = `${updatedEvent.averageRating.toFixed(1)} ⭐`;
                }
                
                // Update review count
                const reviewBtn = card.querySelector('button[onclick*="showEventReviews"]');
                if (reviewBtn) {
                    reviewBtn.textContent = `Reviews (${updatedEvent.reviews ? updatedEvent.reviews.length : 0})`;
                }
                
                // Update review count text
                const reviewCountText = card.querySelector('.text-xs.text-gray-400 span:first-child');
                if (reviewCountText) {
                    reviewCountText.textContent = `${updatedEvent.ratingCount} reviews`;
                }
            }
        });
        
        // Also update the upcoming events section if this event is there
        const upcomingEvents = document.querySelectorAll('#upcomingEvents .bg-gray-50');
        upcomingEvents.forEach(eventCard => {
            const eventTitle = eventCard.querySelector('h4');
            if (eventTitle && eventTitle.textContent === updatedEvent.title) {
                const ratingBadge = eventCard.querySelector('.rating-badge');
                if (ratingBadge) {
                    ratingBadge.textContent = `${updatedEvent.averageRating.toFixed(1)} ⭐`;
                }
            }
        });
        
    } catch (error) {
        console.error('Error updating event display:', error);
    }
}

// Show event reviews
async function showEventReviews(eventId) {
    try {
        const event = await sharedEventDB.getEventWithStats(eventId);
        if (!event) {
            alert('Event not found');
            return;
        }
        
        // Create popup overlay
        const popupOverlay = document.createElement('div');
        popupOverlay.className = 'popup-overlay';
        popupOverlay.onclick = () => popupOverlay.remove();
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content';
        popupContent.onclick = (e) => e.stopPropagation();
        
        const reviews = event.reviews || [];
        
        popupContent.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold text-gray-800">Reviews for ${event.title}</h3>
                <button onclick="this.closest('.popup-overlay').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            
            <div class="mb-4">
                <div class="text-center">
                    <div class="text-3xl font-bold text-yellow-500">${event.averageRating.toFixed(1)} ⭐</div>
                    <div class="text-sm text-gray-500">Based on ${event.ratingCount} reviews</div>
                </div>
            </div>
            
            <div class="space-y-3 max-h-96 overflow-y-auto">
                ${reviews.length === 0 ? 
                    '<p class="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>' :
                    reviews.map(review => `
                        <div class="review-card bg-gray-50 p-3 rounded-lg">
                            <div class="flex justify-between items-start mb-2">
                                <div class="font-semibold text-sm">${review.user_name}</div>
                                <div class="text-yellow-500 text-sm">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                            </div>
                            <p class="text-sm text-gray-600 mb-1">${review.review_text}</p>
                            <div class="text-xs text-gray-400">${new Date(review.created_at).toLocaleDateString()}</div>
                        </div>
                    `).join('')
                }
            </div>
        `;
        
        popupOverlay.appendChild(popupContent);
        document.body.appendChild(popupOverlay);
        
    } catch (error) {
        console.error('Error showing reviews:', error);
        alert('Error loading reviews');
    }
}
