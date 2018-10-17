function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
		room = leaveRoom(user, room);

		//Remove users from users array	
		users = users.filter(obj => obj.id != users.id);
	});


/*
   _____ _____  ______       _______ ______ 
  / ____|  __ \|  ____|   /\|__   __|  ____|
 | |    | |__) | |__     /  \  | |  | |__   
 | |    |  _  /|  __|   / /\ \ | |  |  __|  
 | |____| | \ \| |____ / ____ \| |  | |____ 
  \_____|_|  \_\______/_/    \_\_|  |______|
                                            
*/

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
				var newRoom = new Room(roomID);
				socket.join(newRoom.id);

				user.username = username;

				newRoom.users.push(user);
				newRoom.admin = user;

				rooms.push(newRoom);

				room = rooms.find(obj => obj.id == roomID);

				socket.emit("success", "createRoom", username);
				io.to(room.id).emit("setupRoom", room.id, room.admin.id);
				io.to(room.id).emit("connectedPlayers", room.users, room.admin.id);
			} else {
				socket.emit("err", err);
			}
		}
	});


/*
	   _  ____ _____ _   _ 
      | |/ __ \_   _| \ | |
      | | |  | || | |  \| |
  _   | | |  | || | | . ` |
 | |__| | |__| || |_| |\  |
  \____/ \____/_____|_| \_|
                           
*/

	socket.on("joinRoom", function(username, roomID) {
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

			var tempRoom = rooms.find(obj => obj.id == roomID)

			if (tempRoom == null) {
				err = "Room doesnt exist!";
			} else {
				if (tempRoom.isPlaying == true) {
					err = "Room is already playing!";
				}
				if (tempRoom.users.find(obj => obj.username == username)) {
					err = "Username already exists within room!";
				}
			}

			if (err == null) {
				room = tempRoom;
				socket.join(room.id);

				user.username = username;
				room.users.push(user);

				socket.emit("success", "joinRoom", username);
				io.to(room.id).emit("setupRoom", room.id, room.admin.id);
				io.to(room.id).emit("connectedPlayers", room.users, room.admin.id);

			} else {
				socket.emit("err", err);
			}
		}
	});


/*
  _      ______     __      ________ 
 | |    |  ____|   /\ \    / /  ____|
 | |    | |__     /  \ \  / /| |__   
 | |    |  __|   / /\ \ \/ / |  __|  
 | |____| |____ / ____ \  /  | |____ 
 |______|______/_/    \_\/   |______|
                                     
*/

	function leaveRoom(user, room) {
		if (room != null) {
			socket.leave(room.id);
			user.player = null;

			room.users = room.users.filter(obj => obj.id != user.id);

			//Reassign the admin if the one who left was the admin
			if (user.id == room.admin.id) {
				room.admin = room.users[getRandomInt(0, room.users.length-1)];
			}

			//If room is empty...
			if (room.users.length <= 0) {
				//Destroy room
				rooms = rooms.filter(obj => obj.id != room.id);
			}

			//Succesfull
			socket.emit("success", "leaveRoom");

			//If the room still has users
			if (room.users.length > 0) {
				console.log("sending");
				console.log(room);
				io.to(room.id).emit("setupRoom", room.id, room.admin.id);
				io.to(room.id).emit("connectedPlayers", room.users, room.admin.id);
			}

			return null;
		}	
	}
	socket.on("leaveRoom", function() {
		room = leaveRoom(user, room);
	});


/*
   _____ _______       _____ _______ 
  / ____|__   __|/\   |  __ \__   __|
 | (___    | |  /  \  | |__) | | |   
  \___ \   | | / /\ \ |  _  /  | |   
  ____) |  | |/ ____ \| | \ \  | |   
 |_____/   |_/_/    \_\_|  \_\ |_|   
                                     
*/

	socket.on("startRoom", function() {
		if (room != null) {
			if (user.id == room.admin.id) {
				room.isPlaying = true;
				room.game = new Game();


			}
		}
	});
});