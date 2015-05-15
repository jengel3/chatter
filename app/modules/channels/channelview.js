define(["app", "backbone", "underscore"], function(Chatter, Backbone, _) {
    var ChannelView = Backbone.View.extend({
        render: function(){
            var template = _.template($("#channel-template").html())(this.channel.toJSON());
            this.$el.html(template);
            return this;
        }
    });
    return ChannelView;
});