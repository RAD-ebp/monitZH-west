const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow certain HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow certain headers

    // Handle preflight requests (OPTIONS method)
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve the HTML file
    if (req.url === '/' || req.url === '/map_Bearbeitung.html') {
        const filePath = path.join(__dirname, 'public', 'map_Bearbeitung.html'); // Path to your HTML file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end(err.message);
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
        return;
    }

    // Serve GeoJSON files
    if (req.url.endsWith('.geojson')) {
        const filePath = path.join(__dirname, 'public', req.url); // Path to the requested GeoJSON file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('GeoJSON file not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
        return;
    }

    // Serve CSV files
    if (req.url.endsWith('.csv')) {
        const filePath = path.join(__dirname, 'public', req.url); // Path to the requested CSV file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('CSV file not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/csv' });
            res.end(data);
        });
        return;
    }

    // Serve Excel files
    if (req.url.endsWith('.xlsx')) {
        const filePath = path.join(__dirname, 'public', req.url); // Path to the requested Excel file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('Excel file not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            res.end(data);
        });
        return;
    }

    // Serve PDF files
    if (req.url.endsWith('.pdf')) {
        const filePath = path.join(__dirname, 'public', req.url); // Path to the requested PDF file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('PDF file not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/pdf' });
            res.end(data);
        });
        return;
    }


    // Handle other requests...
    // Add more logic to handle different routes or resources

    // If the requested resource is not found
    res.writeHead(404);
    res.end('404 Not Found');
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


