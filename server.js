const path = require("path");
const fastify = require("fastify")({ logger: true });
const { db, resetDatabase, importCSVData } = require("./data/sqlite.js");

// Setup static files, templating engine, and form handling
fastify.register(require("@fastify/static"), { root: path.join(__dirname, "public") });
fastify.register(require("@fastify/view"), { engine: { handlebars: require("handlebars") } });
fastify.register(require("@fastify/formbody"));

/**
 * Helper function to query the database using `db.all()`.
 */
function dbQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Home route: Retrieve and display people data.
 */
fastify.get("/", async (request, reply) => {
  try {
    const people = await dbQuery('SELECT * FROM people');
    const params = { optionNames: JSON.stringify(people) };

    return request.query.raw
      ? reply.send(params)
      : reply.view("/src/pages/index.hbs", params);
  } catch (error) {
    console.error("Error in Home Route:", error);
    return reply.code(500).send({ error: "Internal Server Error: " + error.message });
  }
});

/**
 * Page - admin route
 */
fastify.get("/admin", async (request, reply) => {
  try {
    reply.view("/src/pages/admin.hbs");
  } catch (error) {
    console.error("Error in Admin Route:", error);
    reply.code(500).send({ error: "Internal Server Error: " + error.message });
  }
});

/**
 * Start the server and initialize the database.
 */
db.serialize(() => {
  resetDatabase();
  importCSVData();
});

fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server is listening on ${address}`);
});
