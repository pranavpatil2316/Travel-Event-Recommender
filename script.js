// Events data will be loaded from local JSON files
let eventsData = [];

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api' 
  : '/api';

// User ID for tracking likes and reviews (in a real app, this would come from authentication)
let currentUserId = localStorage.getItem('userId') || generateUserId();

// Generate a unique user ID
function generateUserId() {
  const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('userId', userId);
  return userId;
}

// Country to cities mapping
const countryCities = {
    'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Agra'],
    'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Edinburgh', 'Bristol', 'Leeds'],
    'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice'],
    'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma'],
    'Brazil': ['Rio de Janeiro', 'São Paulo', 'Salvador', 'Brasília', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba'],
    'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City'],
    'Mexico': ['Mexico City', 'Cancun', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez'],
    'South Africa': ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Nelspruit'],
    'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi', 'Koh Samui', 'Ayutthaya', 'Sukhothai'],
    'Egypt': ['Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Giza', 'Hurghada', 'Sharm El Sheikh', 'Dahab'],
    'Turkey': ['Istanbul', 'Cappadocia', 'Antalya', 'Ankara', 'Izmir', 'Bursa', 'Trabzon', 'Gaziantep'],
    'Russia': ['Moscow', 'St. Petersburg', 'Kazan', 'Novosibirsk', 'Yekaterinburg', 'Nizhny Novgorod', 'Samara', 'Omsk'],
    'China': ['Beijing', 'Shanghai', 'Xi\'an', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Nanjing'],
    'Argentina': ['Buenos Aires', 'Mendoza', 'Ushuaia', 'Córdoba', 'Rosario', 'La Plata', 'Mar del Plata', 'Salta'],
    'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra'],
    'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse', 'Nantes', 'Strasbourg', 'Montpellier'],
    'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund'],
    'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego']
};

// Global variables
let map;
let markers = [];
let selectedCategories = []; // Track selected categories
let userLikes = new Set(); // Track user's liked events
let userReviews = new Map(); // Track user's reviews

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setDefaultSeason();
    loadInitialEvents();
    loadUserData();
    
});

// Load initial events from local JSON files
async function loadInitialEvents() {
    try {
        eventsData = await loadEventsFromFiles();
    } catch (error) {
        console.error('Error loading events from files:', error);
        // Fallback to sample data
        eventsData = getSampleEvents();
    }
}

// Load events from local JSON files
async function loadEventsFromFiles() {
    const allEvents = [];
    const countries = ['India', 'Japan', 'United Kingdom', 'Italy', 'Spain', 'Brazil', 'Canada', 'Mexico', 'South Africa', 'Thailand', 'Egypt', 'Turkey', 'Russia', 'China', 'Argentina', 'Australia', 'France', 'Germany', 'United States'];
    
    for (const country of countries) {
        try {
            // Handle country names with spaces and special characters
            let filename;
            if (country === 'United Kingdom') {
                filename = 'events/events-uk.json';
            } else if (country === 'United States') {
                filename = 'events/events-usa.json';
            } else if (country === 'South Africa') {
                filename = 'events/events-southafrica.json';
            } else {
                filename = `events/events-${country.toLowerCase().replace(' ', '-')}.json`;
            }
            
            const response = await fetch(filename);
            
            if (!response.ok) {
                console.warn(`Could not load ${filename}`);
                continue;
            }
            
            const countryData = await response.json();
            
            // Extract all events from all cities in this country
            Object.values(countryData.cities).forEach(cityEvents => {
                allEvents.push(...cityEvents);
            });
            
            console.log(`Loaded events for ${country}`);
        } catch (error) {
            console.error(`Error loading events for ${country}:`, error);
        }
    }
    
    return allEvents;
}

// API Functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Load user's likes and reviews
async function loadUserData() {
    try {
        // Load user's likes
        const likesResponse = await apiRequest(`/likes?userId=${currentUserId}`);
        if (likesResponse.success) {
            likesResponse.likes.forEach(like => {
                userLikes.add(like.eventId);
            });
        }

        // Load user's reviews
        const reviewsResponse = await apiRequest(`/reviews`);
        if (reviewsResponse.success) {
            reviewsResponse.reviews
                .filter(review => review.userName === currentUserId)
                .forEach(review => {
                    userReviews.set(review.eventId, review);
                });
        }

    } catch (error) {
        console.error('Error loading user data:', error);
        // Continue without user data if API is not available
    }
}

// Like/Unlike an event
async function toggleEventLike(eventId) {
    try {
        const isLiked = userLikes.has(eventId);
        
        if (isLiked) {
            // Unlike the event
            await apiRequest(`/likes?userId=${currentUserId}&eventId=${eventId}`, {
                method: 'DELETE'
            });
            userLikes.delete(eventId);
        } else {
            // Like the event
            await apiRequest('/likes', {
                method: 'POST',
                body: JSON.stringify({
                    userId: currentUserId,
                    eventId: eventId
                })
            });
            userLikes.add(eventId);
        }

        return !isLiked; // Return new like status
    } catch (error) {
        console.error('Error toggling like:', error);
        throw error;
    }
}

