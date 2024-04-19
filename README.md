# MedXRP

MedXRP is a web application designed to securely manage health records using blockchain technology provided by the XRP Ledger. It allows users to store and retrieve health records in a decentralized and tamper-resistant manner.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Secure User Authentication**: Users can register and login securely with their credentials.
- **Decentralized Storage**: Health records are stored securely on the XRP Ledger, ensuring tamper resistance and data integrity.
- **User-friendly Interface**: The application provides an intuitive interface for users to manage their health records.
- **Wallet Integration**: Users can link their XRP wallet addresses to securely access and manage their health records.
- **Session Management**: Sessions are used to maintain user authentication and state throughout the application.

## Technologies Used

- **Express.js**: A web application framework for Node.js used to build the backend server.
- **MongoDB**: A NoSQL database used to store user information and health records.
- **Mongoose**: An object data modeling (ODM) library for MongoDB and Node.js.
- **bcrypt**: A library used for hashing passwords for secure storage.
- **xrpl**: A JavaScript library for interacting with the XRP Ledger.
- **Helmet**: Middleware to set various HTTP headers for security.
- **Body-parser**: Middleware to parse incoming request bodies.
- **Express-session**: Middleware to manage user sessions.
- **dotenv**: A module to load environment variables from a .env file.
- **EJS**: A simple templating language used for server-side rendering.

## Setup

1. Clone the repository:
  git clone https://github.com/tsehetndev/MedXRP.git

2. Navigate to the project directory:

3. Install dependencies:


4. Set up environment variables:

   Create a `.env` file in the root directory and add the following variables:
    MONGODB_URI=your_mongodb_uri
    PORT=3000

5. Start the server:
  npm start


## Usage

1. Register a new account by accessing the registration page.
2. Login with your credentials.
3. Link your XRP wallet address to securely manage your health records.
4. Add, view, and manage your health records securely.
5. Logout when done.

## Endpoints

- **POST /register**: Register a new user.
- **POST /login**: Login an existing user.
- **GET /health-records**: Fetch all health records.
- **POST /health-records**: Add a new health record.
- **GET /health-records/cid**: Fetch health records of a specific user.
- **GET /wallet-balance**: Fetch wallet balance for the logged-in user.
- **GET /users/all**: Fetch all registered users.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).



