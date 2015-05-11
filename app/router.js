define(function(require, exports, module) {
  "use strict";

  var Backbone = require("backbone");

  // Defining the application router.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index"
    },

    index: function() {}
  });

  module.exports = Router;
});