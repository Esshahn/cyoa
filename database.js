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

exports.show_stories = function(res)
{
  db.query('SELECT * from story ORDER by rating DESC', function (error, results, fields)
  {
    if (error) throw error;
    res.render('stories',{stories:results});
  });  
}

exports.show_story = function(req,res)
{

  if (req.params.room_id != 0)
  {

    db.query('SELECT * from room WHERE id='+req.params.room_id, function (error, results, fields)
    {
      db.query('SELECT * from answer WHERE room_id='+req.params.room_id, function (error, results_2, fields)
      {
        res.render('story',{room:results[0],answers:results_2});
      });     
    }); 

  } else {

    db.query('SELECT * from story WHERE id='+req.params.story_id, function (error, results, fields)
    {
      res.render('story_summary',{story:results[0]});
    }); 

  }
 
  

}