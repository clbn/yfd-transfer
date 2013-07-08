#!/usr/bin/env node

var fs = require('fs');
var mysql = require('mysql');
var fileName = process.argv[2];
var actions = [];
var db;

var readActionsFile = function() {
  if (!fileName) {
    console.error('Specify YFD actions log file (you can download it on http://your.flowingdata.com/actions/log/)');
  } else {
    fs.exists(fileName, function(exists) {
      if (!exists) {
        console.error('File not found');
      } else {
        fs.readFile(fileName, function(err, data) {
          if (err) {
            console.error(err);
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
  console.log('Actions file parsed.');
  importActions(actions);
};

var importActions = function(actions) {
  checkDatabase();
  saveActions(actions);
};

var checkDatabase = function() {
  db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'ToPsEcReT',
    database: 'yfd'
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
  console.log('Import completed.');
};

readActionsFile();