// Submit a review
async function submitReview(eventId, rating, review, userName) {
    try {
        const response = await apiRequest('/reviews', {
            method: 'POST',
            body: JSON.stringify({
                eventId: eventId,
                rating: rating,
                review: review,
                userName: userName
            })
        });

        if (response.success) {
            // Update local cache
            userReviews.set(eventId, response.review);
            return response.review;
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        throw error;
    }
}

// Get recommendations for user
async function getUserRecommendations(country = null, limit = 10) {
    try {
        const params = new URLSearchParams({
            userId: currentUserId,
            limit: limit.toString()
        });
        
        if (country) {
            params.append('country', country);
        }

        const response = await apiRequest(`/recommendations?${params}`);
        return response.success ? response.recommendations : [];
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return [];
    }
}

// Fallback sample events
function getSampleEvents() {
    return [
        {
            id: 1,
            title: "Taj Mahal Sunrise Tour",
            description: "Experience the breathtaking beauty of the Taj Mahal at sunrise with a guided tour.",
            category: "Sightseeing",
            start_time: "2024-03-15T06:00:00Z",
            end_time: "2024-03-15T10:00:00Z",
            lat: 27.1751,
            lon: 78.0421,
            city: "Agra",
            country: "India",
            indoor_outdoor: "outdoor",
            rating: 4.8,
            ratingCount: 1247,
            source: "Sample"
        },
        {
            id: 2,
            title: "Eiffel Tower Visit",
            description: "Climb the iconic Eiffel Tower for panoramic views of Paris.",
            category: "Sightseeing",
            start_time: "2024-03-23T10:00:00Z",
            end_time: "2024-03-23T12:00:00Z",
            lat: 48.8584,
            lon: 2.2945,
            city: "Paris",
            country: "France",
            indoor_outdoor: "outdoor",
            rating: 4.9,
            ratingCount: 2156,
            source: "Sample"
        },
        {
            id: 3,
            title: "Tokyo Skytree Observation",
            description: "Enjoy breathtaking views from Tokyo's tallest structure.",
            category: "Sightseeing",
            start_time: "2024-03-27T14:00:00Z",
            end_time: "2024-03-27T16:00:00Z",
            lat: 35.7101,
            lon: 139.8107,
            city: "Tokyo",
            country: "Japan",
            indoor_outdoor: "indoor",
            rating: 4.6,
            ratingCount: 987,
            source: "Sample"
        },
        {
            id: 4,
            title: "Big Ben and Westminster Tour",
            description: "Explore London's iconic landmarks including Big Ben and Westminster Abbey.",
            category: "History & Heritage",
            start_time: "2024-03-31T10:00:00Z",
            end_time: "2024-03-31T13:00:00Z",
            lat: 51.4994,
            lon: -0.1245,
            city: "London",
            country: "United Kingdom",
            indoor_outdoor: "outdoor",
            rating: 4.7,
            ratingCount: 1456,
            source: "Sample"
        }
    ];
}

// Initialize form functionality
function initializeForm() {
    const form = document.getElementById('recommendationForm');
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');

    // Handle country selection
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        
        if (selectedCountry) {
            loadCitiesForCountry(selectedCountry);
        } else {
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">Select a country first...</option>';
        }
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission();
    });
}

// Load cities for selected country
function loadCitiesForCountry(country) {
    const citySelect = document.getElementById('city');
    const cities = countryCities[country] || [];
    
    citySelect.innerHTML = '<option value="">All cities in country...</option>';
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    citySelect.disabled = false;
}

// Set default season based on current month
function setDefaultSeason() {
    const seasonSelect = document.getElementById('season');
    const currentMonth = new Date().getMonth() + 1;
    let defaultSeason = 'spring';
    
    if (currentMonth >= 3 && currentMonth <= 5) defaultSeason = 'spring';
    else if (currentMonth >= 6 && currentMonth <= 8) defaultSeason = 'summer';
    else if (currentMonth >= 9 && currentMonth <= 11) defaultSeason = 'autumn';
    else defaultSeason = 'winter';
    
    seasonSelect.value = defaultSeason;
}

// Handle form submission
function handleFormSubmission() {
    const formData = new FormData(document.getElementById('recommendationForm'));
    const country = formData.get('country');
    const city = formData.get('city');
    const season = formData.get('season');
    const duration = formData.get('duration');

    if (!country || !season || !duration) {
        alert('Please fill in country, season, and duration fields');
        return;
    }
    
    // Show results section and loading state
    showResultsSection();
    showLoadingState();

    // Simulate processing delay for better UX
    setTimeout(() => {
        try {
            const filteredEvents = getFilteredEvents(country, city, season, duration);
            displayResults(filteredEvents, city || 'All Cities', country, season);
        } catch (error) {
            console.error('Error in form submission:', error);
            showError('Error loading events. Please try again.');
        }
    }, 1000);
}

