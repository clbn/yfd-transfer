#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

if (fs.existsSync(path.join(__dirname, 'config.js'))) {
  var config = require(path.join(__dirname, 'config.js'));
} else {
  console.error('Configuration file is missing. Copy config.js.default to config.js and customize it.');
  process.exit(1);
}

var fileName = process.argv[2];
var actions = [];
var db;

var readActionsFile = function() {
  if (!fileName) {
    console.error('Specify YFD actions log file (you can download it on http://your.flowingdata.com/actions/log/)');
  } else {
    fs.exists(fileName, function(exists) {
      if (!exists) {
        console.error('File \'' + fileName + '\' not found');
      } else {
        fs.readFile(fileName, function(err, data) {
          if (err) {
            console.error('Can\'t read actions file. Here is the details:');
            console.error(err);
            process.exit(1);
          } else {
            console.log('Actions file read.');
            parseActions(data.toString());
          }
        });
      }
    });
  }
};

var parseActions = function(data) {
  actions = data.split('\n').map(function(row) {
    return row.split('\t');
  });
  actions.shift(); // remove header row
  console.log('Actions parsed.');
  checkDatabase(actions);
};

var checkDatabase = function(actions) {
  db = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
  });

  db.connect(function(err) {
    if (err) {
      console.error('Can\'t connect to database. Here is the details:');
      console.error(err);
      process.exit(1);
    } else {
      console.log('Database connection established.');
    }
  });

  db.query(
    'CREATE TABLE IF NOT EXISTS yfd_actions (' +
      'id INT(11) unsigned NOT NULL AUTO_INCREMENT, ' +
      'action_name VARCHAR(255) DEFAULT NULL, ' +
      'action_value VARCHAR(255) DEFAULT NULL, ' +
      'action_unit VARCHAR(255) DEFAULT NULL, ' +
      'action_time VARCHAR(255) DEFAULT NULL, ' +
      'tags VARCHAR(255) DEFAULT NULL, ' +
      'PRIMARY KEY (id)) DEFAULT CHARSET=utf8',
    function(err) {
      if (err) {
        throw err;
      }
      console.log('DB table checked/created.');
      saveActions(actions);
    }
  );
};

var saveActions = function(actions) {
  actions.forEach(function(action) {
    db.query(
      'INSERT INTO yfd_actions (action_name, action_value, action_unit, action_time, tags) VALUES (?, ?, ?, ?, ?)',
      [action[0], action[1], action[2], action[3], action[4]],
      function(err) {
        if (err) {
          throw err;
        }
        console.log('Action imported.');
      }
    );
  });
  console.log('Import completed');
};

readActionsFile();
