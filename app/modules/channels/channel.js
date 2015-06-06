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
			pm: false
		},

		initialize: function() {
			if (!this.uuid) {
				this.set("uuid", uuid.v4());
			}
			this.on("change:topic", this.setTopic, this)
			if (!this.get('name').startsWith('#')) {
				this.set('pm', true);
				this.set('topic', "(Private Message)")
			}
			this.set('lower', this.get('name').toLowerCase());
		},

		getMessages: function() {
			return $("#content div.channel-wrap[data-channel=\"" + this.id + "\"] .messages");
		},

		addMessage: function(message) {
			var msgs = $(this.getMessages());
			var date = moment().format("MM/DD/YYYY hh:mm");
			$(msgs).append("<div class=\"message\"><span class=\"timestamp\">" + date + '</span> <span class="separator">=></span> <span class="text">' + autolinker.link(message) + '</span></div>');
			this.scrollMessages(msgs);
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
		}
	});
	return Channel;
});