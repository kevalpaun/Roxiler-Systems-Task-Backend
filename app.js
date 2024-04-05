// server.js
const express = require('express');
const app = express();
const sequelize = require('./database/connection');
const routes = require('./routes/dataRoutes');
const cors =  require('cors')

// Connect to database
sequelize.sync()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', routes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
