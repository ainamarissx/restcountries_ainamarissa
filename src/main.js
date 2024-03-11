// Navigation Functions
function goToSearchPage() {
    // Redirect to the search page
    window.location.href = "search.html";
}

function goToWelcomePage() {
    // Redirect to the welcome page (index)
    window.location.href = "index.html";
}

function goToAddVisitedPage() {
    // Redirect to the page for adding visited places
    window.location.href = "addvisit.html";
}

function goToAddTripDetails() {
    // Redirect to the page for adding trip details
    window.location.href = "addtrip.html";
}

// Function to load countries API based on region filter
function loadCountryAPI(region = '') {
    let apiUrl = 'https://restcountries.com/v3.1/all';
    
    // If a region is provided, add it to the API URL as a filter
    if (region) {
        apiUrl = `https://restcountries.com/v3.1/region/${region}`;
    }

    // Fetch country data from the API
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => displayCountries(data)) // Display the retrieved countries
        .catch(error => console.error('Error:', error)); // Handle potential errors
}

// Function to filter countries based on selected region
function filterCountries() {
    const regionFilter = document.getElementById('region').value;
    loadCountryAPI(regionFilter); // Load country data based on selected region
}


function displayCountries(countries) {
    // Generate HTML for displaying countries
    const countriesHTML = countries.map(country => getCountry(country)).join(' ');
    // Get container element for countries
    const container = document.getElementById('countries');
    // Update the container with the generated HTML
    container.innerHTML = countriesHTML;
}

function getCountry(country) {
    // Generate HTML for displaying a single country
    return `
        <div class="country-div">
            <img src="${country.flags.png}" alt="${country.name.common} Flag">
            <h2>${country.name.common}</h2>
            <hr>
            <h4>Independent: ${country.independent}</h4>
            <h4>Sub-Region: ${country.subregion}</h4>
            <h4>Area: ${country.area} km</h4>
        </div>
    `;
}

// Call the function to load country data on page load
loadCountryAPI();


function getCountryDetails() {
    // Get the country name input from the user
    const countryName = document.getElementById("countryInput").value;
    
    // Fetch country details based on the provided country name
    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
    .then(response => response.json()) // Convert response to JSON
    .then(data => {
        // Extract the country object from the response data
        const country = data[0];
        
        // Update HTML elements with country details
        document.getElementById("commonName").innerText = `Common Name: ${country.name.common}`;
        document.getElementById("officialName").innerText = `Official Name: ${country.name.official}`;
        document.getElementById("capital").innerText = `Capital: ${country.capital}`;
        document.getElementById("region").innerText = `Region: ${country.region}`;
        document.getElementById("languages").innerText = `Languages: ${Object.values(country.languages).join(", ")}`;
        document.getElementById("population").innerText = `Population: ${country.population}`;
        document.getElementById("flag").src = country.flags.png;
        document.getElementById("location").innerText = `Location(Lat/Lng): ${country.latlng.join(", ")}`;
        document.getElementById("continent").innerText = `Continent: ${country.continents}`;
        document.getElementById("googleMap").innerHTML = `<a href="https://www.google.com/maps/place/${country.latlng.join(",")}">Google Map</a>`;
        
        // Handling currencies
        const currencies = Object.values(country.currencies).map(currency => currency.name);
        document.getElementById("currencies").innerText = `Currencies: ${currencies.join(", ")}`;
    })
    .catch(error => {
        console.error('Error:', error); // Log any errors to console
        alert("Country not found!"); // Display an alert if country is not found
    });
}


// Function to open trip form for adding or editing a trip
function openTripForm(tripTitle = '') {
    // If tripTitle is provided, it means we are editing an existing trip
    if (tripTitle) {
        // Retrieve trip details from localStorage
        const tripData = JSON.parse(localStorage.getItem(tripTitle));
        
        // Populate form fields with trip details
        document.getElementById('tripTitle').value = tripData.tripTitle;
        document.getElementById('tripTitle').disabled = true; // Disable editing of the trip title
        document.getElementById('countryName').value = tripData.countryName;
        document.getElementById('editorName').value = tripData.editorName;
        document.getElementById('startDate').value = tripData.startDate;
        document.getElementById('endDate').value = tripData.endDate;
        document.getElementById('pax').value = tripData.pax;
        document.getElementById('budget').value = tripData.budget;

        // Display the trip form
        document.getElementById('trip-form').style.display = 'block';
    } else {
        // If no tripTitle is provided, it means we are adding a new trip
        // Clear form fields
        clearForm();

        // Enable editing of the trip title
        document.getElementById('tripTitle').disabled = false;

        // Display the trip form
        document.getElementById('trip-form').style.display = 'block';
    }
}

