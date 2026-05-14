const express = require('express');
const mongoose = require('mongoose');
const connectDB = require("./config/db");
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const setRoutes = require('./routes/setRoutes');

dotenv.config();

// Connect Database
connectDB();


const app = express();



app.use(cors()); 
app.use(bodyParser.json()); 




app.use('/auth', authRoutes); 
app.use('/sets', setRoutes);



app.get("/", (req, res) => {
  res.send("API Running");
});


// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});