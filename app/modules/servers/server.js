define(["app", "backbone", "localstorage", "underscore", "connection"], function(Chatter, Backbone, LocalStorage, _, Connection) {
	var irc = require("irc");
	var Server = Backbone.Model.extend({
		idAttribute: "id",
		localStorage: new Backbone.LocalStorage("servers"),
		defaults: {
			host: "irc.esper.net",
			port: 6667,
			title: "Esper",
			nick: "Chatter",
			real_name: "Chatter Tester",
			server_user: "",
			server_pass: "",
			shouldConnect: true,
			channels: ["#chatter"]
		},
		connect: function() {
			this.connection = new Connection(this);
		}, 
		addChannel: function(chan) {
			var chans = this.get("channels");
			if (chans.indexOf(chan) === -1) {
				chans.push(chan);
				this.set("channels", chans);
				return chan;
			}
			return null;
		},
		removeChannel: function(chan) {
			var removed = _.without(self.channels, chan);
			self.set("channels", removed)
			return removed;
		}
	});	
	return Server;
});