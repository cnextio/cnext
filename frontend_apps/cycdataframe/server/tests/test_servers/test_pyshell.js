let {PythonShell} = require('python-shell');
let pyshell = new PythonShell('../server.py', { mode: 'text'});

console.log("Starting...");

pyshell.on('message', function (message) {
  console.log('message:', message);
});

pyshell.on('stderr', function (stderr) {
  console.log('stderr:', stderr);
});

console.log("Sending msg...");
pyshell.send('print("hello world!")\n');