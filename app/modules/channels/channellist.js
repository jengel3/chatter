define(["app", "backbone", "modules/channels/channel", "localstorage"], function(Chatter, Backbone, Channel, LocalStorage) {
	var ChannelList = Backbone.Collection.extend({
		model: Channel
	});
	return ChannelList;
});