global.foodData = require('./db')(function call(err, data, CatData) {
  if (err) console.log(err);
  global.foodData = data;
  global.foodCategory = CatData;
});

const express = require('express');
const app = express();
const port = 5000;
const path = require('path');
const router = express.Router();
const cors = require('cors');
const { job } = require('./cron');
job.start();
// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'uploads')));
job.start();
// CORS setup

const corsOptions = {
  origin: [
    "https://jewels-shop-ten.vercel.app",
    "http://localhost:5173"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Optional

app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/', require('./Routes/Webhook'));
app.use(express.json());
app.use('/api/auth', require('./Routes/Auth'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Use your auth routes
app.use('/api/auth', require('./Routes/Auth'));

// Apply the webhook route without express.json() middleware
// Webhook needs express.raw() instead of express.json()




// Start the server
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
