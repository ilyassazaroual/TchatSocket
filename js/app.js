(function($){
	var socket = io.connect('http://localhost:1337');
	var msgtpl=$('#msgtpl').html();
	$('#msgtpl').remove();
	
	//connexion par id et mail
	$('#loginform').submit(function(event){
		event.preventDefault();
		socket.emit('login',{
			username :$('#username').val(),
			mail     :$('#mail').val()
		})
	});
	//un nouveau utilisateur saisis son id et email on ajoute son avatar à  la liste des connectés .
	socket.on('newusr', function(user){ //quand il est connecté on affiche ça 
		$("#users").append("<img src='" + user.avatar + "' id='" + user.id + "' alt='" + user.username + "' title='" + user.username + "' >&nbsp;");
	});
		//l'utilisateur s'est connecté
	socket.on('logged',function(user){
	//$("#nb_users").before("<div id ='nb_users'><p>Bienvenue, utilisateurs connectés" + me.nb_users + " !</div>");

	$('#connexion').fadeOut("slow");
	$('#message').focus();	
	});
	
	//l'utilisateur s'est déconnecté
	socket.on("disconnectUser", function(user) {
		console.log("Un utilisateur a quitté le chat : " + user.id + ($("#" + user.id)));
		//retire son image
		$("#" + user.id).remove();
	});
	
	
	//Envois des messages :)
	$('#form').submit(function(event){
		event.preventDefault();
		socket.emit('newmsg',{message:$('#message').val()});
		$('#message').val('');
		$('#message').focus(); //on remet le curseur sur le champs pour envoyer un autre message
	});
	
	//reception des messaggs
	socket.on('newmsg',function(message){
		// Mustache.render(msgtpl, message);//injecte le message dans le template
		$('#messages').append('<div class="message">' + Mustache.render(msgtpl, message) + '</div>');
		$('#messages').animate({scrollTop: $('#messages').prop('scrollHeight')},500);
	});
		 // l'utilisateur reçoit le message d'erreur parce qu'il a essayé d'envoyer un message sans être identifié
	 
	socket.on("errMsgNoLog", function() {
		alert("Il faut s'identifier pour pouvoir envoyer un message ! ");
	});

})(jQuery);