// Get filtered events based on criteria
function getFilteredEvents(country, city, season, duration) {
    let filteredEvents = eventsData.filter(event => {
        // Filter by country
        if (event.country !== country) return false;
        
        // Filter by city if specified
        if (city && city.trim() !== '' && event.city !== city) return false;
        
        return true;
    });

    // Sort by rating (highest first)
    return filteredEvents.sort((a, b) => b.rating - a.rating);
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

// Display results
function displayResults(events, city, country, season) {
    document.getElementById('loadingState').classList.add('hidden');
    
    if (!events || events.length === 0) {
        showError(`No events found for ${city}, ${country}.`);
        return;
    }
    
    document.getElementById('errorState').classList.add('hidden');
    document.getElementById('resultsContent').classList.remove('hidden');
    
    displaySummary(events, city, country, season);
    displayInterestCategories(events);
    displayEventsList(events);
    displayMap(events, city);
    
    // Show recommendations and liked events sections
    showRecommendationsSection(country);
    showLikedEventsSection();
}

// Display summary statistics
function displaySummary(events, city, country, season) {
    const summaryContainer = document.getElementById('summaryStats');
    const avgRating = (events.reduce((sum, event) => sum + event.rating, 0) / events.length).toFixed(1);
    const indoorEvents = events.filter(event => event.indoor_outdoor === 'indoor').length;
    const outdoorEvents = events.filter(event => event.indoor_outdoor === 'outdoor').length;
    const uniqueCities = [...new Set(events.map(event => event.city))].length;
    
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
            <div class="text-2xl font-bold text-orange-600">${uniqueCities}</div>
            <div class="text-sm text-gray-600">Cities</div>
        </div>
    `;
}

// Display interest categories
function displayInterestCategories(events) {
    const categoriesContainer = document.getElementById('interestCategories');
    
    // Group events by category
    const categoryGroups = {};
    events.forEach(event => {
        if (!categoryGroups[event.category]) {
            categoryGroups[event.category] = [];
        }
        categoryGroups[event.category].push(event);
    });
    
    // Create category cards
    categoriesContainer.innerHTML = Object.keys(categoryGroups).map(category => {
        const isSelected = selectedCategories.includes(category);
        return `
            <div class="category-card p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 ${isSelected ? 'bg-gradient-to-br from-green-50 to-blue-50 border-green-400' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-gray-200'}" onclick="toggleCategory('${category}')">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-gray-800">${category}</h4>
                    <div class="flex items-center space-x-2">
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">${categoryGroups[category].length}</span>
                        ${isSelected ? '<span class="text-green-600 text-lg">✓</span>' : ''}
                    </div>
                </div>
                <p class="text-sm text-gray-600">${categoryGroups[category].length} events in this category</p>
                <div class="mt-2 text-xs font-medium ${isSelected ? 'text-green-600' : 'text-blue-600'}">
                    ${isSelected ? 'Selected - Click to deselect' : 'Click to select'}
                </div>
            </div>
        `;
    }).join('');
    
    // Add clear selection button if categories are selected
    if (selectedCategories.length > 0) {
        const clearButton = document.createElement('div');
        clearButton.className = 'mt-4 text-center';
        clearButton.innerHTML = `
            <button onclick="clearCategorySelection()" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
                Clear All Selections (${selectedCategories.length} selected)
            </button>
        `;
        categoriesContainer.appendChild(clearButton);
    }
}

// Display events list
function displayEventsList(events) {
    const eventsContainer = document.getElementById('eventsList');
    
    
    eventsContainer.innerHTML = events.map(event => `
        <div class="event-card bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex justify-between items-start mb-3">
                <h4 class="font-semibold text-gray-800 text-lg">${event.title}</h4>
                <div class="flex items-center space-x-2">
                    ${event.source !== 'Sample' ? `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">${event.source}</span>` : ''}
                    <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm px-3 py-1 rounded-full">
                        ${event.rating.toFixed(1)} ⭐
                    </div>
                </div>
            </div>
            <p class="text-gray-600 mb-3">${event.description}</p>
            <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div class="flex items-center space-x-3">
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">${event.category}</span>
                    <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">${event.city}</span>
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
            <div class="mt-3 text-sm text-gray-400">
                <div class="flex justify-between">
                    <span>${event.ratingCount} reviews</span>
                    <span>${event.country}</span>
                </div>
            </div>
            <div class="mt-4 flex space-x-3">
                        <button onclick="showEventDetails('${event.id}')" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                            View Details
                        </button>
                        <button onclick="showRatingModal('${event.id}')" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
                            Rate Event
                        </button>
                <button onclick="toggleLike('${event.id}')" class="like-btn bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors" id="like-btn-${event.id}">
                    ${userLikes.has(event.id) ? '❤️ Liked' : '🤍 Like'}
                </button>
            </div>
        </div>
    `).join('');
}

// Display map with event markers
function displayMap(events, destination) {
    // Clear existing map
    if (map) {
        map.remove();
    }
    
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];
    
    if (events.length === 0) return;

    // Initialize map
    map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const group = new L.featureGroup();
    
    events.forEach(event => {
        const marker = L.marker([event.lat, event.lon])
            .bindPopup(`
                <div class="p-3">
                    <h4 class="font-semibold text-gray-800">${event.title}</h4>
                    <p class="text-sm text-gray-600">${event.category}</p>
                    <p class="text-xs text-gray-500">${event.city}, ${event.country}</p>
                    <p class="text-xs text-gray-500">${formatDateTime(event.start_time)}</p>
                    <div class="mt-2">
                        <span class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full">
                            ${event.rating.toFixed(1)} ⭐
                        </span>
                    </div>
                </div>
            `);
        markers.push(marker);
        group.addLayer(marker);
    });

    // Add markers to map
    markers.forEach(marker => marker.addTo(map));
    
    // Fit map to show all markers
    if (markers.length > 0) {
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Format date and time for display
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Show event details
function showEventDetails(eventId) {
    console.log('showEventDetails called with ID:', eventId);
    console.log('eventsData length:', eventsData.length);
    const event = eventsData.find(e => e.id === eventId);
    console.log('Found event:', event);
    
    if (!event) {
        console.error('Event not found with ID:', eventId);
        alert('Event details not found. Please try again.');
        return;
    }

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modalOverlay.onclick = () => modalOverlay.remove();

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto';
    modalContent.onclick = (e) => e.stopPropagation();

    // Calculate additional information
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);
    const duration = Math.round((endDate - startDate) / (1000 * 60 * 60)); // hours
    const isWeekend = startDate.getDay() === 0 || startDate.getDay() === 6;
    const season = getSeasonFromDate(startDate);
    const timeOfDay = getTimeOfDay(startDate);
    
    // Generate additional content based on event category
    const additionalInfo = getAdditionalEventInfo(event);
    
    modalContent.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-2xl font-semibold text-gray-800">Event Details</h3>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
        </div>
        
        <div class="space-y-6">
            <!-- Event Title and Rating -->
            <div class="border-b border-gray-200 pb-4">
                <h4 class="text-xl font-bold text-gray-800 mb-2">${event.title}</h4>
                <div class="flex items-center space-x-4">
                    <div class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm px-3 py-1 rounded-full">
                        ${event.rating.toFixed(1)} ⭐
                    </div>
                    <span class="text-gray-600">${event.ratingCount} reviews</span>
                    ${event.source !== 'Sample' ? `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">${event.source}</span>` : ''}
                </div>
            </div>
            
            <!-- Enhanced Description -->
            <div>
                <h5 class="font-semibold text-gray-800 mb-2">About This Experience</h5>
                <p class="text-gray-600 leading-relaxed mb-3">${event.description}</p>
                ${additionalInfo.description ? `<p class="text-gray-600 leading-relaxed italic">${additionalInfo.description}</p>` : ''}
            </div>
            
            <!-- Event Information Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-2">Category</h6>
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">${event.category}</span>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-2">Location</h6>
                    <div class="flex items-center space-x-2">
                        <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">${event.city}</span>
                        <span class="text-gray-600">${event.country}</span>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-2">Type</h6>
                    <div class="flex items-center space-x-2">
                        <span class="text-lg">${event.indoor_outdoor === 'indoor' ? '🏠' : '🌳'}</span>
                        <span class="capitalize text-gray-600">${event.indoor_outdoor}</span>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h6 class="font-semibold text-gray-800 mb-2">Duration</h6>
                    <p class="text-gray-600 text-sm">
                        ${formatDateTime(event.start_time)}<br>
                        to ${formatDateTime(event.end_time)}<br>
                        <span class="text-blue-600 font-medium">${duration} hours</span>
                    </p>
                </div>
            </div>
            
            <!-- Additional Information -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <h5 class="font-semibold text-gray-800 mb-3">Event Insights</h5>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div class="text-center">
                        <div class="text-lg">${isWeekend ? '🎉' : '📅'}</div>
                        <div class="text-gray-600">${isWeekend ? 'Weekend' : 'Weekday'}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg">${getSeasonEmoji(season)}</div>
                        <div class="text-gray-600">${season}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg">${getTimeEmoji(timeOfDay)}</div>
                        <div class="text-gray-600">${timeOfDay}</div>
                    </div>
                    <div class="text-center">
                        <div class="text-lg">${getWeatherEmoji(event.indoor_outdoor, season)}</div>
                        <div class="text-gray-600">${event.indoor_outdoor === 'indoor' ? 'All Weather' : 'Weather Dependent'}</div>
                    </div>
                </div>
            </div>
            
            <!-- What to Expect -->
            ${additionalInfo.whatToExpect ? `
            <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 class="font-semibold text-gray-800 mb-2">What to Expect</h5>
                <ul class="text-gray-600 text-sm space-y-1">
                    ${additionalInfo.whatToExpect.map(item => `<li>• ${item}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            <!-- Tips & Recommendations -->
            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h5 class="font-semibold text-gray-800 mb-2">💡 Tips & Recommendations</h5>
                <ul class="text-gray-600 text-sm space-y-1">
                    <li>• Book in advance to secure your spot</li>
                    <li>• Arrive 15 minutes early for check-in</li>
                    <li>• ${event.indoor_outdoor === 'outdoor' ? 'Check weather conditions and dress appropriately' : 'Comfortable walking shoes recommended'}</li>
                    <li>• Bring a camera to capture memories</li>
                    <li>• Consider bringing water and snacks</li>
                </ul>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex space-x-3 pt-4 border-t border-gray-200">
                <button onclick="showRatingModal('${event.id}'); this.closest('.fixed').remove();" class="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                    Rate This Event
                </button>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
}


// Show rating modal with star rating
function showRatingModal(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) {
        alert('Event not found. Please try again.');
        return;
    }

    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modalOverlay.onclick = () => modalOverlay.remove();

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg p-6 max-w-md w-full mx-4';
    modalContent.onclick = (e) => e.stopPropagation();

    modalContent.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Rate Event</h3>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <div class="mb-4">
            <h4 class="font-semibold text-gray-800 mb-2">${event.title}</h4>
            <p class="text-sm text-gray-600">${event.city}, ${event.country}</p>
        </div>
        
        <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Your Rating:</label>
            <div class="star-rating flex space-x-1" id="starRating">
                <span class="star text-3xl cursor-pointer" data-rating="1">☆</span>
                <span class="star text-3xl cursor-pointer" data-rating="2">☆</span>
                <span class="star text-3xl cursor-pointer" data-rating="3">☆</span>
                <span class="star text-3xl cursor-pointer" data-rating="4">☆</span>
                <span class="star text-3xl cursor-pointer" data-rating="5">☆</span>
            </div>
            <p class="text-sm text-gray-500 mt-2" id="ratingText">Click a star to rate</p>
        </div>
        
        <div class="mb-4">
            <label for="reviewText" class="block text-sm font-medium text-gray-700 mb-2">Your Review (Optional):</label>
            <textarea id="reviewText" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" placeholder="Share your experience..."></textarea>
        </div>
        
        <div class="mb-4">
            <label for="userName" class="block text-sm font-medium text-gray-700 mb-2">Your Name:</label>
            <input type="text" id="userName" class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your name" value="Anonymous">
        </div>
        
        <div class="flex space-x-3">
            <button onclick="submitRating('${eventId}')" class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                Submit Rating
            </button>
            <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
                Cancel
            </button>
        </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Add star rating functionality
    const stars = modalContent.querySelectorAll('.star');
    const ratingText = modalContent.querySelector('#ratingText');
    let selectedRating = 0;

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            window.currentRating = selectedRating; // Update global variable
            updateStarDisplay(stars, selectedRating);
            updateRatingText(ratingText, selectedRating);
        });

        star.addEventListener('mouseenter', () => {
            updateStarDisplay(stars, index + 1);
        });
    });

    modalContent.addEventListener('mouseleave', () => {
        updateStarDisplay(stars, selectedRating);
    });

    // Initialize global rating variable
    window.currentRating = selectedRating;
}

