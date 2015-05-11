define(["app", "backbone", "modules/channels/channel", "localstorage"], function(Chatter, Backbone, LocalStorage) {
	var ChannelList = Backbone.Collection.extend({
		model: Channel,
	});
});