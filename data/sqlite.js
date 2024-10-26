const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csvParser = require('csv-parser');

// Create and connect to SQLite database
const db = new sqlite3.Database('./.data/sqlite.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Function to drop and recreate all tables
function resetDatabase() {
  db.serialize(() => {
    db.run('DROP TABLE IF EXISTS people');
    db.run('DROP TABLE IF EXISTS people_quotes');
    db.run('DROP TABLE IF EXISTS people_creations');
    db.run('DROP TABLE IF EXISTS people_connections');

    console.log('All tables dropped.');

    db.run(`
      CREATE TABLE people (
        id INTEGER PRIMARY KEY, 
        name TEXT, 
        bio TEXT, 
        year_of_birth INTEGER, 
        date_of_birth TEXT, 
        wiki_link TEXT, 
        more TEXT
      )
    `);

    db.run(`
      CREATE TABLE people_quotes (
        person_id INTEGER, 
        title TEXT, 
        context TEXT, 
        link TEXT, 
        more TEXT
      )
    `);

    db.run(`
      CREATE TABLE people_creations (
        person_id INTEGER, 
        title TEXT, 
        type TEXT, 
        link TEXT, 
        more TEXT
      )
    `);

    db.run(`
      CREATE TABLE people_connections (
        person1_id INTEGER, 
        person1_name TEXT, 
        person2_id INTEGER, 
        person2_name TEXT, 
        connection TEXT, 
        more TEXT
      )
    `);

    console.log('All tables recreated.');
  });
}

// Function to import data from CSV files
function importCSVData() {
  fs.createReadStream('./data/people.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      db.run(
        'INSERT INTO people (id, name, bio, year_of_birth, date_of_birth, wiki_link, more) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [row.id, row.name, row.bio, row.year_of_birth, row.date_of_birth, row.wiki_link, row.more],
        (err) => {
          if (err) console.error('Error inserting row:', row, err.message);
        }
      );
    })
    .on('end', () => {
      console.log('people.csv successfully imported');
    });
}

// Export functions and database connection
module.exports = {
  db,
  resetDatabase,
  importCSVData,
};
