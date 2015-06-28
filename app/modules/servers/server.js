define(["app", "backbone", "localstorage", "underscore", "connection"], function(Chatter, Backbone, LocalStorage, _, Connection) {
	"use strict";
	var Server = Backbone.Model.extend({
		idAttribute: "id",
		modelName: "Server",
		localStorage: new Backbone.LocalStorage("servers"),
		defaults: {
			host: "irc.esper.net",
			port: 6667,
			title: "Esper",
			nick: "Chatter",
			realName: "Chatter Tester",
			serverUser: "",
			serverPass: "",
			shouldConnect: true,
			channels: ["#chatter"],
			onConnect: [],
			secure: false,
			selfSigned: false,
			certExpired: false

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
			var removed = _.without(this.channels, chan);
			this.set("channels", removed);
			return removed;
		}
	});
	return Server;
});