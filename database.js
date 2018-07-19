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

var system = {};

// establish connection
db.connect( (err) => {
    if (err) throw err;
    console.log("connected to database.");
});


// displays the index website with some general information
exports.index = (res) =>
{
  db.query('SELECT COUNT(id) AS stories from stories', function (error, result)
  {
    let stories = result[0];
    db.query('SELECT COUNT(id) AS rooms from rooms', function (error, result)
    {
      let rooms = result[0];
      system.title = "Choose Your Own Adventure!";
      res.render('index',{system:system,stories:stories,rooms:rooms});

      console.log(" ");
      console.log("-----------------------------------");
      console.log("- index page displayed            -");
      console.log("-----------------------------------");
      console.log(" ");
    });
  });  
}



// shows an overview with all stories in the DB
exports.stories = (res) =>
{

  let sql = `
    SELECT DISTINCT stories.*, languages.language, genres.genre,
    (SELECT COUNT(*) FROM rooms WHERE rooms.story_id = stories.id) AS rooms 
    FROM stories
    JOIN languages ON languages.id = stories.language_id
    JOIN genres ON genres.id = stories.genre_id
    JOIN rooms on stories.id = rooms.story_id 
    ORDER BY rooms DESC
  `;


  db.query(sql, function (error, result)
  {
    if (error) throw error;
    system.title = "All adventures";
    res.render('stories',{system:system,stories:result});
  });
}


// display the summary of a story
exports.story = (req,res) =>
{
  let sql = `
    SELECT stories.*, languages.language, genres.genre from stories 
    JOIN languages ON languages.id = stories.language_id
    JOIN genres ON genres.id = stories.genre_id
    WHERE stories.id=${req.params.story_id}
  `;

  db.query(sql, function (error, result)
    {

      let story = result[0];
      // get the lowest room ID for a given story (must be the first room then)
      
      system.title = "Adventure Summary";
      res.render('story',{system:system,story:story});
    }); 
}


exports.story_create = (req,res) =>
{
  let sql = `
  SELECT *
  FROM languages`;

  db.query(sql, function (error, result)
  {

    let languages = result;
    let sql = `
    SELECT *
    FROM genres`;

     db.query(sql, function (error, result)
     {
      let genres = result;
      system.title = "Create a new adventure";
      res.render('story_create',{system:system,genres:genres,languages:languages});
    });
  });    
}

exports.story_insert = (req,res) =>
{

  let sql = `
  INSERT INTO stories (title, language_id,genre_id,access)
  VALUES ('${mysql_real_escape_string(req.body.title)}',${req.body.language},${req.body.genre},${req.body.access})`;

  db.query(sql, function (error, result)
    {
      sql = "SELECT LAST_INSERT_ID();";
      db.query(sql, function (error, result)
      {
        let story_id = result[0]['LAST_INSERT_ID()'];
        sql = `INSERT INTO rooms (story_id, depth) VALUES (${story_id},1)`;
        db.query(sql, function (error, result)
        {
          sql = "SELECT LAST_INSERT_ID();";
          db.query(sql, function (error, result)
          {
            let room_id = result[0]['LAST_INSERT_ID()'];
            sql = `INSERT INTO answers (story_id, room_id, position) VALUES (${story_id},${room_id},1)`;
            db.query(sql, function (error, result)
            {
              sql = `INSERT INTO answers (story_id, room_id, position) VALUES (${story_id},${room_id},2)`;
              db.query(sql, function (error, result)
              {
                sql = `UPDATE stories SET first_room = ${room_id} WHERE id = ${story_id}`;
                console.log(sql);
                db.query(sql, function (error, result)
                {
                  res.redirect('story/'+story_id+'/'+room_id+'/0/edit');
                });
              });
            });
          });
        });
      });
    });  
}


// display a room
exports.room = (req,res) =>
{

  let sql = `
  SELECT rooms.*, stories.title
  FROM rooms JOIN stories 
  ON rooms.story_id = stories.id
  WHERE rooms.id=${req.params.room_id}`;

  db.query(sql, function (error, result)
  {
    let room = result[0];
    room.description = room.description.replace(/(?:\r\n|\r|\n)/g, '<br>'); // replace line breaks with <br> for html output
    console.log(room.description);
    db.query(`SELECT * from answers WHERE room_id=${req.params.room_id}`, function (error, result)
    {
      let answer = result;
      system.title = "Room "+room.depth+ " | "+room.title;
      res.render('room',{system:system,room:room,answers:answer});
    });     
  }); 
}


exports.room_create = (req,res) =>
{
  db.query('SELECT depth from rooms WHERE id='+req.params.room_id, function (error, result)
    {
      req.params.depth = result[0].depth +1;
      system.title = "Now it's your turn!";
      res.render('room_create',{system:system,data:req.params});
    });
}


exports.room_edit = (req,res) =>
{

  let sql = `
  SELECT rooms.*, stories.title
  FROM rooms JOIN stories 
  ON rooms.story_id = stories.id
  WHERE rooms.id=${req.params.room_id}`;

  db.query(sql, function (error, result)
  {
    let room = result[0];
    db.query(`SELECT * from answers WHERE room_id=${req.params.room_id}`, function (error, result)
    {
      let answer = result;
      system.title = "Edit room";
      res.render('room_edit',{system:system,room:room,answers:answer});
    });     
  }); 

}


exports.room_update = (req,res) =>
{
  console.log(req.body);

  let id, sql, answer;

  for (const key of Object.keys(req.body)) 
  {
    if (key.startsWith("answer_"))
    {
      id = key.replace("answer_","");
      answer = mysql_real_escape_string(req.body[key]);
      sql = `UPDATE answers SET answer = '${answer}' WHERE id = ${id}`;
      db.query(sql, function (error, result)
      {
        
      });

    }
  }

  let description = mysql_real_escape_string(req.body.description);

  sql = `UPDATE rooms SET description = '${description}' WHERE id = ${req.body.room_id}`;
  console.log("\n\x1b[33m" + sql + "\x1b[0m");
  db.query(sql, function (error, result)
  {
    res.redirect('/story/'+req.body.story_id+'/'+req.body.room_id);
  });


}


exports.room_insert = (req,res) =>
{

  var sql = "INSERT INTO rooms (story_id, description, depth) VALUES ('"+req.body.story_id+"','"+mysql_real_escape_string(req.body.description)+"','"+req.body.depth+"')";
  db.query(sql, function (error, result)
    { 
      var sql = "SELECT LAST_INSERT_ID();";
      db.query(sql, function (error, result)
      {
        var new_room_id = result[0]['LAST_INSERT_ID()'];
        var sql = "UPDATE answers SET next_room = "+new_room_id+" WHERE id = "+req.body.answer_id;
        db.query(sql, function (error, result)
          {
            var sql = "INSERT INTO answers (story_id, room_id, answer, position) VALUES ('"+req.body.story_id+"','"+new_room_id+"','"+mysql_real_escape_string(req.body.answer1)+"',1)";
            db.query(sql, function (error, result)
              {
               var sql = "INSERT INTO answers (story_id, room_id, answer, position) VALUES ('"+req.body.story_id+"','"+new_room_id+"','"+mysql_real_escape_string(req.body.answer2)+"',2)";
                db.query(sql, function (error, result)
                {
                  res.redirect('/story/'+req.body.story_id+'/'+new_room_id);
                });
              });
          });
      });
    });
}



function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                  // and double/single quotes
        }
    });
}

    