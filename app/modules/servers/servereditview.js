define(["app", "backbone", "underscore", "jquery", "modules/servers/server"], function(Chatter, Backbone, _, $, Server) {
	"use strict";
	var ServerEditView = Backbone.View.extend({
		template: _.template($("#server-edit-template").html()),
		className: "popup",
		id: "server_popup",
		events: {
			"click .close": "closed",
			"click .save": 'saved',
			"click .delete": "destroy"
		},

		initialize: function() {
			this.editing = true;
			if (!this.model) {
				this.editing = false;
				this.model = new Server();
			}
		},

		render: function(){
			var dict = this.model.toJSON();
			var html = this.template(dict);
			this.$el.html(html);
			return this;
		},

		saved: function(e) {
			var self = this;
			e.preventDefault();
			e.stopPropagation();
			var inputs = self.$el.find("input");
			for (var i = 0; i < inputs.length; i++) {
				var input = $(inputs[i]);
				var attr = input.attr("name");
				var value = input.val();
				self.model.set(attr, self.parse(attr, value));
			}
			if (self.editing) {
				self.model.save();
				Chatter.servers.fetch();
			} else {
				Chatter.servers.fetch();
				Chatter.servers.add(self.model);
				self.model.save();
				var view = Chatter.Views.servers;
				$("#channels > ul").html(view.render().el);
				view.delegateEvents();
				if (self.model.get("shouldConnect")) {
					self.model.connect();
				}
			}
			$("#server_popup").popup("hide");
		},

		destroy: function (e) {
			var self = this;
			e.preventDefault();
			e.stopPropagation();
			var connection = Chatter.Connections[this.model.id];
			var server = self.model;
			Chatter.vent.trigger('client:disconnect', connection);
			if (connection.connected) {
				for (var i = 0; i < connection.views.length; i++) {
					var view = connection.views[i];
					view.remove();
				}
				connection.client.disconnect("Disconnected from server", function() {
					delete Chatter.Connections[self.model.id];
					delete Chatter.Clients[self.model.id];
					server.destroy();
					Chatter.servers.fetch();
					var view = Chatter.Views.servers;
					$("#channels > ul").html(view.render().el);
					view.delegateEvents();
					if (Chatter.servers.length > 0) {
						var focusable = Chatter.servers.first();
						Chatter.Active.server = focusable;
						var connection = Chatter.Connections[focusable.id];
						var channel = connection.channels.first();
						if (channel) {
							Chatter.Active.channel = channel;
							channel.focus();
						}
					} else {
						Chatter.Active.server = null;
						Chatter.Active.channel = null;
					}
				});
			}
			$("#server_popup").popup("hide");
			self.cleanup();
		},

		parse: function(attr, value) {
			if (attr === "channels") {
				if (typeof value === "string") {
					return value.split(',');
				}
			}
			return value;
		},

		closed: function(e) {
			e.preventDefault();
			e.stopPropagation();
			$("#server_popup").popup("hide");
		},

		cleanup: function() {
			var self = this;
			setTimeout(function() {
				self.remove();
			}, 1);
		}
	});
return ServerEditView;
});