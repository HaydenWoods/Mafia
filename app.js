/*
  _    _  _____ ______ _____   
 | |  | |/ ____|  ____|  __ \  
 | |  | | (___ | |__  | |__) | 
 | |  | |\___ \|  __| |  _  /  
 | |__| |____) | |____| | \ \  
  \____/|_____/|______|_|  \_\ 
                               
*/

var users = [];
class User {
	constructor(id) {
		this.id = id; //Same as the socketID
		this.username = null;
		this.player = null;
	}
}

class Player {
	constructor() {
		this.role = null;
		this.alive = null;
	}
}

var rooms = [];
class Room {
	constructor(id) {
		this.id = id;
		this.users = [];
		this.admin = null;
		this.isPlaying = null;
		this.game = null;
	}
}

class Game {
	constructor() {
		this.mafia = [];
		this.detectives = [];
		this.doctors = [];
		this.civilians = [];
	}
}

/*
  ________   _______  _____  ______  _____ _____ 
 |  ____\ \ / /  __ \|  __ \|  ____|/ ____/ ____|
 | |__   \ V /| |__) | |__) | |__  | (___| (___  
 |  __|   > < |  ___/|  _  /|  __|  \___ \\___ \ 
 | |____ / . \| |    | | \ \| |____ ____) |___) |
 |______/_/ \_\_|    |_|  \_\______|_____/_____/ 
                                                 
*/

var express = require("express");
var app = express();
var serv = require("http").Server(app);

app.get("/",function(req, res){
	res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
app.use("/public", express.static(__dirname + "/public"));

serv.listen(2000, "0.0.0.0");	


/*
   _____  ____   _____ _  ________ _______ 
  / ____|/ __ \ / ____| |/ /  ____|__   __|
 | (___ | |  | | |    | ' /| |__     | |   
  \___ \| |  | | |    |  < |  __|    | |   
  ____) | |__| | |____| . \| |____   | |   
 |_____/ \____/ \_____|_|\_\______|  |_|   
                                           
*/	

var io = require("socket.io")(serv,{
	pingTimeout: 2000,
	pingInterval: 1000,
});

io.sockets.on("connection", function(socket) {
	const user = new User(socket.id);
	users.push(user);

	var room = null;

	socket.on("disconnect", function() {
		users = users.filter(obj => obj.id != users.id);
	});

	socket.on("createRoom", function(username, roomID) {
		if (room == null) {
			var err = null;

			if (username.length <= 0) {
				err = "One or more inputs empty!";
			}
			if (username.length > 16) {
				err = "16 character limit!";
			}
			if (roomID.length <= 0) {
				err = "One or more inputs empty!";
			}
			if (roomID.length > 16) {
				err = "16 character limit!";
			}
			if (rooms.find(obj => obj.id == roomID)) {
				err = "Room already exists!";
			}

			if (err == null) {

			} else {
				console.log(err);
			}
		}
	});

	socket.on("joinRoom", function() {

	});

	function leaveRoom() {

	}
	socket.on("leaveRoom", function() {
		leaveRoom();
	});


});