const express = require('express');

let app = express();

// Create server in port 3000
const port = process.env.PORT || 3000;

let server = app.listen(port);

// Host html, css, js
app.use(express.static('public'));

let socket = require('socket.io');

let io = socket(server); 

let numUsers = 0;


io.sockets.on('connection', (socket)=> {
	
	numUsers++;

	io.sockets.emit('numusers', {numUsers});

	let id = socket.id;

	socket.on('join', (data) => {
		io.sockets.emit('join', {
			id,
			roomId: data.roomId
		});
	});

	socket.on('sendmsg', (data) => {
		
		let msg = {
			txt: data.txt,
			id,
			roomId: data.roomId
		}

		io.sockets.emit('sendmsg', msg);
	});

	socket.on('disconnect', (d) => {
		numUsers--;
		io.sockets.emit('numusers', {numUsers});
	});
});

// Show pubs
setInterval(()=> {
	io.sockets.emit('pubs', {pub: 'Gatos dormem 70% de suas vidas.'});
}, 15000);