function addTrip(event) {
    event.preventDefault(); // Prevent form submission

    // Get form input values
    const tripTitle = document.getElementById('tripTitle').value;
    const countryName = document.getElementById('countryName').value;
    const editorName = document.getElementById('editorName').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const pax = document.getElementById('pax').value;
    const budget = document.getElementById('budget').value;

    // Check if any of the input values are undefined or empty
    if (
        tripTitle === undefined || tripTitle === '' ||
        countryName === undefined || countryName === '' ||
        editorName === undefined || editorName === '' ||
        startDate === undefined || startDate === '' ||
        endDate === undefined || endDate === '' ||
        pax === undefined || pax === '' ||
        budget === undefined || budget === ''
    ) {
        // If any value is undefined or empty, alert the user and don't save the trip
        alert('Please fill out all fields.');
        return;
    }

    // Check if the trip title already exists in localStorage
    if (localStorage.getItem(tripTitle)) {
        // Update existing trip details
        const updatedTrip = {
            tripTitle,
            countryName,
            editorName,
            startDate,
            endDate,
            pax,
            budget
        };
        updateTrip(tripTitle, updatedTrip); // Update the trip in localStorage
    } else {
        // Add new trip only if title doesn't exist
        const trip = {
            tripTitle,
            countryName,
            editorName,
            startDate,
            endDate,
            pax,
            budget
        };
        saveTripToFile(trip); // Save the new trip to localStorage
        displayTrip(trip); // Display the new trip on the page
    }

    clearForm(); // Clear form fields after submission
}



// Function to update an existing trip
function updateTrip(tripTitle, updatedTrip) {
    // Update trip data in localStorage
    localStorage.setItem(tripTitle, JSON.stringify(updatedTrip));

    // Call displayStoredTrips function to update the displayed trips
    displayStoredTrips();
}

// Function to save trip data to localStorage
function saveTripToFile(trip) {
    const tripData = JSON.stringify(trip);
    localStorage.setItem(trip.tripTitle, tripData);
}

// Function to display a trip on the page
function displayTrip(trip) {
    const tripDetailsContainer = document.getElementById('trip-details');
    const tripDetailsHTML = `
        <div class="trip-card" data-tripTitle="${trip.tripTitle}">
            <h3>${trip.tripTitle}</h3>
            <p><strong>Country:</strong> ${trip.countryName}</p>
            <p><strong>Editor:</strong> ${trip.editorName}</p>
            <p><strong>Start Date:</strong> ${trip.startDate}</p>
            <p><strong>End Date:</strong> ${trip.endDate}</p>
            <p><strong>Number of Pax:</strong> ${trip.pax}</p>
            <p><strong>Budget: RM </strong> ${trip.budget}</p>
            <button onclick="openTripForm('${trip.tripTitle}')">Edit</button>
            <button onclick="deleteTrip('${trip.tripTitle}')">Delete</button>
        </div>
    `;
    tripDetailsContainer.insertAdjacentHTML('beforeend', tripDetailsHTML);
}

// Function to clear the trip form
function clearForm() {
    document.getElementById('tripTitle').value = '';
    document.getElementById('countryName').value = '';
    document.getElementById('editorName').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('pax').value = '';
    document.getElementById('budget').value = '';
}

// Function to retrieve trips from localStorage and display them on page load
function displayStoredTrips() {
    const tripDetailsContainer = document.getElementById('trip-details');
    tripDetailsContainer.innerHTML = ''; // Clear existing trip cards
    
    // Loop through localStorage to retrieve stored trips
    for (let i = 0; i < localStorage.length; i++) {
        const tripData = JSON.parse(localStorage.getItem(localStorage.key(i)));
        displayTrip(tripData); // Display each trip on the page
    }
}

