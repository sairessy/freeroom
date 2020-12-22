$(document).ready(() => {

	$('.aside #bar').click(()=> {
		$('.aside').hide();
	});

	$('.main #bar').click(()=> {
		$('.aside').show();
	});

	$('.aside ul').mousemove(()=> {
		$('.aside ul').css({'overflow-y': 'scroll'});
	});

	$('.aside ul').mouseout(()=> {
		$('.aside ul').css({'overflow-y': 'hidden'});
	});

	let roomId = 0;

	// const name = 'Marcus';

	let idColor = '#2bccb1';

	let socket = io.connect('localhost:3000');
	
	socket.on('numusers', (data) => {
		$('h2').text(`${data.numUsers} users online`);
	});

	socket.on('curiosity', (data)=> {
		$('.msg').append(`
			<p><strong style='color: #ec407a'>Did you know?:</strong> ${data.text}</p>
		`);
		
		$('.msg').animate({scrollTop: $('.msg').scrollTop()+300});
	});

	socket.on('join', (data) => {
		let p = [];
		
		// for(let i=0; i<data.participants.length; i++) {
		// 	p.push(data.participants[i].name);
		// }

		// $('.msg').append(`
		// 	<p>Participantes:<strong style='color: #2bccb1'>${p}</strong></p>
		// `);

		if(roomId == data.roomId) {
			if(socket.id == data.id) {
				$('.msg').append(`
					<p>Você(<strong style='color: #2bccb1'>${data.name}</strong>) entrou nesta sala!</p>
				`);
			} else {
				$('.msg').append(`
					<p><strong style='color: coral'>${data.name} </strong> entrou nesta sala!</p>
				`);
			}
		}

		$('.msg').animate({scrollTop: $('.msg').scrollTop()+300});
	});
	
	$('.aside li').click((e)=> {
		roomId = e.target.id;

		// const name = prompt('Seu nome ou nickname!');

		let roomName = $(`.aside li:nth-child(${roomId})  strong`).text();

		$('.group-title h1').text(roomName);

		$('.msg').html('');
		if(window.innerWidth <= 414) {
			$('.aside').hide();
		}

		socket.emit('join', {roomId, name});
	});

	$('.txt form').submit((e)=> {
	    e.preventDefault();
	    let txt = $(".txt input[type='text']").val();

	    $(".txt input[type='text']").val('');

	    socket.emit('sendmsg', {txt, roomId, name});
	});

	socket.on('sendmsg', (data) => {
		if(roomId == data.roomId) {
			if(socket.id == data.id) {
				idColor = '#2bccb1';
			} else {
				idColor = 'coral';
			}

			$('.msg').append(`
				<p><i class="fa fa-caret-left"></i><strong style='color: ${idColor}'>${data.name}: </strong>${data.txt}<i></i></p>
			`);
		}

		$('.msg').animate({scrollTop: $('.msg').scrollTop()+300});
	});

	const name = prompt('Seu nome ou nickname!');
	// const name = 'Logan'

	socket.emit('join', {roomId, name});


	// Form add meeting
	$('#form-add-meeting').submit((e)=> {
		e.preventDefault();
		const title = $('#title').val();
		const date = $('#date').val();
		const time = $('#time').val();
		const room = $('#select-room :selected').text();

		const data = {title, date, time, room};

		saveMeeting(data);
	});

	async function saveMeeting(data) {
		
		const ft = await fetch('/savemeeting', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
	
			body: JSON.stringify(data)
		});
	
		const res = await ft.json();
		
		if(res.success) {
			alert('Tema agendado com successo!');
			getMeeting();
		}
	}

	getMeeting();

	async function getMeeting() {
		
		let ft = await fetch('/getmeetings', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
	
		let res = await ft.json();

		$('.meeting ul').html('');

		for (let i = 0; i < res.length; i++) {
			const meeting = res[i];
			const id = meeting._id;
			$('.meeting ul').append(`
				<li>
					<span><i class="far fa-circle"></i>${meeting.title} - ${meeting.date}, ${meeting.time} - ${meeting.room}</span>
					<span>
						<span id="likes">${meeting.likes}</span>
						<span class="like" id="${id}"><i id="${id}" class="far fa-hand-peace"></i></span>
					</span>
				</li>
			`);

		}

		reloadLikeEvt();
	}



	function reloadLikeEvt() {
		$('.meeting .like').click((e)=> {
			const id = e.target.id;
			updateLikes({id});
		});
	}

	async function updateLikes(data) {
		let ft = await fetch('/updatelikes', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		
		getMeeting();
	}



	
	$('.meeting #close').click(()=> {
		$('.meeting ul, .meeting form').toggle();
	});
	
});

