const {Hidstream} = require('node-hid-stream')
const HID = require('node-hid')
var stdin = process.stdin;
const sqlite3 = require('sqlite3').verbose();
request = require('request-json');
var client = request.createClient('http://localhost/');

const spawn = require("child_process").spawn;

console.log(HID.devices())

const hidstream = new Hidstream({ vendorId: 65535, productId: 53 })

// without this, we would only get streams once enter is pressed
stdin.setRawMode( true );

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding( 'utf8' );

let swipeData = ''

const rfidReaderProcess = spawn('python',["./index-RFID.py"]);

// on any data into stdin
hidstream.on( 'data', function( key ){
  // ctrl-c ( end of text )
  console.log('swipeData');
  console.log(swipeData);

  if ( key === ';') {
    swipeData = ''
  }

  if ( key === '?' ) { //end of the swipe
    // const employeeID = swipeData.substring(0, 6);

    // console.log(employeeID + ' has swiped at ' + new Date() + '!');
    swipeData = swipeData.match(/[0-9]/g).join('');
    // console.log('hereree');
    console.log('End of swipe !!!!!!')
    console.log(swipeData)
    console.log(swipeData.length)
    console.log('!!!!!!!!!!!!!!!!!!!')
    const SwipeTimeMillisecond = new Date()

    if (swipeData.length !== 12) {
      console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
      console.log('Theres a swipe Error!');
      console.log(swipeData)
      const pythonProcess = spawn('python',["./light.py"]);

      var data = {
        swipe: {
          employee_id: '',
          datetime: SwipeTimeMillisecond
        }
      };

      client.post('swipes/', data, function(err, res, body) {
        return console.log(res.statusCode);
        swipeData = '';
      });

      console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
      swipeData = ''
    } else {
      const fs = require('fs');



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


          var data = {
            swipe: {
              employee_id: swipeData,
              datetime: SwipeTimeMillisecond
            }
          };

          console.log('DATA IS:')
          console.log(data);

          console.log('here???');
          client.post('swipes/', data, function(err, res, body) {
            return console.log(res.statusCode);
            swipeData = '';
          });


        })
      });

      // fs.appendFile('./swipes.txt', `${swipeData},${new Date()}\n`, function (err) {
      //   if (err) throw err;
      //
      //   console.log('Saved!');
      // });
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
