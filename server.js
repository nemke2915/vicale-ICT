const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const axios = require('axios');
const i18next = require('i18next');
const Backend = require('i18next-node-fs-backend');
const i18nextMiddleware = require('i18next-http-middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        fallbackLng: 'en', // Set Serbian as the default fallback language
        backend: {
            loadPath: path.join(__dirname, '/locales/{{lng}}/translation.json'),
        },
        detection: {
            order: ['querystring', 'cookie', 'header'], // Detect language from query string, cookie, or header
            caches: ['cookie'], // Cache language preference in cookies
            lookupCookie: 'i18next', // Name of the cookie used to store the language
        },
        supportedLngs: ['en', 'sr'], // Ensure both 'en' and 'sr' are supported
        preload: ['en', 'sr'], // Preload both English and Serbian
    });


// Serve translations to the client
app.use(i18nextMiddleware.handle(i18next));

// Set up helmet to secure HTTP headers
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// Set EJS as the template engine
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

// Set the directory for the EJS templates (this is usually "views")
app.set('views', path.join(__dirname, 'views'));

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
    maxAge: '0', // Cache static files for 1 day (24 hours)
}));

// Route to provide the CSRF token
app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Routes for rendering EJS views
// Serve home page
app.get('/home', csrfProtection, (req, res) => {
    const lng = req.language; // Get the language from i18next middleware
    res.render('home', { csrfToken: req.csrfToken(), lng });
});

// Serve about page
app.get('/about', csrfProtection, (req, res) => {
    const lng = req.language; // Get the language from i18next middleware
    res.render('about', { csrfToken: req.csrfToken(), lng });
});

// Serve services page
app.get('/services', csrfProtection, (req, res) => {
    const lng = req.language; // Get the language from i18next middleware
    res.render('services', { csrfToken: req.csrfToken(), lng });
});

// Serve contact page
app.get('/contact', csrfProtection, (req, res) => {
    const lng = req.language; // Get the language from i18next middleware
    res.render('contact', { csrfToken: req.csrfToken(), lng });
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

// Catch-all route to redirect to the home page
app.get('*', (req, res) => {
    res.redirect('/home');
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

// Uncomment to activate periodic reloads
// setInterval(reloadWebsite, interval);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
