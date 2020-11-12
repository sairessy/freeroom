$(document).ready(() => {

	$('.aside #bar').click(()=> {
		$('.aside').hide();
	});

	$('.main #bar').click(()=> {
		$('.aside').show();
	});

	let roomId = 0;

	let idColor = '#2bccb1';

	let socket = io.connect('localhost:3000');
	
	socket.emit('join', {roomId});
	
	socket.on('numusers', (data) => {
		$('h2').text(`${data.numUsers} users online`);
	});

	socket.on('pubs', async (data)=> {
		let ft = await fetch('../data.json');
		let res = await ft.json();
		
		let pub = Math.round(Math.random()*(res.all.length-1));

		$('.msg').append(`
			<p><strong style='color: #ec407a'>Did you know?:</strong> ${res.all[pub].text}</p>
		`);
		
		$('.msg').animate({scrollTop: $('.msg').scrollTop()+300});
	});

	socket.on('join', (data) => {
		if(roomId == data.roomId) {
			if(socket.id == data.id) {
				$('.msg').append(`
					<p>You(<strong style='color: coral'>${data.id}</strong>) joined the room</p>
				`);
			} else {
				$('.msg').append(`
					<p><strong style='color: coral'>${data.id} </strong> joined the room</p>
				`);
			}
		}
	});
	
	$('.aside li').click((e)=> {
		roomId = e.target.id;

		let roomName = $(`.aside li:nth-child(${roomId})  strong`).text();

		$('.group-title h1').text(roomName);

		$('.msg').html('');
		if(window.innerWidth <= 414) {
			$('.aside').hide();
		}

		socket.emit('join', {roomId});
	});

	$('.txt form').submit((e)=> {
	    e.preventDefault();
	    let txt = $(".txt input[type='text']").val();

	    $(".txt input[type='text']").val('');

	    socket.emit('sendmsg', {txt, roomId});
	});

	socket.on('sendmsg', (data) => {
		if(roomId == data.roomId) {
			if(socket.id == data.id) {
				idColor = '#2bccb1';
			} else {
				idColor = '#666';
			}

			$('.msg').append(`
				<p><strong style='color: ${idColor}'>${data.id}: </strong>${data.txt}<i></i></p>
			`);
		}

		$('.msg').animate({scrollTop: $('.msg').scrollTop()+300});
	});
});

