define(["app", "backbone", "underscore", "modules/channels/channellist", "modules/channels/channelview"], function(Chatter, Backbone, _, ChannelList, ChannelView) {
    var ServerListView = Backbone.View.extend({
        template: _.template('<li class="server" data-id=<%= id %>><span class="server-title"><%= title %></span><ul></ul></li>'),

        events: {
            'click .server': 'clicked',
            'click .server ul li': 'channel'
        },

        render: function(){
            this.collection.each(function(server){
                this.$el.append(this.template(server.toJSON()));
            }, this);
            return this;
        },

        clicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var id = $(e.currentTarget).attr('data-id');
            var server = this.collection.get(id);
            return false;
        },

        channel: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var id = $(e.currentTarget).attr('data-channel-id');
            var channels = new ChannelList();
            channels.fetch();
            var channel = channels.get(id);
            console.log(channel.attributes.server);
            this.collection.fetch();
            var server = this.collection.get(channel.attributes.server);
            Chatter.Active.channel = channel;
            Chatter.Active.server = server;
            $('#content div.channel-wrap:not([data-channel="' + id +'"])').hide();
            $('#content div[data-channel="' + id +'"]').show();
            return false;
        }
    });
    return ServerListView;
});