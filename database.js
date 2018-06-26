/*

  Database

*/


const mysql      = require('mysql');

// Create DB connection
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'cyoa'
});

// establish connection
db.connect( (err) => {
    if (err) throw err;
    console.log("connected to database.");
});


exports.get_random_title = function(res)
{
  var random_story = Math.floor(Math.random()*4)+1;

  db.query('SELECT * from story where id = '+random_story, function (error, results, fields)
  {
    if (error) throw error;
    console.log("\x1b[33m" + results[0].title + "\x1b[0m");
    res.send(results[0].title);
  });
}

exports.show_stories = function(res)
{
  db.query('SELECT * from story ORDER by rating DESC', function (error, results, fields)
  {
    if (error) throw error;
    res.render('stories',{stories:results});
  });  
}