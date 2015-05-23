requirejs(["app", "router", "modules/servers/serverlist", "modules/servers/server", 
	"modules/servers/serverlistview", "modules/channels/channelview", 
	"modules/channels/channellist", "modules/channels/channel", "command"], 
	function(Chatter, Router, ServerList, Server, ServerListView, ChannelView, 
		ChannelList, Channel, Command) {
		var gui = require('nw.gui');
		Chatter.router = new Router();

		Chatter.start();
		var win = gui.Window.get();
		window.Chatter.Store = {};
		window.Chatter.Active = {server: null, channel: null};

		document.addEventListener('keydown', function(event){
			if( event.keyCode == 123 ) { gui.Window.get().showDevTools(); }
			if( event.keyCode == 116 ) { Chatter.reload(); }
		});

		$('.server').click(function(e) {
			var list = $(e.target).parent().find('ul');
			if ($(list).is(':visible')) {
				$(list).slideUp();
			} else {
				$(list).slideDown();
			}
		});
		$('.close').click(function(e) {
			gui.Window.get().close();
		});

		Chatter.Commands = Command;
		Chatter.Commands.add = Command.add;

		Chatter.Commands.add("join", function(client, data, args) {
			client.join(args.join(' ') + ' ');
		});

		Chatter.Commands.add("part", function(client, data, args) {
			var channel = null;
			var message = null;
			if (args.length == 1) {
				channel = args[0];
			} else {
				channel = Chatter.Active.channel.get('name');
			}
			if (args.length > 1) {
				message = args.slice(1).join(' ');
			}
			client.part(channel, message, function() {
				console.log("Left channel");
			});
		});

		Chatter.Commands.add("nick", function(client, data, args) {
			if (args.length === 1) {
				var nick = args[0];
				client.send('nick', nick);
			}
		});

		win.on('new-win-policy', function (frame, url, policy) {
			policy.ignore();
		});

		var servers = new ServerList();
		servers.fetch();
		
		var view = new ServerListView({collection: servers});
		$('#channels ul').append(view.render().el);

		servers.each(function(server) {
			console.log("Attempting connect")
			if (server.get('shouldConnect')) {
				server.connect();
			}
		});

		Chatter.disconnect = function(close, callback) {
			var keys = Object.keys(Chatter.Store);
			keys.forEach(function (key) { 
				var client = Chatter.Store[key];
				client.disconnect("Refreshing environment!", function() {
					if (key === keys[keys.length - 1]) {
						console.log("Disconnected a client.")
						if (callback) callback();
						if (close) win.close(true);
					}
				});
			});
		}

		Chatter.reload = function() {
			Chatter.disconnect(false, function() {
				location.reload();
			});
		}

		win.on('close', function() {
			Chatter.disconnect(true);
		});

	});