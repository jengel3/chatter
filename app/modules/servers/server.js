define(["app", "backbone", "localstorage", "modules/channels/channellist", "modules/channels/channelview", "connection"], function(Chatter, Backbone, LocalStorage, ChannelList, ChannelView, Connection) {
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
			shouldConnect: true
		},
		connect: function() {
			this.connection = new Connection(this);
		}
	});	
return Server;
});