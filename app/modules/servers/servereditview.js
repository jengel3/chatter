define(["app", "backbone", "underscore", "modules/servers/server"], function(Chatter, Backbone, _, Server) {
	var ServerEditView = Backbone.View.extend({
		template: _.template($("#server-edit-template").html()),
		className: 'popup',
		id: 'server_popup',
		events: {
			'click .close': 'closed',
			'click .save': 'saved'
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
			var inputs = self.$el.find('input');
			for (var i = 0; i < inputs.length; i++) {
				var input = $(inputs[i]);
				var attr = input.attr('name');
				var value = input.val();
				self.model.set(attr, self.parse(attr, value));
			};
			if (self.editing) {
				self.model.save();
				Chatter.servers.fetch();
			} else {
				Chatter.servers.fetch();
				Chatter.servers.add(self.model);
				self.model.save();
			}
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
			var self = this;
			e.preventDefault();
			e.stopPropagation();
			self.cleanup();
		},

		cleanup: function() {
			var self = this;
			$('#server_popup').popup('hide');
			setTimeout(function() {
				self.remove();
			}, 1);
		}
	});
	return ServerEditView;
});