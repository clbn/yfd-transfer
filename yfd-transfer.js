var fs = require('fs');

var fileName = './events.txt';

fs.exists(fileName, function(exists) {
  if (!exists) {
    return console.error('File not found');
  }
  fs.readFile(fileName, function(err, eventList) {
    if (err) {
      return console.error(err);
    }
    eventList = eventList.toString();
    console.log(eventList);
  });
});
