/**
 * This is the main server script that provides the API endpoints
 * The script uses the database helper in /src
 * The endpoints retrieve, update, and return data to the page handlebars files
 *
 * The API returns the front-end UI handlebars pages, or
 * Raw json if the client requests it with a query parameter ?raw=json
 */

// Utilities we need
const fs = require("fs");
const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Enable detailed logging for debugging
  logger: true,
});

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// Formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// View is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

// SQLite setup using sqlite3
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db'); // Path to your SQLite database

/**
 * Home route for the app
 *
 * Return the poll options from the database helper script
 * The home route may be called on remix in which case the db needs setup
 *
 * Client can request raw data using a query parameter
 */
fastify.get("/", async (request, reply) => {
  let params = request.query.raw ? {} : { seo: seo };

  try {
    // Get the available choices from the database (fetching from 'people' table)
    const options = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM people', (err, rows) => {
        if (err) {
          console.error("Database Error:", err); // Log the error
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (options) {
      params.optionNames = options.map((choice) => choice.name); // Assuming 'name' is a column in 'people'
      params.optionCounts = options.map(() => 1); // Placeholder for count (could be replaced with actual data)
    } else {
      params.error = data.errorMessage;
    }

    // Check if data is empty or not set up
    if (options && params.optionNames.length < 1) params.setup = data.setupMessage;

    // Send the page options or raw JSON data if the client requested it
    return request.query.raw
      ? reply.send(params)
      : reply.view("/src/pages/index.hbs", params);

  } catch (error) {
    console.error("Error in Home Route:", error);  // Log the error
    return reply.code(500).send({ error: "Internal Server Error" });
  }
});

/**
 * Post route to process user vote
 *
 * Retrieve vote from body data
 * Send vote to database helper
 * Return updated list of votes
 */
fastify.post("/", async (request, reply) => {
  let params = request.query.raw ? {} : { seo: seo };

  // Flag to indicate we want to show the poll results instead of the poll form
  params.results = true;
  let options;

  try {
    // We have a vote - send it to the db helper to process and return results
    if (request.body.language) {
      options = await processVote(request.body.language);
      if (options) {
        // We send the choices and numbers in parallel arrays
        params.optionNames = options.map((choice) => choice.language); // Assuming there's a 'language' column
        params.optionCounts = options.map(() => 1); // Placeholder count
      }
    }
    params.error = options ? null : data.errorMessage;

    // Return the info to the client
    return request.query.raw
      ? reply.send(params)
      : reply.view("/src/pages/index.hbs", params);

  } catch (error) {
    console.error("Error in Post Route:", error);  // Log the error
    return reply.code(500).send({ error: "Internal Server Error" });
  }
});

/**
 * Admin endpoint returns log of votes
 *
 * Send raw json or the admin handlebars page
 */
fastify.get("/logs", async (request, reply) => {
  let params = request.query.raw ? {} : { seo: seo };

  try {
    // Get the log history from the db (assuming a 'logs' table)
    params.optionHistory = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM logs', (err, rows) => {
        if (err) {
          console.error("Database Error:", err); // Log the error
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    params.error = params.optionHistory ? null : data.errorMessage;

    // Send the log list
    return request.query.raw
      ? reply.send(params)
      : reply.view("/src/pages/admin.hbs", params);

  } catch (error) {
    console.error("Error in Logs Route:", error);  // Log the error
    return reply.code(500).send({ error: "Internal Server Error" });
  }
});

/**
 * Admin endpoint to empty all logs
 *
 * Requires authorization (see setup instructions in README)
 * If auth fails, return a 401 and the log list
 * If auth is successful, empty the history
 */
fastify.post("/reset", async (request, reply) => {
  let params = request.query.raw ? {} : { seo: seo };

  try {
    /* 
    Authenticate the user request by checking against the env key variable
    - make sure we have a key in the env and body, and that they match
    */
    if (
      !request.body.key ||
      request.body.key.length < 1 ||
      !process.env.ADMIN_KEY ||
      request.body.key !== process.env.ADMIN_KEY
    ) {
      console.error("Auth fail");

      // Auth failed, return the log data plus a failed flag
      params.failed = "You entered invalid credentials!";

      // Get the log list
      params.optionHistory = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM logs', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    } else {
      // We have a valid key and can clear the log
      params.optionHistory = await new Promise((resolve, reject) => {
        db.run('DELETE FROM logs', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      });

      // Check for errors - method would return false value
      params.error = params.optionHistory ? null : data.errorMessage;
    }

    // Send a 401 if auth failed, 200 otherwise
    const status = params.failed ? 401 : 200;
    return request.query.raw
      ? reply.status(status).send(params)
      : reply.status(status).view("/src/pages/admin.hbs", params);

  } catch (error) {
    console.error("Error in Reset Route:", error);  // Log the error
    return reply.code(500).send({ error: "Internal Server Error" });
  }
});

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);

/**
 * Helper function to process the vote
 * Updates vote count and returns the current options
 */
async function processVote(language) {
  return new Promise((resolve, reject) => {
    // Assuming there's a 'votes' table with a 'picks' column
    db.run('UPDATE votes SET picks = picks + 1 WHERE language = ?', [language], function (err) {
      if (err) {
        reject(err);
      } else {
        // Return the updated options (fetching from 'votes' table)
        db.all('SELECT * FROM votes', (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      }
    });
  });
}
