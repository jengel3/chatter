define(["app", "backbone", "jquery", "moment", "autolinker"], function(Chatter, Backbone, $, moment, Autolinker) {
	"use strict";
	var uuid = require("node-uuid");
	var autolinker = new Autolinker({
		stripPrefix: false,
		className: "browser-link",
		hashtag: "twitter",
		replaceFn: function(autolinker, match) {
			if (match.getType() === "hashtag") {
				var channel = match.getAnchorText();
				return '<a href="' + channel + '" class="channel-link">' + channel + '</a>';
			}
		}
	});
	var Channel = Backbone.Model.extend({
		idAttribute: "uuid",
		modelName: "Channel",
		defaults: {
			name: "",
			lower: "",
			topic: "",
			names: {},
			channels: [],
			pm: false,
			messages: [],
			modes: ""
		},

		initialize: function() {
			if (!this.uuid) {
				this.set("uuid", uuid.v4());
			}
			this.on("change:topic", this.setTopic, this);
			this.on("change:modes", this.setModes, this);
			if (!this.get('name').startsWith('#')) {
				this.set('pm', true);
				this.set('topic', "(Private Message)")
			}
			this.set('lower', this.get('name').toLowerCase());
		},

		getMessages: function() {
			return $("#content div.channel-wrap[data-channel='" + this.id + "'] .messages");
		},

		addMessage: function(message) {
			var msgs = $(this.getMessages());
			var date = moment().format("MM/DD/YYYY hh:mm");
			$(msgs).append("<div class='message'><span class='timestamp'>" + date + '</span> <span class="separator">=></span> <span class="text">' + autolinker.link(parseColors(message)) + '</span></div>');
			this.scrollMessages(msgs);


			// based on http://snipplr.com/view/73480/parse-mirc-colors/
			function parseColors(message) {

				var oMessage = message;

				while (message.indexOf(String.fromCharCode(15)) > -1) {
					message = message.replace(String.fromCharCode(15), "");
				}
				while (message.indexOf(String.fromCharCode(3)) > -1) {
					message = message.replace(String.fromCharCode(3), "^C");
				}


				var colors = ["white", "black", "#00008B", "green", "red", "brown", "#800080", "orange", "yellow", "#32CD32", "#008080", "#ADD8E6", "#0000FF", "#FF69B4", "#808080", "#D3D3D3"];
				var match = message.match(/\^C[0-9]?[0-9](\,[0-9]?[0-9])?/g);
				var counter = 0; 
				if (match != null) {
					$.each(match, function(index, value) {
						var orgValue = value;
						value = value.substr(2);
						value = value.split(",");
						value[0] = parseInt(value[0]); 
						if (value[0] < 16) {
							if (value.length > 1) {
								value[1] = parseInt(value[1]); 
								if (value[1] < 16) {
									counter++;
									message = message.replace(orgValue, "<span style=\"color:" + colors[value[0]] + ";background:" + colors[value[1]] + "\">");
								} else {
									message = message.replace(orgValue, "");
								}
							} else {
								counter++;
								message = message.replace(orgValue, "<span style=\"color:" + colors[value[0]] + "\">");
							}
						} else {
							message = message.replace(orgValue, "");
						}
					});
				}

				while (message.indexOf("^C") > -1) {
					if (counter > 0) {
						message = message.replace("^C", "</span>");
						counter--;
					} else {
						message = message.replace("^C", "");
					}
				}

				if (counter > 0) {
					while (counter > 0) {
						counter--;
						message += "</span>";
					}
				}

				var c = message.split("<");
				var counter = 0;
				$.each(c, function(index, value) {
					if (value.length > 5 && value.substr(0, 5) == "span ") {
						counter++;
					}
					if (value.length > 5 && value.substr(0, 6) == "/span>") {
						counter--;
						if (counter < 0) {
							counter = 1;
							return false;
						}
					}
				});

				if (counter != 0) {
					message = StripColors(oMessage);
				}

				// message = replaceWithHtml(message, "\002", "<b>", "</b>");
				// message = replaceWithHtml(message, "\037", "<u>", "</u>");

				return message;
			}
		},

		scrollMessages: function(sel) {
			if (!sel) {
				sel = $(this.getMessages());
			}
			sel.scrollTop($(sel).prop("scrollHeight"));
		},

		focus: function() {
			$("#content > div").hide();
			var wrap = $("#content div.channel-wrap[data-channel=\"" + this.id + "\"]");
			Chatter.Active.channel = this;
			wrap.show();
			setTimeout(function() {
				wrap.find(".message-input").focus();
			}, 1);
			Chatter.vent.trigger('focus:channel', this);
		},

		hide: function() {
			var wrap = $("#content div.channel-wrap[data-channel=\"" + this.id + "\"]");
			wrap.hide();
		},

		setTopic: function() {
			var topic = this.get('topic');
			var wrapper = $("#content div.channel-wrap[data-channel=\"" + this.id + "\"]");
			$(wrapper).find(".topic").text(topic);
			$(wrapper).find(".topic").attr("title", topic);
		},

		setModes: function() {
			var modeBar = $("#content div.channel-wrap[data-channel=\"" + this.id + "\"] .channel-name");
			$(modeBar).text(this.get('name') + " (" + this.get("modes") + "):");
		}
	});
	return Channel;
});