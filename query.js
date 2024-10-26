const sqlite3 = require('sqlite3').verbose();

// Connect to the existing SQLite database
const db = new sqlite3.Database('./.data/sqlite.db');

// Query the 'people' table and print the results
db.all('SELECT * FROM people', (err, rows) => {
  if (err) {
    console.error('Error fetching data:', err.message);
  } else {
    console.log('People Table Data:', rows);
  }

  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
  });
});
