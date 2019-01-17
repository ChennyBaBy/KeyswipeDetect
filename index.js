var stdin = process.stdin;
const sqlite3 = require('sqlite3').verbose();
const request = require('request');

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
  if ( key === '?' ) { //end of the swipe
    // const employeeID = swipeData.substring(0, 6);

    // console.log(employeeID + ' has swiped at ' + new Date() + '!');
    swipeData = swipeData.match(/[0-9]/g).join('');
    // console.log('hereree');
    console.log('End of swipe !!!!!!')
    console.log(swipeData)
    console.log(swipeData.length)
    console.log('!!!!!!!!!!!!!!!!!!!')


    if (swipeData.length !== 12) {
      console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
      console.log('Theres a swipe Error!');
      console.log(swipeData)

      //Post Request bad
      request.post('http://localhost/swipes', {
        successfulSwipe: false,
        request.post('', {
        badData: swipeData,
        swipeTimeMillisecond: SwipeTimeMillisecond
      })

      console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
      swipeData = ''
    } else {
      const fs = require('fs');

      const SwipeTimeMillisecond = new Date()

      let db = new sqlite3.Database('./swipe_db.db', (err) => {
        if (err) {
          return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
        console.log('swipeData inside db write');
        console.log(swipeData);

        db.run(`INSERT INTO swipes(employee_id,datetime) VALUES(?,?)`, [swipeData,SwipeTimeMillisecond], function(err) {
          db.close();
          if (err) {
            return console.log(err.message);
          }

          //Post Request Good
          request.post('http://localhost/swipes', {
            successfulSwipe: true,
            employeeID: employee_id,
            swipeTimeMillisecond: SwipeTimeMillisecond
          })
        })
      });

      fs.appendFile('./swipes.txt', `${swipeData},${new Date()}\n`, function (err) {
        if (err) throw err;
        swipeData = '';
        console.log('Saved!');
      });
      // process.exit();
    }

  }

  if ( key === '|' ) {
    console.log('killed manually!');
    process.exit();
  }
  // write the key to stdout all normal like
  // console.log('key being pressed:');
  // process.stdout.write( key );
  if (key !== '?') {
    swipeData = swipeData + key;
  }

});
