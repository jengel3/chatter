requirejs(["app", "router", "modules/servers/serverlist", "modules/servers/server", 
	"modules/servers/serverlistview", "modules/channels/channelview", 
	"modules/channels/channellist", "modules/channels/channel", "jquery", "jquery.caret"], 
	function(Chatter, Router, ServerList, Server, ServerListView, ChannelView, 
		ChannelList, Channel, $, caret) {
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

		var servers = new ServerList();
		var server = new Server({title: "Freenode", host: "chat.freenode.net", port: 6667, nick: "JakeTestrator", password: "testing", real_name: "Bot Tester"})
		//var server = new Server({title: "Esper", host: "irc.esper.net", port: 6667, nick: "JakeTesting"})

		servers.add(server);
		server.save();

		var channel = new Channel({name: "#chatter", server: server.id});
		var ch = new Channel({name: "#crafatar", server: server.id});
		var channels = new ChannelList();
		channels.add(channel);
		channels.add(ch);
		channel.save();
		ch.save();

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