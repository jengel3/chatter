requirejs(["app", "router", "modules/servers/serverlist", "modules/servers/server", 
	"modules/servers/serverlistview", "modules/channels/channelview", 
	"modules/channels/channellist", "modules/channels/channel", "command", "jquery", "jquery-popup-overlay",
	"modules/servers/servereditview"], 
	function(Chatter, Router, ServerList, Server, ServerListView, ChannelView, 
		ChannelList, Channel, Command, $, popup, ServerEditView) {
		var gui = require("nw.gui");
		Chatter.router = new Router();

		Chatter.start();
		var win = gui.Window.get();
		Chatter.Clients = {};
		Chatter.Connections = {};
		Chatter.Views = {};
		Chatter.Active = {server: null, channel: null};

		document.addEventListener("keydown", function(event){
			if( event.keyCode == 123 ) { gui.Window.get().showDevTools(); }
			if( event.keyCode == 116 ) { Chatter.reload(); }
			if( event.keyCode == 122 ) { 
				if (Chatter.display === "fullscreen") {
					Chatter.display = "normal";
					win.leaveFullscreen();
				} else {
					Chatter.display = "fullscreen";
					win.enterFullscreen();
				}
			}
			if( event.keyCode == 121 && !$("#server_popup").length) { 
				var view = new ServerEditView({model: Chatter.Active.server});
				var el = $("body").append(view.render().el);
				$("#server_popup").popup({
					detach: false,
					onclose: function() {
						view.cleanup();
					}
				});
				$("#server_popup").popup("show");
			}
		});

		Chatter.display = "normal";

		var tray = new gui.Tray({ title: 'Chatter', icon: './dist/images/chatter.png' });
		$('.close').click(function(e) {
			Chatter.display = "closed";
			win.close();
		});

		$('.minimize').click(function(e) {
			Chatter.display = "minimized";
			win.hide();
		});

		$('.maximize').click(function(e) {
			if (Chatter.display === "maximized") {
				Chatter.display = "normal";
				win.unmaximize();
			} else {
				Chatter.display = "maximized";
				win.maximize();
			}
		});

		tray.on('click', function() {
			if (Chatter.display === "minimized") {
				Chatter.display = "normal";
				win.show();
			} else {
				Chatter.display = "minimized";
				win.hide();
			}
		});

		tray.tooltip = "Chatter";

		//https://github.com/nwjs/nw.js/issues/1955
		if (process.platform === "darwin") {
			var mb = new gui.Menu({type: 'menubar'});
			mb.createMacBuiltin('Chatter');
			win.menu = mb;
		}

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
			client.part(channel, message);
		});

		Chatter.Commands.add("nick", function(client, data, args) {
			if (args.length === 1) {
				var nick = args[0];
				client.send('nick', nick);
			}
		});

		Chatter.Commands.add("reload", function(client, data, args) {
			Chatter.reload();
		});

		Chatter.Commands.add("dev", function(client, data, args) {
			win.showDevTools();
		});

		Chatter.Commands.add("topic", function(client, data, args) {
			if (args.length === 0 || !Chatter.Active.channel) return;
			var topic = args.join(' ');
			client.send('topic', Chatter.Active.channel.get('name'), topic);
		});

		Chatter.Commands.add("me", function(client, data, args) {
			if (args.length === 0 || !Chatter.Active.channel) return;
			var action = args.join(' ');
			client.action(Chatter.Active.channel.get('name'), action);
		});

		Chatter.Commands.add("msg", function(client, data, args) {
			if (args.length <= 1 || !Chatter.Active.channel) return;
			var target = args[0];
			var message = args.slice(1).join(' ');
			client.say(target, message);
		});

		win.on('new-win-policy', function (frame, url, policy) {
			policy.ignore();
		});

		var servers = new ServerList();
		Chatter.servers = servers;
		Chatter.servers.fetch();
		
		if (Chatter.servers.length === 0) {
			var server = new Server({host: 'chat.freenode.net', port: 6667, title: "Freenode", nick: "JakeTestrator", real_name: "Jake", channels: ['#programming', '#linux', '#chatter']})
			server.save();
			Chatter.servers.add(server);
			Chatter.servers.fetch();
		}

		var view = new ServerListView({collection: Chatter.servers});
		Chatter.Views.servers = view;
		$('#channels > ul').html(view.render().el);

		Chatter.servers.each(function(server) {
			if (server.get('shouldConnect')) {
				server.connect();
			}
		});

		$('.add-server').click(function(e) {
			var view = new ServerEditView({model: null});
			var el = $("body").append(view.render().el);
			$("#server_popup").popup({
				detach: false,
				onclose: function() {
					view.cleanup();
				}
			});
			$("#server_popup").popup("show");
		});


		Chatter.disconnect = function(close, callback) {
			var keys = Object.keys(Chatter.Clients);
			// check keys length, callback if no servers
			if (keys.length > 0) {
				keys.forEach(function (key) { 
					var client = Chatter.Clients[key];
					client.disconnect("Refreshing environment!", function() {
						console.debug("Disconnected a client.")
						if (key === keys[keys.length - 1]) {
							done();
						}
					});
				}); 
			} else {
				done()
			}
			function done() {
				if (callback) callback();
				if (close) win.close(true);
			}
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