define(["app", "modules/channels/channellist", "modules/channels/channelview", "modules/channels/channel"], function(Chatter, ChannelList, ChannelView, Channel) {
	var irc = require('irc');
	var Connection = function(server) {
		var self = this;
		self.attrs = server.attributes;
		self.server = server;
		self.channels = [];

		self.setup();

		self.connect(function(inst) {
			console.log("Successfully connected..?")
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

		self.client.addListener('raw', function (message) {
			console.log(message);
		})

		self.client.addListener('message', function (from, to, message) {
			console.log(from + ' => ' + to + ': ' + message);
		});

		self.client.addListener('join', function(ch, nick, message) {
			if (nick !== self.client.nick) return;
			console.log("Joined channel", ch)
			var col = new ChannelList();
			col.fetch();
			var channel = col.findWhere({name: ch});
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
			$('#content').append(chView.render().el);
			Chatter.Active.channel = channel;
			$('#content div.channel-wrap').hide();
		});
	};
	return Connection;
});