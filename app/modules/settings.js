define(["app", "backbone", "localstorage"], function(Chatter, Backbone, LocalStorage) {
	"use strict";
	var Settings = Backbone.Model.extend({
		modelName: "Settings",
		localStorage: new Backbone.LocalStorage("settings"),
		defaults: {
			notificationsMessage: false,
			notificationsPM: true,
			notificationSound: true,
			minimizeTray: true,
			hideJoinPart: false
		}
	});
	return Settings;
});