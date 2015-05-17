define(["app", "backbone", "underscore"], function(Chatter, Backbone, _) {
	var ServerView = Backbone.View.extend({
		template: _.template($("#server-template").html()),
		className: 'server-wrap',
		events: {
			'keypress .message-input': 'entered'
		},
		render: function(){
			var dict = this.model.toJSON();
			var html = this.template(dict);
			this.$el.html(html);
			this.$el.attr('data-server', this.model.get('id'));
			return this;
		},
		entered: function(e) {
			// if (Chatter.Active.server && e.which === 13) {
			// 	var server = Chatter.Active.server;
			// 	var client = Chatter.Store[server.attributes.id];
			// 	var msg = $('#content .channel-wrap[data-server="' + channel.attributes.id + '"] .message-input');
			// 	var message = $(msg).val();
			// 	if (message.trim() !== "") {
			// 		client.say(channel.get('name'), message);
			// 	}
			// }
		}
	});
return ServerView;
});