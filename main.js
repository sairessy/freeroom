const express = require('express');

const app = express();

const socket = require('socket.io');

const fetch = require('node-fetch');

const Meeting = require('./app/Meeting');

const meeting = new Meeting();


// Create server in port 3000
const port = process.env.PORT || 3000;

let server = app.listen(port);

// Host html, css, js
app.use(express.static('public'));
app.use(express.json());



let io = socket(server); 

let numUsers = 0;
let participants = [];

// Routes
app.post('/savemeeting', (req, res)=> {
	meeting.add(req, res);
});

app.get('/getmeetings', (req, res)=> {
	meeting.get(req, res);
});

app.post('/updatelikes', (req, res)=> {
	meeting.updateLikes(req, res);
});

// Check if meeting time passed to delete
meeting.checkStatus();



// Socket io
io.sockets.on('connection', (socket)=> {
	
	numUsers++;

	io.sockets.emit('numusers', {numUsers});

	let id = socket.id;

	socket.on('join', (data) => {
		participants.push({
			id: socket.id,
			name: ' '+data.name
		});

		io.sockets.emit('join', {
			id,
			roomId: data.roomId,
			name: data.name,
			participants
		});
	});

	socket.on('sendmsg', (data) => {
		
		let msg = {
			txt: data.txt,
			id,
			roomId: data.roomId,
			name: data.name
		}

		io.sockets.emit('sendmsg', msg);
	});

	socket.on('disconnect', (d) => {
		numUsers--;
		for (let i = 0; i<participants.length; i++) {
			const element = participants[i];
			if(element.id == socket.id  && id != undefined) {
				participants.splice(i, 1);
			}	
		}

		io.sockets.emit('numusers', {numUsers});
		
	});
});

// Show curiosities about cats

getCatsCuriosity = async ()=> {
	const ft = await fetch('http://localhost:3000/data.json');
	const res = await ft.json();
	const r = Math.round(Math.random()*res.all.length);
	io.sockets.emit('curiosity', {text: res.all[r].text});
}