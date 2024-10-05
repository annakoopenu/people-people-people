const d3 = require('d3-cloud');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');

function createWordCloud() {
  db.all('SELECT name, wiki_link FROM people', (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }

    const words = rows.map(row => ({
      text: row.name,
      size: Math.random() * 50 + 20, // Random size for variation
      link: row.wiki_link
    }));

    const layout = d3.layout.cloud()
      .size([500, 500])
      .words(words)
      .padding(5)
      .rotate(() => (~~(Math.random() * 2) * 90))
      .fontSize(d => d.size)
      .on('end', draw);

    layout.start();

    function draw(words) {
      d3.select('#word-cloud-container').append('svg')
        .attr('width', 500)
        .attr('height', 500)
        .append('g')
        .attr('transform', 'translate(250,250)')
        .selectAll('text')
        .data(words)
        .enter().append('text')
        .style('font-size', d => d.size + 'px')
        .style('fill', '#000')
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${[d.x, d.y]}) rotate(${d.rotate})`)
        .text(d => d.text)
        .on('click', (d) => {
          window.open(d.link);
        });
    }
  });
}

createWordCloud();
