requirejs(["app", "router", "modules/servers/serverlist", "modules/servers/server", "modules/servers/serverlistview", "modules/channels/channelview", "modules/channels/channellist", "modules/channels/channel"], 
	function(Chatter, Router, ServerList, Server, ServerListView, ChannelView, ChannelList, Channel) {
		var gui = require('nw.gui');
		Chatter.router = new Router();

		Chatter.start();

		window.Chatter.Store = {};
		window.Chatter.Active = {server: null, channel: null};

		document.addEventListener('keydown', function(event){
			if( event.keyCode == 123 ) { gui.Window.get().showDevTools(); }
			if( event.keyCode == 116 ) { location.reload(); }
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
		var server = new Server({title: "Freenode", host: "chat.freenode.net", port: 6667, nick: "ChatterTest"})
		servers.add(server);
		server.save();

		var channel = new Channel({name: "#chatterr", server: server.id});
		var ch = new Channel({name: "#chatterrr", server: server.id});
		var channels = new ChannelList();
		channels.add(channel);
		channels.add(ch);
		channel.save();
		ch.save();

		var view = new ServerListView({collection: servers});
		$('#channels ul').append(view.render().el);

		servers.each(function(server) {
			console.log("Attempting connect")
			if (server.get('connect')) {
				server.connect();
			}
		});
	});