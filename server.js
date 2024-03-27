const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');
const xrpl = require('xrpl');
const session = require('express-session');
const { Wallet} = require('xrpl');
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


// Set up session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
 }));

// Add helmet middleware with CSP configuration
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "*"] // Allow connections to any origin
    }
  }));


// Middleware
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.render("index", { loggedIn: req.session.loggedIn });
});

// Route to serve login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/login.html'));
});

// Route to serve registration.html
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/registration.html');
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI,)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


// Initialize XRPL API with the server
const api = new xrpl.Client('wss://s.altnet.rippletest.net:51233', {
    connectionTimeout: 100000
});

// Connect to XRPL
api.connect().then(() => {
    console.log('Connected to XRPL');
}).catch((error) => {
    console.error('Failed to connect to XRPL:', error);
});

// Define user schema
const userSchema = new mongoose.Schema({
    name: { type: String },
    cid: { type: String, unique: true },
    username: { type: String, unique: true },
    phoneNo: { type: Number, unique: true },
    email: { type: String, unique: true },
    password: String,
    walletAddress: { type: String, unique: true },
    walletSecret: { type: String }
});

const User = mongoose.model('User', userSchema);

const healthRecordSchema = new mongoose.Schema({
    recordId: { type: String, required: true },
    name: String,
    walletAddress: { type: String, required: true },
    cid: { type: String, required: true },
    presdate: { type: Date, required: true },
    prescription: { type: String, required: true }
});

// Create a model based on the schema
const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

app.post('/health-records', async (req, res) => {
    try {

        let api = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
        await api.connect();

        const { prescription } = req.body;
        const { walletAddress, name, cid } = req.session.user;

        // Create a new HealthRecord document
        const newHealthRecord = new HealthRecord({
            recordId: generateRandomId(),
            name: name,
            walletAddress: walletAddress,
            cid: cid,
            presdate: new Date(),
            prescription: prescription
        });

        // Save the new health record to MongoDB
        await newHealthRecord.save();

        res.json({ success: true, message: "Health record saved successfully" });
    } catch (error) {
        console.error("Error posting health record:", error);
        res.status(500).json({ success: false, error: "Error posting health record" });
    } finally {
        if (api) {
            await api.disconnect();
        }
    }
});

// Route to read all health records
app.get('/health-records', async (req, res) => {
    try {
        let api = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
        await api.connect();

        const healthRecords = await HealthRecord.find();

        res.json({ success: true, data: healthRecords });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to fetch health records' });
    } finally {
        if (api) {
            await api.disconnect();
        }
    }
});

