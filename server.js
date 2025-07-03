const express = require('express');
const cors = require('cors');
const { Client } = require('pg');
const app = express();
const port = 3001;

//Enable CORS
app.use(cors());

const client = new Client({
    user: 'dbstn',
    host: 'stn-kota.cqlkymqmgfch.us-east-1.rds.amazonaws.com',
    database: 'postgres',
    password: '9.rV{)(We:9>q0oCRV~WfP7(i2a$sDp<',
    port: 5432,
    ssl: { rejectUnauthorized: false },
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
        inc.latitude,
        inc.longitude,
        inc.incident_date::TEXT      AS incident_date,
        inc.city,
        inc.state,
        v.first_name,
        v.last_name,
        v.age,
        v.gender,
        v.bio_info,
        m.url
      FROM public.incident_victims iv
      JOIN public.victims v
        ON iv.victim_id = v.victim_id
      JOIN public.incidents inc
        ON iv.incident_id = inc.incident_id
      JOIN public.media_references m
        ON iv.media_id = m.media_id
      ORDER BY inc.incident_date ASC, v.victim_id;
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