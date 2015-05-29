define(["app", "backbone", "underscore", "jquery", "modules/settings"], function(Chatter, Backbone, _, $, Settings) {
	"use strict";
	var SettingsEditview = Backbone.View.extend({
		template: _.template($("#settings-template").html()),
		className: "popup",
		id: "settings_popup",

		events: {
			"click .close": "closed",
			"click .save": 'saved',
			"click .tab": "tabbed"
		},

		initialize: function() {
			this.model = Chatter.Settings;
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
				var value;
				if (input.attr('type') === "checkbox") {
					value = input.prop('checked');
				} else {
					value = input.val();
				}
				var attr = input.attr("name");
				self.model.set(attr, self.parse(attr, value));
			}
			self.model.save();
			Chatter.Settings.fetch();
			$("#settings_popup").popup("hide");
		},

		parse: function(attr, value) {
			return value;
		},

		closed: function(e) {
			e.preventDefault();
			e.stopPropagation();
			$("#settings_popup").popup("hide");
		},

		tabbed: function(e) {
			var text = $(e.currentTarget).text();
			var sel = $('#settings-' + text.toLowerCase());
			$('.tab').removeClass('active');
			$(e.currentTarget).addClass('active');

			$('.sub-input').removeClass('active');
			$(sel).addClass('active');
		},

		cleanup: function() {
			var self = this;
			setTimeout(function() {
				self.remove();
			}, 1);
		}
	});
return SettingsEditview;
});