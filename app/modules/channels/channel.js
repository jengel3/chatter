define(["app", "backbone", "jquery", "moment"], function(Chatter, Backbone, $, moment) {
	var uuid = require('node-uuid');
	var Channel = Backbone.Model.extend({
		idAttribute: "uuid",
		defaults: {
			name: "",
			topic: "",
			current: false,
			server: 0,
			names: {},
			channels: []
		},
		initialize: function() {
			if (!this.uuid) {
				this.set('uuid', uuid.v4())
			}
		},
		getMessages: function() {
			return $('#content div.channel-wrap[data-channel="' + this.id + '"] .messages');
		},
		addMessage: function(message) {
			var msgs = $(this.getMessages());
			var date = moment().format('MM/DD/YYYY hh:mm');
			$(msgs).append('<div class="message"><span class="timestamp">' + date + '</span> <span class="separator">=></span> <span class="text">' + message + '</span></div>');
			$(msgs).scrollTop(($(msgs).height() * 2));
		},
		focus: function() {
			$('#content > div').hide();
			var wrap = $('#content div.channel-wrap[data-channel="' + this.id + '"]');
			Chatter.Active.channel = this;
			wrap.show()
			setTimeout(function() {
				wrap.find('.message-input').focus();
			}, 1);
		}
	});	
	return Channel;
});