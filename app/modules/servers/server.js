define(["app", "backbone", "localstorage", "underscore", "connection"], function(Chatter, Backbone, LocalStorage, _, Connection) {
	var irc = require('irc');
	var Server = Backbone.Model.extend({
		idAttribute: "id",
		localStorage: new Backbone.LocalStorage("servers"),
		defaults: {
			host: "",
			port: "",
			title: "",
			nick: "",
			real_name: "",
			server_user: "",
			server_pass: "",
			shouldConnect: true,
			channels: []
		},
		connect: function() {
			this.connection = new Connection(this);
		}, 
		addChannel: function(chan) {
			var chans = this.get('channels');
			if (chans.indexOf(chan) === -1) {
				chans.push(chan);
				this.set('channels', chans);
				return chan;
			}
			return null;
		},
		removeChannel: function(chan) {
			var removed = _.without(self.channels, chan);
			self.set('channels', removed)
			return removed;
		}
	});	
	return Server;
});