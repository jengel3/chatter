define(["app", "backbone", "underscore", "modules/channels/channellist", "modules/channels/channelview"], function(Chatter, Backbone, _, ChannelList, ChannelView) {
    var ServerListView = Backbone.View.extend({
        template: _.template('<li class="server" data-id=<%= id %>><span class="server-title"><span class="slider">&times; </span><%= title %></span><ul></ul></li>'),

        events: {
            "click .server": "server",
            "click .server ul li": "channel"
        },

        render: function(){
            this.collection.each(function(server){
                this.$el.append(this.template(server.toJSON()));
            }, this);
            return this;
        },

        reset: function(collection) {
            this.collection = collection;
            this.$el.html("");
            this.$el.empty();
            this.delegateEvents();
            return this.render();
        },

        server: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var id = $(e.currentTarget).data('id');
            var server = this.collection.get(id);
            var active = Chatter.Active.server;
            $('#content > div').hide();
            $('#content > div[data-server="' + id +'"]').show();
            return false;
        },

        channel: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var id = $(e.currentTarget).data('channel-id');
            var serverId = $(e.currentTarget).parents('li.server').data('id');
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