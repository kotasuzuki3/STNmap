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
