var http=require('http');
var md5=require('md5');

httpServer=http.createServer(function(req,res){ //Création du serveur http
	console.log("Vous avez demarer le serveur");
	//res.end("Wesh wesh yo")
});
httpServer.listen(1337);

var io=require('socket.io').listen(httpServer);
var usersConnected = {}; //objet qui contiendra la liste de tous les utilisateurs connectés
var messagesPosted = []; //tableau qui contiendra les messages postés
var history = 30; //historiques des messages à garder en mémoire

io.sockets.on('connection', function(socket){
	console.log('Nouveau utilisateur');
	var me;
	
	/**
	 * À l'arrivée d'une personne sur la page
	 */
	for (var user in usersConnected) // indique tous les utilisateurs connectés
	{
		socket.emit("newusr", usersConnected[user]);
	}
		for (var msg in messagesPosted) // indique tous messages postés
	{
		socket.emit("newmsg", messagesPosted[msg]);
	}
		/**
	 * L'utilisateur s'identifie
	 */
	socket.on('login',function(user){
		me=user;
		me.id=user.mail.replace('@', '_').replace('.','_');
		me.avatar='https://gravatar.com/avatar/'+md5(user.mail)+'?s=40';
		usersConnected[me.id] = me; //ajoute l'utilisateur dans la liste des utilisateurs connectés
		//me.nb_users=usersConnected.length;
		socket.emit('logged',me);
		io.sockets.emit('newusr',me);
	});
		/**
	 * quand l'utilisateur se deconnecte
	 */
	 socket.on('disconnect', function() {
		if (!me) return false; //si l'utilisateur n'est pas loggué pas besoin de passer à la suite
		io.sockets.emit("disconnectUser", me);
		delete usersConnected[me.id];
	});
	
	//reception des putains de messages
	socket.on('newmsg',function(message){
		
		if (!me) { //si l'utilisateur n'est pas identifié, il ne peut pas envoyer de message
			socket.emit("errMsgNoLog");
			return;
		}	
		message.user=me;
		date=new Date();
		message.h=date.getHours();
		message.m=date.getMinutes();
	
			//stocke le message dans le tableau de message postés
		messagesPosted.push(message);
			//vérifie la longueur de l'historique des messages, history=30 messages
		if (messagesPosted.length > history) {
			messagesPosted.shift(); //supprime le plus ancien message stocké
		}
		io.sockets.emit('newmsg',message);
		
	})
});

