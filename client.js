const d3 = require('d3-cloud');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');

// Fetch all people from the database
function fetchPeopleData(callback) {
  db.all('SELECT name, wiki_link FROM people', (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      return;
    }
    callback(rows); // Pass the data to the word cloud function
  });
}

function createWordCloud(words) {
  const width = document.getElementById('word-cloud-container').offsetWidth;
  const height = words.length * 60;  // Set height dynamically based on the number of words

  // Create the cloud layout
  const layout = d3.layout.cloud()
    .size([width, height])
    .words(words.map(d => ({
      text: d.name,
      size: Math.random() * 30 + 20, // Adjust size to fit more words
      link: d.wiki_link,
    })))
    .padding(10) // Increase padding to prevent overlap
    .rotate(() => 0) // Keep all words horizontal
    .fontSize(d => d.size)
    .on('end', draw);

  layout.start(); // Start the layout process
}

function draw(words) {
  const container = d3.select('#word-cloud-container');
  container.html(''); // Clear any previous content

  const svg = container.append('svg')
    .attr('width', container.node().offsetWidth)
    .attr('height', words.length * 60) // Adjust SVG height dynamically
    .append('g')
    .attr('transform', `translate(${container.node().offsetWidth / 2}, 300)`); // Center the cloud

  svg.selectAll('text')
    .data(words)
    .enter().append('text')
    .style('font-size', d => `${d.size}px`)
    .style('fill', '#000')
    .attr('text-anchor', 'middle')
    .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
    .text(d => d.text)
    .on('click', (event, d) => {
      if (d.link) window.open(d.link, '_blank'); // Open the wiki link in a new tab
    });
}

// Fetch data from the database and create the word cloud
fetchPeopleData(createWordCloud);