// Route to get all health records of a given CID from session
app.get("/health-records/cid", async (req, res) => {
    try {
        const { cid } = req.session.user;

        // Query health records from the database with the provided CID
        const records = await HealthRecord.find({ cid });

        if (records.length === 0) {
            return res.status(404).json({ success: false, error: "No Health Records found for this CID" });
        }

        res.json({ success: true, data: records });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});


// Route for fetching all users
app.get('/users/all', async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) {
            return res.status(404).send('No users found');
        }
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to fetch wallet balance
app.get('/wallet-balance', async (req, res) => {
    try {
        // Get wallet address from session
        const { walletAddress } = req.session.user;

        // Initialize XRPL API with the server
        const api = new xrpl.Client('wss://s.altnet.rippletest.net:51233', {
            connectionTimeout: 10000
        });

        // Connect to XRPL
        await api.connect();

        // Get account info to fetch the balance
        const accountInfo = await api.request({
            command: 'account_info',
            account: walletAddress
        });

        // Close the connection to XRPL
        await api.disconnect();

        // Check if account info is retrieved successfully and has balance property
        if (accountInfo && accountInfo.result && accountInfo.result.account_data && accountInfo.result.account_data.Balance) {
            const balance = accountInfo.result.account_data.Balance;
            // Convert balance from drops to XRP (1 XRP = 1,000,000 drops)
            const xrpBalance = parseFloat(balance) / 1000000;
            res.json({ success: true, balance: xrpBalance });
        } else {
            console.error('Failed to retrieve wallet balance:', accountInfo);
            res.status(500).json({ success: false, error: 'Failed to fetch wallet balance' });
        }
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch wallet balance' });
    } finally {
        if (api) {
            await api.disconnect();
        }
    }
});

// Route for user registration
app.post('/register', async (req, res) => {
    const { cid, name, username, phoneNo, email, password, confirmPassword, walletAddress, walletSecret } = req.body;

    try {
        // Check if password and confirmPassword are empty
        if (!password || !confirmPassword) {
            return res.status(400).send('Please provide both password and confirm password');
        }

        // Check if a user with the provided email already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User with this email already exists');
        }

        // Check if a user with the provided username already exists
        existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('User with this username already exists');
        }

        // Check if a user with the provided phone number already exists
        existingUser = await User.findOne({ phoneNo });
        if (existingUser) {
            return res.status(400).send('User with this phone number already exists');
        }

        // Check if a user with the provided CID already exists
        existingUser = await User.findOne({ cid });
        if (existingUser) {
            return res.status(400).send('User with this CID already exists');
        }

        // Check if a user with the provided wallet address already exists
        existingUser = await User.findOne({ walletAddress });
        if (existingUser) {
            return res.status(400).send('User with this wallet address already exists');
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).send('Password and confirm password do not match');
        }

        // Validate the wallet address
        if (!isValidRippleAddress(walletAddress)) {
            return res.status(400).send('Invalid Ripple wallet address');
        }

        // Validate the wallet secret
        const isValidSecretForAddress = await validateWalletSecret(walletAddress, walletSecret);
        if (!isValidSecretForAddress) {
            return res.status(400).send('Invalid wallet secret for the provided wallet address');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        //hash wallet secret
        const hashedWalletSecret = await bcrypt.hash(walletSecret, 10);

        // Create a new user
        const newUser = new User({
            cid,
            name,
            username,
            phoneNo,
            email,
            walletAddress,
            walletSecret: hashedWalletSecret,
            password: hashedPassword
        });

        // Save the user to the database
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });

    } catch (error) {
        // If an error occurs during registration, send an error response
        console.error(error);
        res.status(500).send('Registration failed. Please try again.');
    }
});


app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;

    // Find the user by email or username
    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    });
    // console.log("Found user:", user);

    if (!user) {
        return res.status(400).send('Invalid email/username or password');
    }

    // Compare passwords
    try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).send('Invalid email/username or password');
        }

        // Store user details in session
        req.session.user = {
            name: user.name,
            username: user.username,
            cid: user.cid,
            phoneNo: user.phoneNo,
            walletAddress: user.walletAddress,
            walletSecret: user.walletSecret
        };
        console.log(req.session.user);

        res.send('Login successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Function to validate if the provided wallet secret corresponds to the given wallet address
async function validateWalletSecret(walletAddress, walletSecret) {
    try {
        // Create a new wallet object from the provided wallet secret
        const wallet = Wallet.fromSeed(walletSecret);

        // Get the wallet address derived from the provided wallet secret
        const secretAddress = wallet.address;

        // Compare the provided wallet address and the wallet address derived from the wallet secret
        if (secretAddress === walletAddress) {
            return true; // Authentication successful
        } else {
            return 'Invalid wallet secret.'; // Authentication failed
        }
    } catch (error) {
        console.error(error);
        return 'Error validating wallet secret.'; // Error occurred during validation
    }
}

// Function to validate XRP wallet address
function isValidRippleAddress(address) {
    const rippleAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
    return rippleAddressRegex.test(address);
}

function generateRandomId() {
    return Math.random().toString(36).substring(7);
}

// Start the server
const PORT = process.env.PORT || 3000;
const localhost = `http://localhost:${PORT}`;

app.listen(PORT, () => console.log(`Server running at ${localhost}`));
