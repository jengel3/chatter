define(["app", "backbone", "localstorage", "modules/channels/channellist", "modules/channels/channelview"], function(Chatter, Backbone, LocalStorage, ChannelList, ChannelView) {
	var irc = require('irc');
	var Server = Backbone.Model.extend({
		idAttribute: "id",
		defaults: {
			host: "",
			port: "",
			title: "",
			nick: "",
			real_name: "",
			current: false,
			server_user: "",
			server_pass: "",
			connect: true
		},
		connect: function() {
			// this.client = new irc.Client(this.get('host'), this.get('nick'), {channels: ["#chatter"]});
			// Chatter.Store[this.id] = this.client;
			// console.log("Connecting to server");
			// this.client.addListener('message', function (from, to, message) {
			// 	console.log(from + ' => ' + to + ': ' + message);
			// });

			// this.client.addListener('raw', function (message) { 
			// 	console.log('raw', message);
			// })

			// this.client.addListener('error', function(message) {
			// 	console.log('error: ', message);
			// });

			var list = new ChannelList();
			list.fetch();
			var results = new ChannelList(list.where({server: this.attributes.id}));
			var that = this;
			results.each(function(channel) {
				console.log(channel.get('name'))
				$('li.server[data-id='+ that.attributes.id + ']').find('ul').append('<li data-channel-id="' + channel.id + '">' + channel.get('name') + '</li>');
				channel.set('topic', 'A very cool channel!');
				var chView = new ChannelView({model: channel});
				$('#content').append(chView.render().el);
				Chatter.Active.channel = channel;
				$('#content').find('div').last().hide();
			});
			Chatter.Active.server = this;
		}
	});	
return Server;
});