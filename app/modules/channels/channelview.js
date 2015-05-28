define(["app", "backbone", "underscore", "jquery"], function(Chatter, Backbone, _, $) {
	"use strict";
	var ChannelView = Backbone.View.extend({
		template: _.template($("#channel-template").html()),
		className: "channel-wrap",
		events: {
			"keypress .message-input": "entered"
		},
		render: function(){
			var dict = this.model.toJSON();
			var html = this.template(dict);
			this.$el.html(html);
			this.$el.attr("data-channel", this.model.id);
			if (this.model.get('pm')) {
				this.$el.addClass('pm');
			}
			return this;
		},
		entered: function(e) {
			if (Chatter.Active.channel && Chatter.Active.server && e.which === 13) {
				var server = Chatter.Active.server;
				var channel = Chatter.Active.channel;
				var message = $("#content .channel-wrap[data-channel=\"" + channel.id + "\"] .message-input");
				var msg = message.val();
				Chatter.vent.trigger('sendingMessage:' + server.id, channel, msg);
				message.val("");
			}
		}	
	});
	return ChannelView;
});