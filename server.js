const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');
const emailExistence = require('email-existence'); // Add this

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files (HTML, CSS, images)
app.use(express.static('public'));

// Route for the home page (root)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html')); // Serve home.html at root
});

// Route to handle form submission
app.post('/send-mail', (req, res) => {
    const { name, email, subject, message } = req.body;

    // First, check if the email exists (using email-existence)
    emailExistence.check(email, (error, exists) => {
        if (error || !exists) {
            return res.status(400).send('Invalid email address. Please provide a valid email.');
        }

        // If the email exists, send the email using Nodemailer
        const emailConfig = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Ignore self-signed certificate errors
            }
        };

        const transporter = nodemailer.createTransport(emailConfig);

        const mailOptions = {
            from: `"${name}" <${email}>`,  // Use the name and email provided by the user
            to: process.env.RECIPIENT_EMAIL,
            subject: subject,
            text: `You have received a new message from ${name} (${email}):\n\n${message}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send('Error while sending email. Please try again.');
            }
            res.status(200).send('Email sent successfully.');
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
