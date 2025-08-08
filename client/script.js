// Get references to HTML elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const results = document.getElementById('results');
const resultsTitle = document.getElementById('resultsTitle');
const productsList = document.getElementById('productsList');

// Backend server URL
const API_URL = 'http://localhost:8080';

// Function to hide all message sections
function hideAllMessages() {
    loading.classList.add('hidden');
    error.classList.add('hidden');
    results.classList.add('hidden');
}

// Function to show loading
function showLoading() {
    hideAllMessages();
    loading.classList.remove('hidden');
}

// Function to show error
function showError(message) {
    hideAllMessages();
    errorMessage.textContent = message;
    error.classList.remove('hidden');
}

// Function to show results
function showResults(data) {
    hideAllMessages();
    
    // Set the title
    resultsTitle.textContent = `Found ${data.count} products for "${data.keyword}"`;
    
    // Clear previous results
    productsList.innerHTML = '';
    
    // Create HTML for each product
    data.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
            <div class="product-title">${product.title}</div>
            <div class="product-rating">${product.rating}</div>
            <div class="product-reviews">${product.reviews}</div>
        `;
        
        productsList.appendChild(productCard);
    });
    
    results.classList.remove('hidden');
}

// Function to search products
async function searchProducts() {
    // Get the search keyword
    const keyword = searchInput.value.trim();
    
    // Check if keyword is empty
    if (!keyword) {
        showError('Please enter a product name to search');
        return;
    }
    
    // Disable button and show loading
    searchButton.disabled = true;
    searchButton.textContent = 'Searching...';
    showLoading();
    
    try {
        // Make request to backend
        const response = await fetch(`${API_URL}/api/scrape?keyword=${encodeURIComponent(keyword)}`);
        const data = await response.json();
        
        // Check if request was successful
        if (data.success) {
            // Check if we found any products
            if (data.count > 0) {
                showResults(data);
            } else {
                showError(`No products found for "${keyword}". Try a different search term.`);
            }
        } else {
            showError(data.error || 'Something went wrong while searching');
        }
        
    } catch (err) {
        console.error('Error:', err);
        showError('Could not connect to the server. Make sure the backend is running.');
    } finally {
        // Re-enable button
        searchButton.disabled = false;
        searchButton.textContent = 'Search Products';
    }
}

// Add click event to search button
searchButton.addEventListener('click', searchProducts);

// Add enter key support to search input
searchInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchProducts();
    }
});

// Focus on input when page loads
window.addEventListener('load', function() {
    searchInput.focus();
});