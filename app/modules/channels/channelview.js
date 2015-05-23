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
					if (message.slice()[0] === '/') {
						var data = {
							receiver: channel, 
							message: message,
							nick: client.nick
						}
						Chatter.Commands.handle(client, data);
					} else {
						client.say(channel.get('name'), message);
					}
					$(msg).val('');
				}
			}
		}
	});
return ChannelView;
});