const d3 = require('d3-cloud');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sqlite.db'); // Ensure this path matches your setup

// Fetch all people from the database
function fetchPeopleData(callback) {
  db.all('SELECT name, wiki_link FROM people', (err, rows) => {
    if (err) {
      console.error('Error fetching data:', err.message);
      return;
    }
    callback(rows);
  });
}

function createWordCloud(words) {
  const width = document.getElementById('word-cloud-container').offsetWidth;
  const height = 10;  // Adjust to desired fixed height
  
  const layout = d3.layout.cloud()
    .size([width, 600])
    .words(words.map(d => ({
      text: d.name,
      size: Math.random() * 30 + 20,
      link: d.wiki_link,
    })))
    .padding(10)
    .rotate(() => 0)
    .fontSize(d => d.size)
    .on('end', (computedWords) => draw(computedWords, width, 600));

  layout.start();
}


function draw(words, width, height) {
  const container = d3.select('#word-cloud-container');
  container.html(''); // Clear any previous content

  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr("transform", `translate(${width / 2}, 300)`);

  svg.selectAll('text')
    .data(words)
    .enter().append('text')
    .style('font-size', d => `${d.size}px`)
    .style('fill', '#000')
    .attr('text-anchor', 'middle')
    .attr('transform', d => `translate(${d.x}, ${d.y})`)
    .text(d => d.text)
    .on('click', (event, d) => {
      if (d.link) window.open(d.link, '_blank');
    });
}


// Fetch data from the database and create the word cloud
fetchPeopleData(createWordCloud);
