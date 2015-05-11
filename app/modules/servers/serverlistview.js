define(["app", "backbone", "underscore"], function(Chatter, Backbone, _) {
    var ServerListView = Backbone.View.extend({
        template: _.template('<div class="server" data-id=<%= id %>><%= title %></div>'),

        events: {
            'click server': 'clicked'
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
            console.log(server.get('id'))
            console.log(server.get('title'));
            return false;
        }
    });
    return ServerListView;
});