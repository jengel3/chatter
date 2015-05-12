requirejs(["app", "router", "modules/servers/serverlist", "modules/servers/server", "modules/servers/serverlistview"], function(Chatter, Router, ServerList, Server, ServerListView) {
	Chatter.router = new Router();

	Chatter.start();

	var servers = new ServerList();
	servers.fetch();

	var server = new Server({title: "Esper", host: "irc.esper.net", port: 6541})
	servers.add(server);
	server.save();

	Chatter.servers = servers;

	var view = new ServerListView({collection: servers});
	$('#channels').append('<ul></ul>').append(view.render().el);

	// $('#add_server').popup();
});