// Update star display
function updateStarDisplay(stars, rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '★';
            star.style.color = '#fbbf24';
        } else {
            star.textContent = '☆';
            star.style.color = '#d1d5db';
        }
    });
}

// Update rating text
function updateRatingText(ratingText, rating) {
    const ratingTexts = {
        0: 'Click a star to rate',
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };
    ratingText.textContent = ratingTexts[rating];
}

// Submit rating
async function submitRating(eventId) {
    const event = eventsData.find(e => e.id == eventId);
    if (!event) {
        alert('Event not found. Please try again.');
        return;
    }

    const selectedRating = window.currentRating || 0;
    const reviewText = document.getElementById('reviewText').value;
    const userName = document.getElementById('userName').value || currentUserId;

    if (selectedRating === 0) {
        alert('Please select a rating by clicking on the stars');
        return;
    }

    try {
        // Submit review to backend
        await submitReview(eventId, selectedRating, reviewText, userName);

        // Show success message
        alert(`Thank you for rating "${event.title}" ${selectedRating} star${selectedRating > 1 ? 's' : ''}!\n\nYour review has been submitted.`);

        // Close modal
        document.querySelector('.fixed').remove();

        // Refresh the display to show updated rating
        const country = document.getElementById('country').value;
        const city = document.getElementById('city').value;
        const season = document.getElementById('season').value;
        const duration = document.getElementById('duration').value;
        
        if (country && season && duration) {
            const filteredEvents = getFilteredEvents(country, city, season, duration);
            displayResults(filteredEvents, city || 'All Cities', country, season);
        }
    } catch (error) {
        console.error('Error submitting rating:', error);
        alert('Error submitting review. Please try again.');
    }
}

