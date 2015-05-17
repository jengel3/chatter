define(["app", "backbone", "underscore"], function(Chatter, Backbone, _) {
	var ChannelView = Backbone.View.extend({
		template: _.template($("#channel-template").html()),
		className: 'channel-wrap',
		events: {
			'keypress .message-input': 'entered'
		},
		render: function(){
			var dict = this.model.toJSON();
			var html = this.template(dict);
			this.$el.html(html);
			this.$el.attr('data-channel', this.model.get('id'));
			return this;
		},
		entered: function(e) {
			if (Chatter.Active.channel && Chatter.Active.server && e.which === 13) {
				var server = Chatter.Active.server;
				var channel = Chatter.Active.channel;
				var client = Chatter.Store[server.attributes.id];
				var msg = $('#content .channel-wrap[data-channel="' + channel.attributes.id + '"] .message-input');
				var message = $(msg).val();
				if (message.trim() !== "") {
					client.say(channel.get('name'), message);
					$(msg).val('');

					var messages = $('#content div.channel-wrap[data-channel="' + channel.id +'"] .messages');
					$(messages).append('<div class="message"><span class="author">' + Chatter.Store[server.id].nick + ': </span>' + message + '</div>');
					$(messages).scrollTop(($(messages).height()*2));
				}
			}
		}
	});
return ChannelView;
});