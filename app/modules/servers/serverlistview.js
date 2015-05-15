define(["app", "backbone", "underscore", "modules/channels/channellist", "modules/channels/channelview"], function(Chatter, Backbone, _, ChannelList, ChannelView) {
    var ServerListView = Backbone.View.extend({
        template: _.template('<li class="server" data-id=<%= id %>><span class="server-title"><%= title %></span><ul></ul></li>'),

        events: {
            'click server': 'clicked'
        },

        render: function(){
            this.collection.each(function(server){
                this.$el.append(this.template(server.toJSON()));
            }, this);
            return this;
        },

        loadChannels: function() {
            this.collection.each(function(server){
                var list = new ChannelList();
                list.fetch();
                var results = new ChannelList(list.where({server: server.attributes.id}));
                results.each(function(channel) {
                    $('li.server[data-id='+ server.id + ']').find('ul').append('<li data-channel-id="' + channel.id + '">' + channel.get('name') + '</li>');
                    var chView = new ChannelView({channel: channel});
                    chView.render();
                });
            }, this);
        },

        clicked: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var id = $(e.currentTarget).attr('data-id');
            var server = this.collection.get(id);
            console.log(server.get('id'))
            console.log(server.get('title'));
            return false;
        }
    });
    return ServerListView;
});