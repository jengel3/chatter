define(["app", "backbone", "modules/servers/server"], function(Chatter, Backbone, Server) {
	var ServerList = Backbone.Collection.extend({
		model: Server,
		localStorage: new Backbone.LocalStorage("servers")
	});
	return ServerList;
});