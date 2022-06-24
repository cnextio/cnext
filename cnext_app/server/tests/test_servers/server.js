/*
* Communicate with python server
*/
let {PythonShell} = require('python-shell');
let pyshell = new PythonShell('server.py', { mode: 'json'});

// processing outputs from python server
pyshell.on('message', function (message) {
    console.log('stdout:', message);
});

pyshell.on('stderr', function (message) {
    console.log('stderr:', message);
});

pyshell.on('error', function (message) {
    console.log('error ', message);
})

pyshell.on('close', function (message) {
    console.log('close ', message);
})

/*********************************************************************/

pyshell.send({command: "print('Hello')"});
// pyshell.send({command: "failed command"});
// pyshell.send({command: "print('Hello')"});