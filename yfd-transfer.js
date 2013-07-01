#!/usr/bin/env node

var fs = require('fs');

var fileName = process.argv[2];
var actions = [];

var readActionsLog = function() {
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
            console.log(data.toString());
          }
        });
      }
    });
  }
};

readActionsLog();
