requirejs(["app", "router", "modules/servers/serverlist", "modules/servers/server",
    "modules/servers/serverlistview", "modules/channels/channelview",
    "modules/channels/channellist", "modules/channels/channel", "commands", "jquery", "jquery-popup-overlay",
    "modules/servers/servereditview", "modules/settings", "modules/settingseditview", "tab-complete", "triejs"
  ],
  function(Chatter, Router, ServerList, Server, ServerListView, ChannelView, ChannelList, Channel, Commands, $, popup, ServerEditView, Settings, SettingsEditView, TabComplete, Triejs) {
    "use strict";
    var gui = require("nw.gui");
    var nwNotify = require('nw-notify');
    var path = require('path');
    Chatter.router = new Router();
    window.Triejs = Triejs;

    Chatter.start();
    var win = gui.Window.get();
    Chatter.Clients = {};
    Chatter.Connections = {};
    Chatter.Views = {};
    Chatter.Active = {
      server: null,
      channel: null
    };
    Chatter.BadgeCount = 0;

    // id specifies version of the settings
    var settings = new Settings({
      id: 1
    });
    settings.fetch();
    Chatter.Settings = settings;

    document.addEventListener("keydown", function(event) {
      var key = event.keyCode;
      if (key === 123) {
        gui.Window.get().showDevTools();
      }
      if (key === 116) {
        Chatter.reload();
      }
      if (key === 122) {
        if (Chatter.display === "fullscreen") {
          Chatter.display = "normal";
          win.leaveFullscreen();
        } else {
          Chatter.display = "fullscreen";
          win.enterFullscreen();
        }
      }
      if (key === 121 && !$("#server_popup").length) {
        var view = new ServerEditView({
          model: Chatter.Active.server
        });
        $("body").append(view.render().el);
        $("#server_popup").popup({
          detach: false,
          onclose: function() {
            view.cleanup();
          }
        });
        $("#server_popup").popup("show");
      }
      if (key === 115 && !$("#settings_popup").length) {
        var settingsView = new SettingsEditView();
        $("body").append(settingsView.render().el);
        $("#settings_popup").popup({
          detach: false,
          onclose: function() {
            settingsView.cleanup();
          }
        });
        $("#settings_popup").popup("show");
      }
    });


    $(document).on("click", ".browser-link", function(e) {
      e.preventDefault();
      var link = $(e.target).attr('href');
      gui.Shell.openExternal(link);
    });

    $(document).on("click", ".channel-link", function(e) {
      e.preventDefault();
      var channel = $(e.target).attr('href');
      if (Chatter.Active.server) {
        var connection = Chatter.Connections[Chatter.Active.server.id];
        connection.client.join(channel.trim() + " ");
      }
    });

    function focusNotification(e) {
      win.focus();
      e.closeNotification();
    }

    nwNotify.setConfig({
      appIcon: path.join(nwNotify.getAppPath(), 'dist/images/chatter.png'),
      displayTime: 4000
    });

    Chatter.vent.on('message', function(channel, message, isPM) {
      if (!Chatter.focused && isPM && Chatter.Settings.get('notificationsPM')) {
        win.requestAttention(true);
        Chatter.BadgeCount += 1;
        win.setBadgeLabel(Chatter.BadgeCount);

        nwNotify.notify({
          title: "PM from " + channel.get('name'),
          text: message,
          onClickFunc: focusNotification
        });
      }
    });

    Chatter.display = "normal";
    Chatter.focused = true;

    var tray = new gui.Tray({
      icon: './dist/images/chatter.png'
    });
    $('.close').click(function() {
      Chatter.vent.trigger('window:closed');
      Chatter.display = "closed";
      win.close();
    });

    $('.minimize').click(function() {
      Chatter.vent.trigger('window:minimized');
      Chatter.display = "minimized";
      Chatter.focused = false;
      win.hide();
    });

    $('.maximize').click(function() {
      if (Chatter.display === "maximized") {
        Chatter.vent.trigger('window:normalized');
        Chatter.display = "normal";
        Chatter.focused = true;
        win.unmaximize();
      } else {
        Chatter.vent.trigger('window:maximized');
        Chatter.display = "maximized";
        Chatter.focused = true;
        win.maximize();
      }
    });

    win.on('close', function() {
      win.hide();
      Chatter.disconnect(true);
      Chatter.focused = false;
      win.close(true);
      nwNotify.closeAll();
    });

    win.on('blur', function() {
      Chatter.focused = false;
    });

    win.on('focus', function() {
      Chatter.focused = true;
      Chatter.BadgeCount = 0;
      win.requestAttention(false);
      win.setBadgeLabel("");
    });

    win.on('resize', function(width, height) {
      if (Chatter.Active.channel) {
        Chatter.Active.channel.scrollMessages();
      }
    });

    tray.on('click', function() {
      if (Chatter.display === "minimized") {
        Chatter.vent.trigger('window:tray:normalized');
        Chatter.display = "normal";
        Chatter.focused = true;
        win.show();
      } else {
        Chatter.vent.trigger('window:tray:minimized');
        Chatter.display = "minimized";
        Chatter.focused = false;
        win.hide();
      }
    });

    tray.tooltip = "Chatter";

    //https://github.com/nwjs/nw.js/issues/1955
    if (process.platform === "darwin") {
      var mb = new gui.Menu({
        type: 'menubar'
      });
      mb.createMacBuiltin('Chatter');
      win.menu = mb;
    }

    Chatter.Commands = Commands;
    Chatter.Commands.register = Commands.register;

    Chatter.Commands.register("part", function(client, data, args) {
      if (!Chatter.Active.server) {
        return;
      }
      var channel;
      var message;
      if (args.length === 1) {
        channel = args[0];
      } else {
        channel = Chatter.Active.channel.get('name');
      }
      if (args.length > 1) {
        message = args.slice(1).join(' ');
      }
      Chatter.vent.trigger('part:' + Chatter.Active.server.id, channel, message);
    });

    Chatter.Commands.register("reload", function(client, data, args) {
      Chatter.reload();
    });

    Chatter.Commands.register("dev", function(client, data, args) {
      win.showDevTools();
    });

    Chatter.Commands.register("me", function(client, data, args) {
      if (args.length === 0 || !Chatter.Active.channel) {
        return;
      }
      var action = args.join(' ');
      client.action(Chatter.Active.channel.get('name'), action);
    });

    Chatter.Commands.register("msg", function(client, data, args) {
      if (args.length <= 1 || !Chatter.Active.channel) {
        return;
      }
      var target = args[0];
      var message = args.slice(1).join(' ');
      Chatter.vent.trigger('privateMessage:' + Chatter.Active.server.id, target, message);
    });

    Chatter.Commands.register("notice", function(client, data, args) {
      if (args.length <= 1) {
        return
      }
      var target = args[0]
      var message = args.slice(1).join(" ");
      client.notice(target, message);
      Chatter.vent.trigger("notice:" + Chatter.Active.server.id, null, target, message);
    });

    Chatter.Commands.register("j", "join");
    Chatter.Commands.register("p", "part");
    Chatter.Commands.register("m", "msg");

    win.on('new-win-policy', function(frame, url, policy) {
      policy.ignore();
    });

    var servers = new ServerList();
    Chatter.servers = servers;
    Chatter.servers.fetch();

    if (Chatter.servers.length === 0) {
      var server = new Server();
      server.save();
      Chatter.servers.add(server);
    }

    var view = new ServerListView({
      collection: Chatter.servers
    });
    Chatter.Views.servers = view;
    $('#channels > ul').html(view.render().el);

    Chatter.servers.each(function(server) {
      if (server.get('shouldConnect')) {
        server.connect();
      }
    });

    $('.add-server').click(function() {
      var view = new ServerEditView({
        model: null
      });
      $("body").append(view.render().el);
      $("#server_popup").popup({
        detach: false,
        onclose: function() {
          view.cleanup();
        }
      });
      $("#server_popup").popup("show");
    });

    $(document).bind("drop dragenter dragover dragleave", function(e) {
      e.preventDefault();
      return false;
    });


    Chatter.disconnect = function(close, callback) {
      var keys = Object.keys(Chatter.Clients);
      // check keys length, callback if no servers
      if (keys.length > 0) {
        keys.forEach(function(key) {
          var client = Chatter.Clients[key];
          client.disconnect("Refreshing environment!", function() {
            console.debug("Disconnected a client.");
            if (key === keys[keys.length - 1]) {
              done();
            }
          });
        });
      } else {
        done();
      }

      function done() {
        if (callback) {
          callback();
        }
        if (close) {
          win.close(true);
        }
      }
    };

    Chatter.reload = function() {
      Chatter.disconnect(false, function() {
        location.reload();
      });
    };
  });