define(["app", "backbone", "underscore", "jquery"], function(Chatter, Backbone, _, $) {
	"use strict";
	var ChannelView = Backbone.View.extend({
		template: _.template($("#channel-template").html()),
		className: "channel-wrap",
		events: {
			"keypress .message-input": "entered"
		},
		initialize: function() {
			this.model.on('change:names', this.setupTabComplete, this);
			this.setup = false;
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
		},

		setupTabComplete: function() {
			var names = Object.keys(this.model.get('names'));
			if (this.setup) {
				this.$el.find('input').tabComplete('reset', this.model.get('names'));
			} else {
				this.$el.find('input').tabComplete({
					getOptions: function() {
						return names;
					},
					getFormat: function(word, position) {
						if (position === 0) {
							return word + ": ";
						} else {
							return word;
						}
					},
					preventTabbing: true
				});
				this.setup = true;
			}
		}
	});
return ChannelView;
});