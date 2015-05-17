define(["app", "modules/channels/channellist", "modules/channels/channelview", "modules/channels/channel", "modules/servers/serverview"], function(Chatter, ChannelList, ChannelView, Channel, ServerView) {
	var irc = require('irc');
	var Connection = function(server) {
		var self = this;
		self.attrs = server.attributes;
		self.server = server;
		self.channels = [];

		self.setup();

		self.connect(function(inst) {
			console.debug("Successfully connected to " + self.server.attributes.title);
			self.join();
		})
	};

	Connection.prototype.join = function() {
		var self = this;
		var list = new ChannelList();
		list.fetch();
		var results = new ChannelList(list.where({server: self.attrs.id}));

		results.each(function(channel) {
			self.client.join(channel.get('name') + ' ', function(){
				console.log("Joining channel", channel.get('name'));
			})
		});
		Chatter.Active.server = self.server;
	};

	Connection.prototype.connect = function(callback) {
		var self = this;
		self.client.connect(function(){
			callback(self);
		});
	};

	Connection.prototype.setup = function() {
		var self = this;
		var options = {debug: true, autoConnect: false, userName: self.attrs.nick, 
			port: self.attrs.port, realName: self.attrs.real_name}
		self.client = new irc.Client(self.attrs.host, self.attrs.nick, options);
		Chatter.Store[self.server.attributes.id] = self.client;

		self.client.addListener('error', function(message) {
			console.log('error: ', message);
		});

		self.client.addListener('registered', function(message) {
			var view = new ServerView({model: self.server});
			$('#content').append(view.render().el);
		});

		self.client.addListener('raw', function (message) {
			console.log('Raw Output: ', message);
		});

		function toPriority(sym) {
			if (sym === "@") {
				return 0;
			} else if (sym === "+") {
				return 1;
			} else {
				return 2;
			}
		}

		self.client.addListener('names', function (channel, names) {
			var col = new ChannelList();
			col.fetch();
			var channel = col.findWhere({name: channel, server: self.attrs.id});

			var sorted = Object.keys(names).sort(function(a,b){return toPriority(names[a])-toPriority(names[b])});
			var users = $('#content div.channel-wrap[data-channel="' + channel.id +'"] .users ul');
			var users_new = ''
			for (var x = 0; x < sorted.length; x++) {
				var username = sorted[x];
				var rank = names[username];
				var added = '<li class="user">';
				if (rank === '@') {
					added += '<span class="operator">@</span>'
				} else if (rank === '+') {
					added += '<span class="voiced">+</span>'
				}
				added += username + '</li>'
				users_new += added;
			}
			$(users).html(users_new);
		});

		self.client.addListener('motd', function (motd) {
			var messages = $('#content div.server-wrap[data-server="' + self.server.id +'"] .messages');
			var lines = motd.split(/\n/);
			for (var x = 0; x < lines.length; x++) {
				var line = lines[x];
				$(messages).append('<div class="message">' + line + '</div>')
				$(messages).scrollTop(($(messages).height()*2));
			}
		});

		self.client.addListener('message', function (from, to, message) {
			var col = new ChannelList();
			col.fetch();
			var channel = col.findWhere({name: to, server: self.attrs.id});

			var messages = $('#content div.channel-wrap[data-channel="' + channel.id +'"] .messages');
			$(messages).append('<div class="message"><span class="author">' + from + ': </span>' + message + '</div>')
			$(messages).scrollTop(($(messages).height()*2));
		});

		self.client.addListener('join', function(ch, nick, message) {
			if (nick !== self.client.nick) return;
			console.log("Joined channel", ch)
			var col = new ChannelList();
			col.fetch();
			var channel = col.findWhere({name: ch, server: self.attrs.id});
			if (channel) {
				console.log("Already exists");
			} else {
				channel = new Channel({name: ch, server: self.attrs.id});
				col.add(channel);
				channel.save();
			}
			$('li.server[data-id='+ self.attrs.id + ']').find('ul').append('<li data-channel-id="' + channel.id + '">' + ch + '</li>');
			channel.set('topic', 'A very cool channel!');
			var chView = new ChannelView({model: channel});
			if ($('#content > div').length >= 1) {
				$('#content > div').hide();
			}
			$('#content').append(chView.render().el);
			Chatter.Active.channel = channel;
		});
	};
	return Connection;
});