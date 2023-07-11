const { Client } = require('pg')
const client = new Client({
  user: 'nonadmin',
  host: 'ls-8ed9bf80f7fa0bbc9ef8a691ff65762675ab3c1a.c5eity8epojm.us-east-2.rds.amazonaws.com',
  database: 'dbstn',
  password: 'z,^;ojQk]YH3Hmau~bk#<2(*CGW0k[Ed',
  port: 5432,
})

client.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

// Assuming you have already connected to the database using the code you provided

// Example query to fetch data from a table
const fetchTableData = async () => {
  try {
    const query = 'SELECT * FROM api_incident'; 
    const result = await client.query(query);
    const rows = result.rows;

  } catch (error) {
    console.error('Error executing query:', error);
  }
};

fetchTableData();
