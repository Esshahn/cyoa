/*

  App

*/


const express     = require ("express");
const path        = require ("path");
const bodyParser = require ("body-parser");
const database    = require('./database');
const app         = express();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '/public')));

app.use('/stylesheet.css', function(req, res){
    res.sendFile(path.resolve(__dirname, './css/stylesheet.css')); // put your app.css's relative path
})

// Routing
app.get('/', (req, res) => { database.index(res); });
app.get('/stories', (req, res) => { database.stories(res); });
app.get('/story/:story_id', (req, res) => { database.story(req,res); });
app.get('/story/:story_id/:room_id', (req, res) => { database.room(req,res); });
app.get('/story/:story_id/:room_id/0/edit', (req, res) => { database.room_edit(req,res); });
app.get('/story/:story_id/:room_id/:answer_id/new', (req, res) => { database.room_create(req,res); });

app.post('/insertroom',urlencodedParser, (req, res) => { database.room_insert(req,res); });
app.post('/updateroom',urlencodedParser, (req, res) => { database.room_update(req,res); });

// Listen to port 3000
app.listen(3000, () => {
  console.log("\x1b[33m"+'Server started at '+Date.now("H:m:s") + ' on port 3000' + "\x1b[0m");
});



