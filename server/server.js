//Import required packages
const express = require ('express');
const cors = require ('cors');
const {JSDOM} =require ('jsdom');
const axios = require ('axios');

//Create the express app
const app = express();
const PORT  = 8080;

// Enabling cors so it can comunicate with the frontend
app.use(cors());

//Main endpoint 
app.get('/', (req, res) => {
  res.send('Server functioning correctly');
});

//Health endpoint to confirm that the backend runs 

app.get('/health', async (req, res) => {
    res.json({message: `Server successfully running on http://localhost:${PORT}`}); 

})

//Main scraping endpoint
app.get('/api/scrape', async (req, res) => {
    try {
    
    //Get the keyword from the query parameters
    const keyword = req.query.keyword;

    //Check if the keyword is provided
    if (!keyword) {
        return res.status(400).json({error: 'Please provide a keyword to search'});
    }

    console.log(`Searching for ${keyword}`);

    // Build the amazon search URL
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    //Fetch the  amazon search results page
    const response = await axios.get(url, {
        headers: {
        // Pretend to be a real browser
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    //Parse the HTML 
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    //Find all the product containers 
    const products = document.querySelectorAll('[data-component-type="s-search-result"]');

    console.log(`Found ${products.length} products`);

    //Array to store all the results
    const results = [];

    //Looping through each products, maximum 10
    for (let i = 0; i < Math.min (products.length, 10); i++) {

        const product = products[i];

        //Extract the product title
        const titleElement = product.querySelector('h2 a span');
        const title = titleElement ? titleElement.textContent.trim() : 'No title found';

        //Extract the rating 

        let rating = 'No current ratings';
        const ratingElement = product.querySelector('.a-icon-alt');
        if (ratingElement) {
            const ratingText = ratingElement.getAttribute('aria-label');
            if (ratingText && ratingText.includes('out of 5')) {
                rating = ratingText
            }
        }


        //Extract the number of reviews 
        let reviews = 'No reviews';
        const reviewElements = product.querySelectorAll('span');
        for (let reviewElement of reviewElements) {
            const text = reviewElement.textContent.trim();
            //Here we look for numbers with commas 
            if (text.match(/^\d{1,3}(,\d{3})*$/)) {
          reviews = text + ' reviews';
          break;
        }
    
        }

        //logic for extracting the immage URL 
        let imageUrl = 'No image';
        const imageElement = product.querySelector('img');
        if (imageElement && imageElement.src) {
            imageUrl = imageElement.src
        }


        //Only add products that have a real title
        if (title !== 'No title found') {
            results.push({
                title:title,
                rating: rating,
                reviews: reviews,
                image: imageUrl

            })
        }
    }

    //Send results bacj to the frontend
    res.json({
        success: true,
        keyword: keyword,
        count: results.length,
        products: results
    })

        
    } catch (error) {
        console.log ('Error', error.message)


        //Handling errors and sending them to the frontend console

        res.status (500).json({
            success: false,
            error: 'Failed to scrape amazon due to server issues.'
        });
    }
});

// In case the port doesnt show up on console

console.log('>>> PORT value is:', PORT);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(` Try: http://localhost:${PORT}/api/scrape?keyword=laptop`);
});

``