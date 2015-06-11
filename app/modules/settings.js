define(["app", "backbone", "localstorage"], function(Chatter, Backbone, LocalStorage) {
	"use strict";
	var gui = require("nw.gui");
	var version = gui.App.manifest.version;
	var Settings = Backbone.Model.extend({
		modelName: "Settings",
		localStorage: new Backbone.LocalStorage("settings"),
		defaults: {
			notifications: {
				onMessage: false,
				onNotice: true,
				onPM: true,
				sound: true
			},
			channels: {
				hideJoinPart: true,
				quitMessage: "Chatter v" + version + " " + "https://github.com/Jake0oo0/chatter",
				partMessage: "Leaving!" 
			},
			window: {
				minimizeToTray: true
			}
		},
		getValue: function(key) {
			var parts;
			if (key.indexOf(".") > -1) {
				parts = key.split(".");
			}
			if (parts) {
				return this.get(parts[0])[parts[1]];
			} else {
				return this.get(key);
			}
		}
	});
	return Settings;
});