define(["app", "backbone", "modules/channels/channel"], function(Chatter, Backbone, Channel) {
  "use strict";
  var ChannelList = Backbone.Collection.extend({
    model: Channel
  });
  return ChannelList;
});