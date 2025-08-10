# Simple Amazon Product Scraper (Bun + Express + Vite)

A minimal Amazon scraper:
- Backend: Bun + Express + Axios + JSDOM
- Frontend: Vite + Vanilla JS
- Extracts: product title, rating, number of reviews, image URL

This README includes fixes for common issues that I documented on the process of testing the finnal product. 

## Prerequisites

-Bun (latest)<br>
-Any browser

 ## Project setup to run locally 

 1) Install dependencies on root, server and client projects
```
# Installing on root
bun install

# On backend
cd server && bun install

# On frontend
cd client && bun install

## Back to root
cd ..
```

## Run locally

You can run both projects at once from the root folder but I recommed doing each one individually

```
# Both at once (with concurrently installed)
bun run dev

# Only backend
cd server
bun run dev

# Only frontend
cd client
bun run dev 
```
## Default ports 

- Backend: `http://localhost:8080` If you adjust the port make sure you also change it on client/script.js
- Frontend: `http://localhost:5173`

<hr>

# KNOWN ISSUES

Since I'm on arch linux you probably wont see these if you run it on windows, but if you do help yourself out with these issues and how to fix them

## HTTP VS HTTPS

By default the backend runs on http, this so amazon doesn't block requests due to security reasons. Also if your browser forces HTTPS by pasting the localhost url on the search bar just manually type the url with HTTP

## Allow the firewall to use bun

This issue can also contribute with the https problem, if you are on linux just allow ufw to go through the ports with

```
  sudo ufw allow 8080/tcp
  sudo ufw allow 5173/tcp

```

<hr>

# Additional stuff

## API Endpoints

- GET `/` → Basic server status text
- GET `/health` → JSON health payload to check if the API is responding correctly
- GET `/api/scrape?keyword=<term>` → JSON products

Examples:

```bash
curl "http://localhost:8080/"
curl "http://localhost:8080/health"
curl "http://localhost:8080/api/scrape?keyword=watch"
```

---

## Technical Notes

- Amazon may change markup or block scraping; selectors and headers include fallbacks
- Avoid frequent requests to prevent temporary IP blocks

---
