define(["app", "backbone", "localstorage"], function(Chatter, Backbone, LocalStorage) {
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
			console.log(this.get('host'), this.get('nick'))
			this.client = new irc.Client(this.get('host'), this.get('nick'), {channels: ["#chatter"]});
			Chatter.Store[this.id] = this.client;
			console.log("Connecting to server");
			this.client.addListener('message', function (from, to, message) {
				console.log(from + ' => ' + to + ': ' + message);
			});

			this.client.addListener('raw', function (message) { 
				console.log( message);
			})

			this.client.addListener('error', function(message) {
				console.log('error: ', message);
			});
		}
	});	
	return Server;
});