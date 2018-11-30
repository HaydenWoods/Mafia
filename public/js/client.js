function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toggleScreen(screenName) {
	$("#container").show();
	$(".screen").each(function(i) {
		$(this).hide();
	});
	$("#" + screenName).show();

	if (screenName == "game") {
		$("#menu-container").hide();
	} else {
		$("#menu-container").show();
	}
}

$(document).ready(function() {
	const socket = io();	

	toggleScreen("menu");

	$("#input-username").focus();
	$("#input-username").select();

	//Room editing buttons
	$("#button-create").click(function(event) {
		var username = $("#input-username").val();
		var room = $("#input-room").val();
		socket.emit("createRoom", username, room);

		event.preventDefault();
	});	
	$("#button-join").click(function(event) {
		var username = $("#input-username").val();
		var room = $("#input-room").val();
		socket.emit("joinRoom", username, room);

		event.preventDefault();
	});	
	$("#button-leave").click(function(event) {
		socket.emit("leaveRoom");

		event.preventDefault();
	});
	$("#button-start").click(function(event) {
		socket.emit("startRoom");

		event.preventDefault();
	});

	$("#info-title").click(function(event) {
		$("#info-list").slideToggle(150);
		$("#info-title .drop-down").toggleClass("opp");
	});
	$("#player-title").click(function(event) {
		$("#game-players").slideToggle(150);
		$("#player-title .drop-down").toggleClass("opp");
	});
	$("#action-title").click(function(event) {
		$("#action-list").slideToggle(150);
		$("#action-title .drop-down").toggleClass("opp");
	});

/*
   _____  ____   _____ _  ________ _______ 
  / ____|/ __ \ / ____| |/ /  ____|__   __|
 | (___ | |  | | |    | ' /| |__     | |   
  \___ \| |  | | |    |  < |  __|    | |   
  ____) | |__| | |____| . \| |____   | |   
 |_____/ \____/ \_____|_|\_\______|  |_|   
                                           
*/	

	//When there is an error on joining/creating/leaving
    socket.on("err", function(err) {
    	$("#error").text(err);
    });

    //When there is success on joining/creating/leaving
    socket.on("success", function(type) {
    	$("#error").text("");
    	switch(type) {
		    case "createRoom":
		    	toggleScreen("room");
		        break;
		    case "joinRoom":
		        toggleScreen("room");
		        break;
		    case "leaveRoom":
		    	toggleScreen("menu");
		    	$("#menu-container #subtitle").text("Online Card Game");
		    	break;
		    case "startRoom":
		    	toggleScreen("game");
		    	break;
		}
   	});

   	socket.on("lobbyPlayers", function(players, adminID) {
   		//Empty list
   		$("#lobby-players").empty();

   		//Player list
    	for (var i = 0; i < players.length; i++) {
   			var inner = players[i].username;
    		if (players[i].id == adminID) {
    			inner = "<i class='fas fa-crown icon'></i>" + inner;
    		}
    		$("#lobby-players").append("<li class='playerItem'>" + inner + "</li>");
    	}
    	$("#lobby-players").append('<div class="clearfix"></div>');

    	//Player count
    	$("#player-count").text("Players: " + players.length);
   	});	

   	socket.on("setupRoom", function(roomID, adminID) {
       	if (socket.id == adminID) {
			$("#button-start").show();    	
    	} else {
    		$("#button-start").hide()
    	}
    });

    socket.on("setupGameInfo", function(room) {
    	$("#game-list").empty();

    	var display = {
    		name: room.id,
    		time: room.game.time,
    	};

    	for (var key in display) {
    		$("#game-list").append('<li class="game-item"><p class="key">' + key + ': </p><p class="value">' + display[key] + '</p></li>');
		}
    });

    socket.on("setupUserInfo", function(user) {
    	//Empty list
    	$("#info-list").empty();

    	var display = {
    		username: user.username,
    		role: user.player.role.id,
    		alive: user.player.alive
    	}

    	for (var key in display) {
    		$("#info-list").append('<li class="info-item"><p class="key">' + key + ': </p><p class="value">' + display[key] + '</p></li>');
		}
    });	

    socket.on("gamePlayers", function(players) {
    	//Empty list
    	$("#game-players").empty();

    	console.log(players);

    	for (var i = 0; i < players.length; i++) {	
    		var inner = players[i].username;
    		var innerClass = "playerItem";

    		if (players[i].alive == false) {
    			innerClass = innerClass + " dead";
    		}

    		$("#game-players").append("<li class='" + innerClass + "'>" + inner + "</li>");
    	}
    	$("#game-players").append('<div class="clearfix"></div>');
    });
});