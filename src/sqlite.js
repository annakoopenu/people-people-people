const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csvParser = require('csv-parser');  // <-- Add this line

const db = new sqlite3.Database('./.data/sqlite.db');

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY, 
    name TEXT, 
    bio TEXT, 
    year_of_birth INTEGER, 
    date_of_birth TEXT, 
    wiki_link TEXT, 
    more TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS people_quotes (
    person_id INTEGER, 
    title TEXT, 
    context TEXT, 
    link TEXT, 
    more TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS people_creations (
    person_id INTEGER, 
    title TEXT, 
    type TEXT, 
    link TEXT, 
    more TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS people_connections (
    person1_id INTEGER, 
    person1_name TEXT, 
    person2_id INTEGER, 
    person2_name TEXT, 
    connection TEXT, 
    more TEXT
  )`);
});

// Function to import CSV data into SQLite
function importCSVData() {
  // Import 'people.csv'
  fs.createReadStream('./data/people.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      db.run('INSERT INTO people (id, name, bio, year_of_birth, date_of_birth, wiki_link, more) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [row.id, row.name, row.bio, row.year_of_birth, row.date_of_birth, row.wiki_link, row.more]);
    })
    .on('end', () => {
      console.log('people.csv successfully imported');
    });

  // Import 'people_quotes.csv'
  fs.createReadStream('./data/people_quotes.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      db.run('INSERT INTO people_quotes (person_id, title, context, link, more) VALUES (?, ?, ?, ?, ?)', 
        [row.person_id, row.title, row.context, row.link, row.more]);
    })
    .on('end', () => {
      console.log('people_quotes.csv successfully imported');
    });

  // Import 'people_creations.csv'
  fs.createReadStream('./data/people_creations.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      db.run('INSERT INTO people_creations (person_id, title, type, link, more) VALUES (?, ?, ?, ?, ?)', 
        [row.person_id, row.title, row.type, row.link, row.more]);
    })
    .on('end', () => {
      console.log('people_creations.csv successfully imported');
    });

  // Import 'people_connections.csv'
  fs.createReadStream('./data/people_connections.csv')
    .pipe(csvParser())
    .on('data', (row) => {
      db.run('INSERT INTO people_connections (person1_id, person1_name, person2_id, person2_name, connection, more) VALUES (?, ?, ?, ?, ?, ?)', 
        [row.person1_id, row.person1_name, row.person2_id, row.person2_name, row.connection, row.more]);
    })
    .on('end', () => {
      console.log('people_connections.csv successfully imported');
    });
}

importCSVData();
