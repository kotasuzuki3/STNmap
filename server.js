const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const app = express();
const port = 3001;

//Enable CORS
app.use(cors());

const client = new Client({
    user: 'nonadmin',
    host: 'ls-8ed9bf80f7fa0bbc9ef8a691ff65762675ab3c1a.c5eity8epojm.us-east-2.rds.amazonaws.com',
    database: 'dbstn',
    password: 'z,^;ojQk]YH3Hmau~bk#<2(*CGW0k[Ed',
    port: 5432,
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('Error connecting to PostgreSQL database', err);
  });

  app.get('/api/data', async (req, res) => {
    try {
      const query = `
  SELECT
    i.latitude,
    i.longitude,
    i.incident_date,
    i.city,
    i.state,
    v.first_name,
    v.last_name,
    v.age,
    CASE
      WHEN v.gender_id = 0 THEN 'Female'
      WHEN v.gender_id = 1 THEN 'Transgender'
      WHEN v.gender_id IN (2, 3, 4) THEN 'Male'
      WHEN v.gender_id = 5 THEN 'Unknown'
      ELSE 'N/A'
    END AS gender,
    v.bio_info
  FROM api_incident i
  INNER JOIN api_incident_victim iv ON i.id = iv.incident_id
  INNER JOIN api_victim v ON iv.victim_id = v.id;
`;
  
      const result = await client.query(query);
      const rows = result.rows;
      res.json(rows);
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});