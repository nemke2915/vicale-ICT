const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up helmet to secure HTTP headers
app.use(helmet()); // Use helmet to secure HTTP headers

// Enable Express to trust the 'X-Forwarded-For' header from proxies
app.set('trust proxy', 1); // or app.set('trust proxy', true);

// Set up middleware
app.use(cookieParser()); // Make sure cookie-parser is used before csurf
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CSRF protection middleware using cookies
const csrfProtection = csrf({ cookie: true });

// Rate limiting configuration for /send-mail route
const sendMailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Serve static files with caching
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '0' // Cache static files for 1 day (24 hours)
}));

// Route to provide the CSRF token
app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Serve contact page as static HTML
app.get('/contact', csrfProtection, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html')); // Serve the contact page
});

// Handle form submission (POST request) with rate limiting applied
app.post('/send-mail', sendMailLimiter, csrfProtection, (req, res) => {
    const { name, email, subject, message } = req.body;

    // Nodemailer setup
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.RECIPIENT_EMAIL,
        subject: subject,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`Error sending mail: ${error.message}`); // Log the error for debugging
            return res.status(500).send('An internal error occurred. Please try again later.');
        }
        res.status(200).send('Email sent successfully.');
    });
});

// Catch-all route to redirect to the home page for any undefined route
app.get('*', (req, res) => {
    res.redirect('/home.html'); // Redirect to /home.html for undefined routes
});


const url = `https://vicale-ict.onrender.com`; // Replace with your Render URL
const interval = 30000; // Interval in milliseconds (30 seconds)

function reloadWebsite() {
  axios.get(url)
    .then(response => {
      console.log(`Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`);
    })
    .catch(error => {
      console.error(`Error reloading at ${new Date().toISOString()}:`, error.message);
    });
}


setInterval(reloadWebsite, interval);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
