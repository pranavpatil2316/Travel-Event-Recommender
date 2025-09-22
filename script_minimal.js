// Minimal version to test form functionality
console.log('Script loading...');

// Global variables
let eventsData = [];
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing...');
    
    try {
        // Initialize database
        if (typeof initDatabase === 'function') {
            await initDatabase();
            console.log('Database initialized');
        }
        
        // Get current user
        if (typeof getCurrentUser === 'function') {
            currentUser = await getCurrentUser();
            console.log('Current user:', currentUser);
        }
        
        // Seed database
        if (typeof seedDatabaseWithSampleData === 'function') {
            await seedDatabaseWithSampleData();
            console.log('Database seeded');
        }
        
        initializeForm();
        loadEventsData();
        
    } catch (error) {
        console.error('Error initializing application:', error);
    }
});

// Initialize form functionality
function initializeForm() {
    console.log('Initializing form...');
    
    const form = document.getElementById('recommendationForm');
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');
    const cityLoading = document.getElementById('cityLoading');
    
    if (!form) {
        console.error('Form element not found!');
        return;
    }
    
    console.log('Form element found:', form);

    // Handle country selection
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        const citySelect = document.getElementById('city');
        const cityLoading = document.getElementById('cityLoading');
        
        if (selectedCountry) {
            cityLoading.classList.remove('hidden');
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">Loading cities...</option>';
            
            // Simulate loading cities
            setTimeout(() => {
                const cities = getCitiesForCountry(selectedCountry);
                populateCityDropdown(cities);
            }, 500);
        } else {
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">Select a country first...</option>';
            cityLoading.classList.add('hidden');
        }
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        console.log('Form submit event triggered');
        e.preventDefault();
        console.log('Default prevented, calling handleFormSubmission');
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

    console.log('Form initialized successfully');
}

// Get cities for country (simplified)
function getCitiesForCountry(country) {
    const cityMap = {
        'France': ['Paris', 'Lyon', 'Marseille', 'Nice', 'Toulouse'],
        'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima', 'Nagoya'],
        'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh'],
        'Italy': ['Rome', 'Milan', 'Naples', 'Florence', 'Venice'],
        'Spain': ['Madrid', 'Barcelona', 'Seville', 'Valencia', 'Bilbao'],
        'Germany': ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'],
        'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
        'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
        'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
        'India': ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
        'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Krabi'],
        'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'],
        'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'],
        'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'],
        'Singapore': ['Singapore']
    };
    
    return cityMap[country] || [];
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
        eventsData = await response.json();
        console.log('Events data loaded:', eventsData.length, 'events');
    } catch (error) {
        console.error('Error loading events data:', error);
    }
}

// Handle form submission
function handleFormSubmission() {
    console.log('handleFormSubmission called');
    
    const formData = new FormData(document.getElementById('recommendationForm'));
    const country = formData.get('country');
    const city = formData.get('city');
    const season = formData.get('season');
    const duration = formData.get('duration');

    console.log('Form values:', { country, city, season, duration });

    if (!country || !season || !duration) {
        alert('Please fill in country, season, and duration fields');
        return;
    }

    console.log('Form validation passed, showing results section');
    
    // Show results section and loading state
    showResultsSection();
    showLoadingState();

    // Simulate processing delay for better UX
    setTimeout(async () => {
        try {
            console.log('Starting to fetch events...');
            const allEvents = await getAllEventsForCountryOrCity(country, city, season, duration);
            console.log('Events fetched, displaying results...');
            await displayResults(allEvents, city || 'All Cities', country, season);
        } catch (error) {
            console.error('Error in form submission:', error);
            alert('Error loading events. Please try again.');
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

    // Add basic rating to events
    const eventsWithStats = allEvents.map((event, index) => ({
        ...event,
        id: index + 1,
        rating: 4.0 + Math.random(), // Random rating between 4.0-5.0
        ratingCount: Math.floor(Math.random() * 20) + 5, // Random count 5-25
        reviews: []
    }));

    // Sort by rating (highest first)
    return eventsWithStats.sort((a, b) => b.rating - a.rating);
}

// Get all events for a specific city
async function getAllEventsForCity(city, season, duration) {
    // Filter events by city
    const cityEvents = eventsData.filter(event => 
        event.city.toLowerCase() === city.toLowerCase()
    );
    
    if (cityEvents.length === 0) {
        // Create a fallback event
        return [{
            title: `${city} Cultural Festival`,
            city: city,
            category: 'Art & Culture',
            description: `Experience the rich culture and traditions of ${city} during this seasonal festival.`,
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 86400000).toISOString(),
            location: `${city} City Center`,
            coordinates: [0, 0]
        }];
    }
    
    return cityEvents;
}

// Get all events for a country
async function getAllEventsForCountry(country, season, duration) {
    // For now, return some sample events
    return eventsData.slice(0, 5);
}

// Show results section
function showResultsSection() {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Show loading state
function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const resultsContent = document.getElementById('resultsContent');
    
    if (loadingState) {
        loadingState.classList.remove('hidden');
    }
    if (resultsContent) {
        resultsContent.classList.add('hidden');
    }
}

// Display results
async function displayResults(events, city, country, season) {
    console.log('Displaying results for:', { events: events?.length, city, country, season });
    
    const loadingState = document.getElementById('loadingState');
    const resultsContent = document.getElementById('resultsContent');
    
    if (loadingState) {
        loadingState.classList.add('hidden');
    }
    if (resultsContent) {
        resultsContent.classList.remove('hidden');
    }
    
    if (!events || events.length === 0) {
        document.getElementById('noEventsMessage').classList.remove('hidden');
        return;
    }
    
    // Display summary
    displaySummary(events, city, country, season);
    
    // Display events list
    displayEventsList(events);
}

// Display summary
function displaySummary(events, city, country, season) {
    const summaryElement = document.getElementById('summary');
    if (!summaryElement) return;
    
    const avgRating = events.reduce((sum, event) => sum + event.rating, 0) / events.length;
    const liveEvents = events.filter(event => event.source === 'API').length;
    
    summaryElement.innerHTML = `
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4 text-gray-800">Trip Summary</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">${events.length}</div>
                    <div class="text-sm text-gray-600">Total Events</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-yellow-500">${avgRating.toFixed(1)} ⭐</div>
                    <div class="text-sm text-gray-600">Avg Rating</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">${liveEvents}</div>
                    <div class="text-sm text-gray-600">Live Events</div>
                </div>
            </div>
            <div class="mt-4 text-center">
                <p class="text-gray-700">
                    <strong>${city}</strong> in <strong>${country}</strong> during <strong>${season}</strong>
                </p>
            </div>
        </div>
    `;
}

// Display events list
function displayEventsList(events) {
    const eventsListElement = document.getElementById('eventsList');
    if (!eventsListElement) return;
    
    eventsListElement.innerHTML = events.map(event => `
        <div class="event-card bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h4 class="text-lg font-semibold text-gray-800">${event.title}</h4>
                    <p class="text-sm text-gray-600">${event.city}</p>
                </div>
                <div class="text-right">
                    <div class="text-lg font-bold text-yellow-500">${event.rating.toFixed(1)} ⭐</div>
                    <div class="text-xs text-gray-500">${event.ratingCount} reviews</div>
                </div>
            </div>
            <p class="text-gray-700 mb-4">${event.description}</p>
            <div class="flex justify-between items-center">
                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    ${event.category}
                </span>
                <div class="text-sm text-gray-500">
                    ${new Date(event.start_time).toLocaleDateString()}
                </div>
            </div>
        </div>
    `).join('');
}

console.log('Script loaded successfully');