// Function to delete a trip
function deleteTrip(tripTitle) {
    // Show confirmation dialog
    const confirmDelete = confirm(`Are you sure you want to delete '${tripTitle}'?`);
    
    // If user confirms deletion
    if (confirmDelete) {
        // Remove trip data from localStorage
        localStorage.removeItem(tripTitle);
        
        // Find the trip card container by its tripTitle attribute
        const tripCard = document.querySelector(`.trip-card[data-tripTitle="${tripTitle}"]`);
        
        // If trip card is found, remove it from the DOM
        if (tripCard) {
            tripCard.parentNode.removeChild(tripCard);
        }

        // Call displayStoredTrips function to update the displayed trips
        displayStoredTrips();
    }
}

// Call displayStoredTrips function on page load
displayStoredTrips();

// Function to add country to wishlist
function addToWishlist(event) {
    event.preventDefault();
    var wishlistItemInput = document.getElementById('wishlistItem');
    var wishlistDetailsInput = document.getElementById('wishlistDetails');
    var wishlistItemValue = wishlistItemInput.value.trim();
    var wishlistDetailsValue = wishlistDetailsInput.value.trim();

    // Check if both country name and details are provided
    if (wishlistItemValue !== '' && wishlistDetailsValue !== '') {
        var wishlistItemsContainer = document.getElementById('wishlistItems');
        var newItem = createListItem(wishlistItemValue, wishlistDetailsValue);
        wishlistItemsContainer.appendChild(newItem);
        wishlistItemInput.value = ''; // Clear input fields after adding
        wishlistDetailsInput.value = '';
        updateLocalStorage('wishlistItems', wishlistItemsContainer.innerHTML); // Update localStorage
    } else {
        alert("Please enter both country name and details.");
    }
}

// Function to add visited place
function addVisitedPlace(event) {
    event.preventDefault();
    var visitedItemInput = document.getElementById('visitedItem');
    var visitedDetailsInput = document.getElementById('visitedDetails');
    var visitedItemValue = visitedItemInput.value.trim();
    var visitedDetailsValue = visitedDetailsInput.value.trim();

    // Check if both country name and details are provided
    if (visitedItemValue !== '' && visitedDetailsValue !== '') {
        var visitedItemsContainer = document.getElementById('visitedItems');
        var newItem = createListItem(visitedItemValue, visitedDetailsValue);
        visitedItemsContainer.appendChild(newItem);
        visitedItemInput.value = ''; // Clear input fields after adding
        visitedDetailsInput.value = '';
        updateLocalStorage('visitedItems', visitedItemsContainer.innerHTML); // Update localStorage
    } else {
        alert("Please enter both country name and details.");
    }
}

// Function to create list item with delete button and details
function createListItem(name, details) {
    var newItem = document.createElement('li');
    newItem.innerHTML = `
        <span>Country: ${name}</span>
        <br><br>
        <span>Details: ${details}</span><br><br>
        <button class="delete-button">Delete</button>
    `;
    var deleteButton = newItem.querySelector('.delete-button');
    deleteButton.addEventListener('click', function() {
        if (confirm("Are you sure you want to delete '" + name + "' ?")) {
            newItem.parentNode.removeChild(newItem);
            // Update localStorage after deletion
            updateLocalStorage('wishlistItems', document.getElementById('wishlistItems').innerHTML);
            updateLocalStorage('visitedItems', document.getElementById('visitedItems').innerHTML);
        }
    });
    return newItem;
}

// Function to update local storage
function updateLocalStorage(key, value) {
    localStorage.setItem(key, value);
}

// Function to display data from local storage on page load
function displayFromLocalStorage() {
    var wishlistItemsContainer = document.getElementById('wishlistItems');
    var visitedItemsContainer = document.getElementById('visitedItems');

    // Check if wishlist items are stored in localStorage
    if (localStorage.getItem('wishlistItems')) {
        wishlistItemsContainer.innerHTML = localStorage.getItem('wishlistItems');
    }

    // Check if visited places are stored in localStorage
    if (localStorage.getItem('visitedItems')) {
        visitedItemsContainer.innerHTML = localStorage.getItem('visitedItems');
    }
}

// Event listeners for the forms
document.getElementById('addToWishlistForm').addEventListener('submit', addToWishlist);
document.getElementById('addVisitedPlaceForm').addEventListener('submit', addVisitedPlace);

// Call function to display data from local storage on page load
window.addEventListener('load', displayFromLocalStorage);
