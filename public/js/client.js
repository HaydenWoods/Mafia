function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toggleScreen(screenName) {
	$("#container").show();
	$(".screen").each(function(i) {
		$(this).hide();
	});
	$("#" + screenName).show();
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
    socket.on("success", function(type, username = null) {
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
		    	$("#menu-container h2").text("Online Card Game");
		    	break;
		    case "startRoom":
		    	toggleScreen("game");
		    	break;
		}
   	});

   	socket.on("connectedPlayers", function(players, adminID) {
   		//Empty list
   		$("#players").empty();

   		//Player list
    	for (var i = 0; i < players.length; i++) {
   			var inner = players[i].username;
    		if (players[i].id == adminID) {
    			inner = "<i class='fas fa-crown icon'></i>" + inner;
    		}
    		$("#players").append("<li class='playerItem'>" + inner + "</li>");
    	}
    	$("#players").append('<div class="clearfix"></div>')

    	//Player count
    	$("#player-count").text("Players: " + players.length);
   	});	

   	socket.on("setupRoom", function(roomID, adminID) {
    	$("#menu-container h2").text("Online Card Game - " + roomID);

       	if (socket.id == adminID) {
			$("#button-start").show();    	
    	} else {
    		$("#button-start").hide()
    	}
    });
});