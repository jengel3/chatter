define(["app", "backbone", "underscore", "jquery"], function(Chatter, Backbone, _, $) {
	"use strict";
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
			if (Chatter.Active.server && e.which === 13) {
				var server = Chatter.Active.server;
				var message = $("#content .server-wrap[data-server=\"" + server.id + "\"] .message-input");
				var msg = message.val();
				Chatter.vent.trigger('sendingMessage:' + server.id, server, msg);
				message.val("");
			}
		}
	});
return ServerView;
});