// Toggle category selection
function toggleCategory(category) {
    console.log('Toggling category:', category);
    
    if (selectedCategories.includes(category)) {
        // Remove from selection
        selectedCategories = selectedCategories.filter(cat => cat !== category);
    } else {
        // Add to selection
        selectedCategories.push(category);
    }
    
    console.log('Selected categories:', selectedCategories);
    
    // Get current form data
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const season = document.getElementById('season').value;
    const duration = document.getElementById('duration').value;
    
    if (!country || !season || !duration) {
        console.error('Missing form data for filtering');
        return;
    }
    
    // Get all events for the current search criteria
    const allEvents = getFilteredEvents(country, city, season, duration);
    
    // Refresh the categories display to show updated selection
    displayInterestCategories(allEvents);
    
    // Apply filtering based on current selection
    if (selectedCategories.length === 0) {
        // No categories selected, show all events
        displayResults(allEvents, city || 'All Cities', country, season);
    } else {
        // Filter by selected categories
        const filteredEvents = allEvents.filter(event => selectedCategories.includes(event.category));
        
        console.log(`Found ${filteredEvents.length} events in selected categories: ${selectedCategories.join(', ')}`);
        
        if (filteredEvents.length === 0) {
            // Show message if no events found
            const eventsContainer = document.getElementById('eventsList');
            eventsContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-gray-400 mb-4">
                        <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.9-6.1-2.4l-.7.7a8.96 8.96 0 0012.6 0l-.7-.7z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
                    <p class="text-gray-600 mb-4">No events found in the selected categories: <strong>${selectedCategories.join(', ')}</strong></p>
                </div>
            `;
        } else {
            // Display filtered events
            displayEventsList(filteredEvents);
            displaySummary(filteredEvents, city || 'All Cities', country, season);
        }
    }
    
    // Scroll to events section
    document.getElementById('eventsList').scrollIntoView({ behavior: 'smooth' });
}

// Apply category filter
function applyCategoryFilter() {
    console.log('Applying category filter for:', selectedCategories);
    
    if (selectedCategories.length === 0) {
        console.log('No categories selected');
        return;
    }
    
    // Get current form data to maintain context
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const season = document.getElementById('season').value;
    const duration = document.getElementById('duration').value;
    
    if (!country || !season || !duration) {
        console.error('Missing form data for filtering');
        return;
    }
    
    // Get all events for the current search criteria
    const allEvents = getFilteredEvents(country, city, season, duration);
    
    // Filter by selected categories
    const filteredEvents = allEvents.filter(event => selectedCategories.includes(event.category));
    
    console.log(`Found ${filteredEvents.length} events in selected categories: ${selectedCategories.join(', ')}`);
    
    if (filteredEvents.length === 0) {
        // Show message if no events found
        const eventsContainer = document.getElementById('eventsList');
        eventsContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="text-gray-400 mb-4">
                    <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-.9-6.1-2.4l-.7.7a8.96 8.96 0 0012.6 0l-.7-.7z" />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
                <p class="text-gray-600 mb-4">No events found in the selected categories: <strong>${selectedCategories.join(', ')}</strong></p>
                <button onclick="showAllEvents()" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Show All Events
                </button>
            </div>
        `;
    } else {
        // Display filtered events
        displayEventsList(filteredEvents);
        
        // Update summary to show filtered results
        displaySummary(filteredEvents, city || 'All Cities', country, season);
        
        // Add a "Show All Events" button
        const eventsContainer = document.getElementById('eventsList');
        const showAllButton = document.createElement('div');
        showAllButton.className = 'text-center mt-6';
        showAllButton.innerHTML = `
            <button onclick="showAllEvents()" class="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors">
                ← Show All Events
            </button>
        `;
        eventsContainer.appendChild(showAllButton);
    }
    
    // Scroll to events section
    document.getElementById('eventsList').scrollIntoView({ behavior: 'smooth' });
}

// Clear category selection
function clearCategorySelection() {
    console.log('Clearing category selection');
    selectedCategories = [];
    
    // Get current form data
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const season = document.getElementById('season').value;
    const duration = document.getElementById('duration').value;
    
    if (country && season && duration) {
        const allEvents = getFilteredEvents(country, city, season, duration);
        
        // Refresh the categories display
        displayInterestCategories(allEvents);
        
        // Show all events
        displayResults(allEvents, city || 'All Cities', country, season);
    }
}

// Show all events (reset filter)
function showAllEvents() {
    console.log('Showing all events');
    
    // Clear category selection
    selectedCategories = [];
    
    // Get current form data
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const season = document.getElementById('season').value;
    const duration = document.getElementById('duration').value;
    
    if (!country || !season || !duration) {
        console.error('Missing form data');
        return;
    }
    
    // Get all events and display them
    const allEvents = getFilteredEvents(country, city, season, duration);
    displayResults(allEvents, city || 'All Cities', country, season);
}

// Toggle like status for an event
async function toggleLike(eventId) {
    try {
        const newLikeStatus = await toggleEventLike(eventId);
        
        // Update the like button
        const likeBtn = document.getElementById(`like-btn-${eventId}`);
        if (likeBtn) {
            likeBtn.innerHTML = newLikeStatus ? '❤️ Liked' : '🤍 Like';
            likeBtn.className = newLikeStatus 
                ? 'like-btn bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors'
                : 'like-btn bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors';
        }
        
        // Show feedback
        const event = eventsData.find(e => e.id == eventId);
        if (event) {
            const message = newLikeStatus 
                ? `Added "${event.title}" to your liked events!`
                : `Removed "${event.title}" from your liked events.`;
            showNotification(message, newLikeStatus ? 'success' : 'info');
        }
        
        // Refresh the liked events section if it's visible
        const likedEventsSection = document.getElementById('likedEventsSection');
        if (likedEventsSection && !likedEventsSection.classList.contains('hidden')) {
            await showLikedEventsSection();
        }
        
        // Refresh recommendations section if it's visible
        const recommendationsSection = document.getElementById('recommendationsSection');
        if (recommendationsSection && !recommendationsSection.classList.contains('hidden')) {
            const country = document.getElementById('country').value;
            await showRecommendationsSection(country);
        }
        
    } catch (error) {
        console.error('Error toggling like:', error);
        showNotification('Error updating like status. Please try again.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show recommendations section
async function showRecommendationsSection(passedCountry = null) {
    try {
        const country = passedCountry || document.getElementById('country').value;
        const recommendations = await getUserRecommendations(country, 6);
        
        const recommendationsSection = document.getElementById('recommendationsSection');
        const recommendationsList = document.getElementById('recommendationsList');
        const noRecommendations = document.getElementById('noRecommendations');
        
        if (recommendations.length === 0) {
            recommendationsList.classList.add('hidden');
            noRecommendations.classList.remove('hidden');
        } else {
            noRecommendations.classList.add('hidden');
            recommendationsList.classList.remove('hidden');
            
            recommendationsList.innerHTML = recommendations.map(event => `
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <h4 class="font-semibold text-gray-800 mb-2">${event.title}</h4>
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">${event.description}</p>
                    <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${event.category}</span>
                        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">${event.city}</span>
                        <span class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full">
                            ${event.rating.toFixed(1)} ⭐
                        </span>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="showEventDetails('${event.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                            View Details
                        </button>
                        <button onclick="toggleLike('${event.id}')" class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors">
                            Like Event
                        </button>
                    </div>
                </div>
            `).join('');
        }

        recommendationsSection.classList.remove('hidden');

    } catch (error) {
        console.error('Error showing recommendations section:', error);
        showNotification('Error loading recommendations. Please try again.', 'error');
    }
}

// Show recommendations modal (for header button)
async function showRecommendations() {
    try {
        const country = document.getElementById('country').value;
        const recommendations = await getUserRecommendations(country, 5);
        
        if (recommendations.length === 0) {
            showNotification('No recommendations available. Start liking events to get personalized recommendations!', 'info');
            return;
        }
        
        // Create recommendations modal
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modalOverlay.onclick = () => modalOverlay.remove();

        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto';
        modalContent.onclick = (e) => e.stopPropagation();

        modalContent.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-2xl font-semibold text-gray-800">Recommended for You</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${recommendations.map(event => `
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 class="font-semibold text-gray-800 mb-2">${event.title}</h4>
                        <p class="text-sm text-gray-600 mb-3">${event.description}</p>
                        <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${event.category}</span>
                            <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">${event.city}</span>
                            <span class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full">
                                ${event.rating.toFixed(1)} ⭐
                            </span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="showEventDetails('${event.id}'); this.closest('.fixed').remove();" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                                View Details
                            </button>
                            <button onclick="toggleLike('${event.id}'); this.closest('.fixed').remove();" class="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">
                                Like Event
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
    } catch (error) {
        console.error('Error showing recommendations:', error);
        showNotification('Error loading recommendations. Please try again.', 'error');
    }
}

// Show liked events section
async function showLikedEventsSection() {
    try {
        const likedEvents = await getUserLikedEvents();
        
        const likedEventsSection = document.getElementById('likedEventsSection');
        const likedEventsList = document.getElementById('likedEventsList');
        const noLikedEvents = document.getElementById('noLikedEvents');
        
        if (likedEvents.length === 0) {
            likedEventsList.classList.add('hidden');
            noLikedEvents.classList.remove('hidden');
        } else {
            noLikedEvents.classList.add('hidden');
            likedEventsList.classList.remove('hidden');
            
            likedEventsList.innerHTML = likedEvents.map(event => `
                <div class="bg-red-50 p-4 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-semibold text-gray-800">${event.title}</h4>
                        <button onclick="toggleLike('${event.id}')" class="text-red-500 hover:text-red-700 text-lg">
                            ❤️
                        </button>
                    </div>
                    <p class="text-sm text-gray-600 mb-3 line-clamp-2">${event.description}</p>
                    <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${event.category}</span>
                        <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">${event.city}</span>
                        <span class="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full">
                            ${event.rating.toFixed(1)} ⭐
                        </span>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="showEventDetails('${event.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                            View Details
                        </button>
                        <button onclick="showRatingModal('${event.id}')" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors">
                            Rate Event
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        likedEventsSection.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error showing liked events section:', error);
        showNotification('Error loading liked events. Please try again.', 'error');
    }
}

// Get user's liked events
async function getUserLikedEvents() {
    try {
        const response = await apiRequest(`/likes?userId=${currentUserId}`);
        if (response.success && response.likes) {
            // Get event details for each liked event
            const likedEvents = [];
            for (const like of response.likes) {
                const event = eventsData.find(e => e.id == like.eventId);
                if (event) {
                    likedEvents.push(event);
                }
            }
            return likedEvents;
        }
        return [];
    } catch (error) {
        console.error('Error getting liked events:', error);
        return [];
    }
}

// Refresh recommendations
async function refreshRecommendations() {
    const country = document.getElementById('country').value;
    await showRecommendationsSection(country);
    showNotification('Recommendations refreshed!', 'success');
}

// Refresh liked events
async function refreshLikedEvents() {
    await showLikedEventsSection();
    showNotification('Liked events refreshed!', 'success');
}


// Make functions globally accessible for onclick handlers
window.showEventDetails = showEventDetails;
window.showRatingModal = showRatingModal;
window.submitRating = submitRating;
window.toggleCategory = toggleCategory;
window.clearCategorySelection = clearCategorySelection;
window.showAllEvents = showAllEvents;
window.toggleLike = toggleLike;
window.showRecommendations = showRecommendations;
window.refreshRecommendations = refreshRecommendations;
window.refreshLikedEvents = refreshLikedEvents;


// Helper functions for enhanced event details
function getSeasonFromDate(date) {
    const month = date.getMonth() + 1;
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Autumn';
    return 'Winter';
}

function getTimeOfDay(date) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
}

function getSeasonEmoji(season) {
    const emojis = {
        'Spring': '🌸',
        'Summer': '☀️',
        'Autumn': '🍂',
        'Winter': '❄️'
    };
    return emojis[season] || '📅';
}

function getTimeEmoji(timeOfDay) {
    const emojis = {
        'Morning': '🌅',
        'Afternoon': '☀️',
        'Evening': '🌆',
        'Night': '🌙'
    };
    return emojis[timeOfDay] || '🕐';
}

function getWeatherEmoji(indoorOutdoor, season) {
    if (indoorOutdoor === 'indoor') return '🏠';
    const weatherEmojis = {
        'Spring': '🌦️',
        'Summer': '☀️',
        'Autumn': '🍂',
        'Winter': '❄️'
    };
    return weatherEmojis[season] || '🌤️';
}

function getAdditionalEventInfo(event) {
    const categoryInfo = {
        'Sightseeing': {
            description: 'Perfect for first-time visitors and photography enthusiasts. This experience offers iconic views and memorable moments.',
            whatToExpect: [
                'Guided tour with historical context',
                'Photo opportunities at key landmarks',
                'Local insights and stories',
                'Small group experience for personalized attention'
            ]
        },
        'History & Heritage': {
            description: 'Dive deep into the rich cultural heritage and historical significance of this remarkable location.',
            whatToExpect: [
                'Expert guide with historical knowledge',
                'Access to restricted areas',
                'Interactive exhibits and artifacts',
                'Cultural context and significance'
            ]
        },
        'Adventure': {
            description: 'Get your adrenaline pumping with this exciting outdoor adventure experience.',
            whatToExpect: [
                'Safety equipment provided',
                'Professional instructors',
                'Thrilling activities and challenges',
                'Group bonding experience'
            ]
        },
        'Food & Drink': {
            description: 'Savor the authentic flavors and culinary traditions of the local culture.',
            whatToExpect: [
                'Local food tastings',
                'Traditional cooking methods',
                'Cultural food stories',
                'Recipe sharing and tips'
            ]
        },
        'Nature & Wildlife': {
            description: 'Connect with nature and discover the local wildlife in their natural habitat.',
            whatToExpect: [
                'Wildlife spotting opportunities',
                'Nature photography tips',
                'Environmental education',
                'Peaceful natural settings'
            ]
        }
    };
    
    return categoryInfo[event.category] || {
        description: 'A unique experience that combines local culture, history, and entertainment.',
        whatToExpect: [
            'Professional guidance',
            'Cultural insights',
            'Memorable experiences',
            'Local recommendations'
        ]
    };
}
