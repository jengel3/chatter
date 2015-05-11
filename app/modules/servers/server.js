define(["app", "backbone", "localstorage"], function(Chatter, Backbone, LocalStorage) {
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
			server_pass: ""
		}
	});	
	return Server;
});