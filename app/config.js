window.requireNode = window.require;

requirejs.config({
	paths: {
		"backbone": "../vendor/components/backbone/backbone",
		"jquery": "../vendor/components/jquery/dist/jquery",
		"underscore": "../vendor/components/underscore/underscore",
		"marionette": "../vendor/components/backbone.marionette/lib/backbone.marionette",
    "jquery-popup-overlay": "../vendor/components/jquery-popup-overlay/jquery.popupoverlay",
    "localstorage": "../vendor/components/backbone.localStorage/backbone.localStorage",
    "moment": "../vendor/components/moment/moment",
    "triejs": "../node_modules/triejs/src/trie",
    "tab-complete": "../vendor/components/tab-complete/dist/jquery.tab-complete.min"
  },
  deps: ["main"],
  shim: {
    jquery: {
      exports: "$"
    },
    underscore: {
      exports: "_"
    },
    backbone: {
      exports: "Backbone"
    },
    marionette: {
      exports: "Marionette"
    },
    triejs: {
      exports: "Triejs"
    },
    "jquery-popup-overlay": ["jquery"],
    "tab-complete": ["jquery", "triejs"]
 }
});