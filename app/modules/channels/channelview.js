define(["app", "backbone", "underscore", "jquery"], function(Chatter, Backbone, _, $) {
	"use strict";
	var ChannelView = Backbone.View.extend({
		template: _.template($("#channel-template").html()),
		className: "channel-wrap",
		events: {
			"keydown .message-input": "entered"
		},
		initialize: function() {
			this.model.on('change:names', this.setupTabComplete, this);
			this.initialized = false;
			this.index = 0;
		},

		render: function() {
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
			if (Chatter.Active.channel && Chatter.Active.server) {
				var server = Chatter.Active.server;
				var channel = Chatter.Active.channel;
				var $msg = $("#content .channel-wrap[data-channel=\"" + channel.id + "\"] .message-input");
				if (e.which === 13) {
					console.log("SENDING")
					var message = $msg.val();
					Chatter.vent.trigger('sendingMessage:' + server.id, channel, message);
					$msg.val("");
					channel.get('messages').push(message);
					this.index = 0;
				} else if (e.which === 38) {
					console.log('up')
					//up
					if (this.index < channel.get('messages').length) {
						this.index += 1;
					}
					console.log(this.index, channel.get('messages').length);
					$msg.val(channel.get('messages')[channel.get('messages').length - this.index]);
				} else if (e.which === 40) {
					console.log('down')
					if (this.index > 0) {
						this.index -= 1;
					}
					console.log(this.index, channel.get('messages').length);
					$msg.val(channel.get('messages')[channel.get('messages').length - this.index]);
				} else {
					this.index = 0;
				}
			}
		},

		setupTabComplete: function() {
			var names = Object.keys(this.model.get('names'));
			if (this.initialized) {
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
				this.initialized = true;
			}
		}
	});
	return ChannelView;
});