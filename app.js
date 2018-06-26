/*

  App

*/


const express     = require ("express");
//const bodyParser  = require ("body-parser");
//const path        = require ("path");
const mysql      = require('mysql');

// Create DB connection
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'cyoa'
});

db.connect( (err) => {
    if (err) throw err;
    console.log("connected to database.");
});

const app = express();


// Routing
app.get('/', function (req, res) {
  get_random_title(res);
});

// Listen to port 3000
app.listen(3000, () => {
  console.log("\x1b[33m"+'Server started at '+Date.now("H:m:s") + ' on port 3000' + "\x1b[0m");
});

function get_random_title(res)
{
  var random_story = Math.floor(Math.random()*4)+1;

  

  db.query('SELECT * from story where id = '+random_story, function (error, results, fields)
  {
    if (error) throw error;
    console.log("\x1b[33m" + results[0].title + "\x1b[0m");
    res.send(results[0].title);
  });

}

