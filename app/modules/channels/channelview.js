define(["app", "backbone", "underscore"], function(Chatter, Backbone, _) {
	var ChannelView = Backbone.View.extend({
		template: _.template($("#channel-template").html()),
		events: {
			'.message keypress': 'entered'
		},
		render: function(){
			var dict = this.model.toJSON();
			var html = this.template(dict);
			this.$el.html(html);
			return this;
		},
		entered: function(e) {
			console.log(typed);
			if (Chatter.Active.channel && Chatter.Active.server) {
				var server = Chatter.Active.server;
				var channel = Chatter.active.channel;
				var client = Chatter.Store[server.id];
				var message = $('.message').val();
				if (message.trim() !== "") {
					client.say(channel, message);
					$('.empty').clear();
				}
			}
		}
	});
	return ChannelView;
});