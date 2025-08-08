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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'Connection': 'keep-alive'
     },
    timeout: 15000
    }); 

    //Parse the HTML 
    // Parse HTML
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    //Takes only results with real ASIN (avoids placeholders/ads)
    const productNodes = Array.from(
    document.querySelectorAll('[data-component-type="s-search-result"]')
    ).filter(el => (el.getAttribute('data-asin') || '').trim().length > 0);

    console.log(`Found ${productNodes.length} products (filtered with data-asin)`);

    const results = [];

    // 2) Extract info with the tolerant selectores
    for (const product of productNodes) {
  // TITLE (prioritizes aria-label from </a>)
  const aEl = product.querySelector('h2 a');
  let title =
    aEl?.getAttribute('aria-label')?.trim() ||
    product.querySelector('h2 a span')?.textContent?.trim() ||
    product.querySelector('h2')?.textContent?.trim() ||
    '';

  // --- RATING ---
  let rating = 'No rating';
  const ratingRaw =
    product.querySelector('.a-icon-alt')?.getAttribute('aria-label') ||
    product.querySelector('.a-icon-alt')?.textContent ||
    '';
  const ratingMatch = ratingRaw.match(/([\d.]+)\s*out of\s*5/i);
  if (ratingMatch) rating = `${ratingMatch[1]} out of 5 stars`;

  // REVIEWS
  let reviews = 'No reviews';
  const reviewsNode =
    product.querySelector('span[aria-label$="ratings"]') ||
    product.querySelector('span[aria-label$="reviews"]') ||
    product.querySelector('.a-size-base.s-underline-text') ||
    product.querySelector('.s-link-style .s-underline-link-text');
  if (reviewsNode) {
    const txt = reviewsNode.textContent.trim();
    const n = (txt.match(/\d[\d,]*/) || [null])[0];
    if (n) reviews = `${n} reviews`;
  } else {
    // Fallback: scan spans con número en formato 1,234
    for (const el of product.querySelectorAll('span')) {
      const t = el.textContent?.trim() || '';
      if (/^\d{1,3}(,\d{3})*$/.test(t)) {
        reviews = `${t} reviews`;
        break;
      }
    }
  }

  // --- IMAGE ---
  let image = 'No image';
  const imgEl =
    product.querySelector('img.s-image') ||
    product.querySelector('img[data-image-latency]') ||
    product.querySelector('img');
  image = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || 'No image';

  // Pushes only if theres a title 
  if (title && title.length > 0) {
    results.push({ title, rating, reviews, image });
  }
}

    // 3) Error handling log
    console.log('Returning results:', results.length);
    if (results[0]) console.log('First result sample:', results[0]);


    //Send results back to the frontend
    res.json({
        success: true,
        keyword: keyword,
        count: results.length,
        products: results
    })

        
    } catch (error) {
        console.log ('Error', error.message)


        //Handling errors a
        res.status (500).json({
            success: false,
            error: 'Failed to scrape amazon due to server issues.'
        });
    }
});

// In case the port doesnt show up on console
console.log('>>> PORT value is:', PORT);

// Here we start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(` Try: http://localhost:${PORT}/api/scrape?keyword=laptop`);
});
