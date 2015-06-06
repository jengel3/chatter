window.requireNode = window.require;

requirejs.config({
  paths: {
    "backbone": "../vendor/components/backbone/backbone-min",
    "jquery": "../vendor/components/jquery/dist/jquery.min",
    "underscore": "../vendor/components/underscore/underscore-min",
    "marionette": "../vendor/components/backbone.marionette/lib/backbone.marionette.min",
    "jquery-popup-overlay": "../vendor/components/jquery-popup-overlay/jquery.popupoverlay",
    "localstorage": "../vendor/components/backbone.localStorage/backbone.localStorage-min",
    "moment": "../vendor/components/moment/min/moment.min",
    "triejs": "../node_modules/triejs/src/trie.min",
    "tab-complete": "../vendor/components/tab-complete/dist/jquery.tab-complete.min",
    "autolinker": "../vendor/components/Autolinker.js/dist/Autolinker.min"
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