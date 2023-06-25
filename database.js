const {Client} = require('pg')
const client = new Client({
    host: "ls-8ed9bf80f7fa0bbc9ef8a691ff65762675ab3c1a.c5eity8epojm.us-east-2.rds.amazonaws.com",
    user: "nonadmin",
    port: 5432,
    password: "z,^;ojQk]YH3Hmau~bk#<2(*CGW0k[Ed",
    database: "stn-staging"
})

client.connect()
/* client.query(`Select * from user`, (err, res) => {
    if (!err){
        console.log(res.rows);
    } else {
        console.log(err.message);
    }
    client.end;
}) */
