define(["app", "backbone"], function(Chatter, Backbone) {
	var Channel = Backbone.Model.extend({
		attributeId: "name",
		defaults: {
			name: "",
			topic: "",
			users: "",
			current: false,
			server: 0
		}
	});	
	return Channel;
});