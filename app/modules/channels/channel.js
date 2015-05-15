define(["app", "backbone", "localstorage"], function(Chatter, Backbone, LocalStorage) {
	var Channel = Backbone.Model.extend({
		attributeId: "id",
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