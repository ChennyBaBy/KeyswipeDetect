var stdin = process.stdin;
const sqlite3 = require('sqlite3').verbose();

// without this, we would only get streams once enter is pressed
stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding( 'utf8' );

let swipeData = ''

// on any data into stdin
stdin.on( 'data', function( key ){
  // ctrl-c ( end of text )
  console.log('swipeData');
  console.log(swipeData);
  if ( key === '?' ) {
    // const employeeID = swipeData.substring(0, 6);

    // console.log(employeeID + ' has swiped at ' + new Date() + '!');

    const fs = require('fs');

    let db = new sqlite3.Database('./swipe_db.db', (err) => {
      if (err) {
        return console.error(err.message);
      }

      console.log('Connected to the in-memory SQlite database.');

      db.run(`INSERT INTO swipes(employee_id,datetime) VALUES(?,?)`, [swipeData,new Date()], function(err) {
        db.close();
        if (err) {
          return console.log(err.message);
        }
      })
    });

    fs.appendFile('./swipes.txt', `${swipeData},${new Date()}\n`, function (err) {
      if (err) throw err;
      swipeData = '';
      console.log('Saved!');
    });
    // process.exit();
  }

  if ( key === '|' ) {
    console.log('killed manually!');
    process.exit();
  }
  // write the key to stdout all normal like
  // console.log('key being pressed:');
  // process.stdout.write( key );
  swipeData = swipeData + key;
});
