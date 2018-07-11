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


// displays the index website with some general information
exports.index = function(res)
{
  db.query('SELECT COUNT(id) AS stories from story', function (error, stories, fields)
  {
    db.query('SELECT COUNT(id) AS rooms from room', function (error, rooms, fields)
    {
      res.render('index',{stories:stories[0],rooms:rooms[0]});

      console.log(" ");
      console.log("-----------------------------------");
      console.log("- index page displayed            -");
      console.log("-----------------------------------");
      console.log(" ");
    });
  });  
}



// shows an overview with all stories in the DB
exports.stories = function(res)
{
  db.query('SELECT * from story ORDER by rating DESC', function (error, results, fields)
  {
    if (error) throw error;
    res.render('stories',{stories:results});
  });  
}


// display the summary of a story
exports.story = function(req,res)
{
  db.query('SELECT * from story WHERE id='+req.params.story_id, function (error, results, fields)
    {
      res.render('story_summary',{story:results[0]});
    }); 
}



// display a room
exports.room = function(req,res)
{
  db.query('SELECT * from room WHERE id='+req.params.room_id, function (error, results, fields)
  {
    db.query('SELECT * from answer WHERE room_id='+req.params.room_id, function (error, results_2, fields)
    {
      db.query('SELECT title from story WHERE id='+req.params.story_id, function (error, title, fields)
      {
        res.render('story',{room:results[0],answers:results_2,title:title[0]});

      });
    });     
  }); 
}


exports.room_create = function(req,res)
{

  db.query('SELECT depth from room WHERE id='+req.params.room_id, function (error, depth, fields)
    {
      req.params.depth = depth[0].depth +1;
      res.render('room_create',{data:req.params});
    });

}


exports.room_insert = function (req,res)
{
  console.log(req.body);

  var sql = "INSERT INTO room (story_id, description, depth) VALUES ('"+req.body.story_id+"','"+req.body.description+"','"+req.body.depth+"')";
  db.query(sql, function (error, result, fields)
    { 
      var sql = "SELECT LAST_INSERT_ID();";
      db.query(sql, function (error, result, fields)
      {
        var new_room_id = result[0]['LAST_INSERT_ID()'];
        var sql = "UPDATE answer SET next_room = "+new_room_id+" WHERE id = "+req.body.answer_id;
        db.query(sql, function (error, result, fields)
          {
            var sql = "INSERT INTO answer (story_id, room_id, answer, position) VALUES ('"+req.body.story_id+"','"+new_room_id+"','"+req.body.answer1+"',1)";
            db.query(sql, function (error, result, fields)
              {
               var sql = "INSERT INTO answer (story_id, room_id, answer, position) VALUES ('"+req.body.story_id+"','"+new_room_id+"','"+req.body.answer2+"',2)";
                db.query(sql, function (error, result, fields)
                {
                  res.redirect('/story/'+req.body.story_id+'/'+new_room_id);
                });
              });
          });
      });
    });
}



    