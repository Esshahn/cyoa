/*

  App

*/


const express     = require ("express");
//const bodyParser  = require ("body-parser");
//const path        = require ("path");

const database = require('./database');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// Routing
app.get('/', function (req, res) {
  res.render('index');
});

app.get('/stories', function (req, res) {
  database.show_stories(res);
});

// Listen to port 3000
app.listen(3000, () => {
  console.log("\x1b[33m"+'Server started at '+Date.now("H:m:s") + ' on port 3000' + "\x1b[0m");
});



