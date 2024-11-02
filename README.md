# People People People

In the end, it's all about people. The goal of this project is to build a nice way to go through different great (mostly) people and be engaged with their creations.

This is the first step, the MVP.


# Node.js & SQLite

This project includes a [Node.js](https://nodejs.org/en/about/) server script that uses a persistent [SQLite](https://www.sqlite.org) database. The app also includes a front-end with two web pages that connect to the database using the server API. 📊

_Last updated: 02 Nov 2024_

## What's in this project?

← `package.json`: The NPM packages for project's dependencies.

### Server and database

← `server.js`: The Node.js server script for the site. The JavaScript defines the endpoints in the site API. The API processes requests, connects to the database using the `sqlite` script in `data`, and sends info back to the client (the web pages that make up the app user interface, built using the Handlebars templates in `src/pages`).

← `/data/sqlite.js`: The database script handles setting up and connecting to the SQLite database. The `server.js` API endpoints call the functions in the database script to manage the data.


When the app runs, the scripts build the database:

← `.data/sqlite.db`: The database is created and SHOULD BE placed in the `.data` folder, a hidden directory whose contents aren’t copied when a project is remixed. 

### User interface

← `public/style.css`: The style rules that define the site appearance.

← `src/pages`: The handlebars files that make up the site user interface. The API in `server.js` sends data to these templates to include in the HTML.

← `src/pages/index.hbs`: The site homepage presents a form when the user first visits. When the visitor submits a preference through the form, the app calls the `POST` endpoint `/`, passing the user selection. The `server.js` endpoint updates the database and returns the user choices submitted so far.

← `src/pages/admin.hbs`: The admin page presents a table displaying the log of most recent picks. You can clear the list by setting up your admin key (see `TODO.md`). If the user attempts to clear the list without a valid key, the page will present the log again.


## How the result looks

![Alt Text](/Screenshot%202024-11-01.png)

## How to run this code

- Clone this repo
- Create a Code Space
- Type at Code Space's TERMINAL: $ npm start
- Press 'Open in Browser' in the pop up message
- It should open a new Tab in your Browser and present something similar to the ScreenShot above

