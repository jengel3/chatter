define(function(require, exports, module) {
  var Marionette = require("marionette");
  var Backbone = require("backbone");
  var Triejs = require("triejs");

  if (window.Chatter) {
  	return window.Chatter;
  }

  window.Chatter = new Marionette.Application();

  return window.Chatter;
});