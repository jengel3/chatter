window.requireNode = window.require;

requirejs.config({
	paths: {
		"backbone": "../vendor/components/backbone/backbone",
		"jquery": "../vendor/components/jquery/dist/jquery",
		"underscore": "../vendor/components/underscore/underscore",
		"marionette": "../vendor/components/backbone.marionette/lib/backbone.marionette",
    "jquery-popup-overlay": "../vendor/components/jquery-popup-overlay/jquery.popupoverlay",
    "localstorage": "../vendor/components/backbone.localStorage/backbone.localStorage"
  },
  deps: ['main'],
  shim: {
    jquery: {
      exports: '$'
    },
    underscore: {
      exports: '_'
    },
    backbone: {
      exports: 'Backbone'
    },
    marionette: {
     exports: 'Marionette'
   }
 }
});