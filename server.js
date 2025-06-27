const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const app = express();
const port = 3001;

//Enable CORS
app.use(cors());

const client = new Client({
    user: 'nonadmin',
    host: 'ls-b3c1f38072eb17a256df64fea4838614d8f83a8a.c5eity8epojm.us-east-2.rds.amazonaws.com',
    database: 'dbstn',
    password: '9.rV{)(We:9>q0oCRV~WfP7(i2a$sDp<',
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
      WITH chosen_incident AS (
        SELECT DISTINCT ON (address_line_one, incident_date)
          id,
          address_line_one,
          latitude,
          longitude,
          incident_date,
          city,
          state,
          import_index
        FROM api_incident
        ORDER BY address_line_one,
                 incident_date,
                 import_index DESC
      )
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
          WHEN v.gender_id IN (2,3,4) THEN 'Male'
          WHEN v.gender_id = 5 THEN 'Unknown'
          ELSE 'N/A'
        END AS gender,
        v.bio_info,
        m.url
      FROM chosen_incident i
        INNER JOIN api_incident_victim iv
          ON i.id = iv.incident_id
        INNER JOIN api_victim v
          ON iv.victim_id = v.id
        LEFT JOIN (
          SELECT DISTINCT ON (victim_id) victim_id, mediareference_id
          FROM api_victim_media_reference
          ORDER BY victim_id, mediareference_id DESC
        ) vmr
          ON v.id = vmr.victim_id
        LEFT JOIN api_mediareference m
          ON vmr.mediareference_id = m.id
      ;
      
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