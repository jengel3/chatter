define(["app", "backbone", "modules/servers/server", "localstorage"], function(Chatter, Backbone, Server, LocalStorage) {
	var ServerList = Backbone.Collection.extend({
		model: Server,
		localStorage: new Backbone.LocalStorage("servers")
	});
	return ServerList;
});