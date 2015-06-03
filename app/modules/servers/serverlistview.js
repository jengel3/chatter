define(["app", "backbone", "underscore", "jquery"], function(Chatter, Backbone, _, $) {
    "use strict";
    var ServerListView = Backbone.View.extend({
        template: _.template("<li class=\"server\" data-id=<%= id %>><span class=\"server-title\"><span class=\"slider\">&times; </span><%= title %></span><ul></ul></li>"),
        id: 'ch-list',
        events: {
            "click .server": "server",
            "click .server ul li": "channel",
            "click .server .slider": "slide"
        },
        render: function() {
            var self = this;
            this.$el.empty();
            this.$el.html("");
            this.collection.each(function(server) {
                self.$el.append(self.template(server.toJSON()));
                var header = self.$el.find('li.server[data-id="' + server.id + '"]');
                var connection = Chatter.Connections[server.id];
                if (connection) {
                    if (connection.channels.length > 0) {
                        connection.channels.each(function(channel) {
                            $(header).find("ul").append("<li data-channel-id=\"" + channel.id + "\">" + channel.get('name') + "</li>");
                        }, self);
                    }
                }

            }, self);
            this.delegateEvents();
            return self;
        },

        slide: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var list = $(e.currentTarget).parent().parent().find("ul");
            if ($(list).is(":visible")) {
                $(list).slideUp();
                $(e.currentTarget).html('+ ');
            } else {
                $(list).slideDown();
                $(e.currentTarget).html('&times; ');
            }
        },

        server: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var id = $(e.currentTarget).data("id");
            var server = this.collection.get(id);
            Chatter.Active.server = server;
            Chatter.Active.channel = null;
            $("#content > div").hide();
            $("#content > div[data-server=\"" + id + "\"]").show();
            return false;
        },

        channel: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var id = $(e.currentTarget).data("channel-id");
            var serverId = $(e.currentTarget).parents("li.server").data("id");
            var connection = Chatter.Connections[serverId];
            var channels = connection.channels;
            var channel = channels.get(id);
            channel.focus();
            Chatter.Active.server = connection.server;
            return false;
        }
    });
    return ServerListView;
});