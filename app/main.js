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

    function playNotificationSound(e) {
      function playSound() {
        var audio = new Audio();
        audio.src = './dist/sounds/notification.ogg';
        audio.play();
      }

      if (Chatter.Settings.getValue('notifications.sound')) {
        playSound();
      }
    }

    nwNotify.setConfig({
      appIcon: path.join(nwNotify.getAppPath(), 'dist/images/chatter.png'),
      displayTime: 4000
    });

    Chatter.vent.on('message', function(channel, message, isPM) {
      if (!Chatter.focused && isPM && Chatter.Settings.getValue('notifications.onPM')) {
        win.requestAttention(true);
        Chatter.BadgeCount += 1;
        win.setBadgeLabel(Chatter.BadgeCount);

        nwNotify.notify({
          title: "PM from " + channel.get('name'),
          text: message,
          onClickFunc: focusNotification,
          onShowFunc: playNotificationSound
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
      tray.remove();
      tray = null;
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

    Chatter.Embeds = {};
    

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

    Chatter.Commands.register("version", function(client, data, args) {
      var manifest = gui.App.manifest;
      if (Chatter.Active.channel) {
        Chatter.Active.channel.addMessage("Version: " + manifest.version);
      }
    });

    Chatter.Commands.register("update", function(client, data, args) {
      if (Chatter.Active.channel) {
        Chatter.Active.channel.addMessage("Running update check...");
      }
      updateCheck();
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

    Array.prototype.empty = function() {
      this.length = 0;
    };

    Chatter.Commands.register("clear", function(client, data, args) {
      var channel = Chatter.Active.channel;
      if (!channel) {
        return;
      }
      channel.get('messages').empty();
      channel.getMessages().empty();
    });

    Chatter.Commands.register("clearall", function(client, data, args) {
      var connections = Chatter.Connections;
      _.each(connections, function(con, k) {
        var channels = con.channels;
        channels.each(function(channel) {
          channel.get('messages').empty();
          channel.getMessages().empty();
        });
      });
    });

    Chatter.Commands.register("notice", function(client, data, args) {
      if (args.length <= 1) {
        return;
      }
      var target = args[0];
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
          client.disconnect(Chatter.Settings.getValue('channels.quitMessage'), function() {
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
      tray.remove();
      tray = null;
      Chatter.disconnect(false, function() {
        location.reload();
      });
    };


    function updateCheck() {
      var pkg = gui.App.manifest;
      $.getJSON("https://api.github.com/repos/Jake0oo0/chatter/releases/latest", function(data) {
        var version = data.tag_name.replace('v', '');
        var newVersion = gtVer(version, pkg.version);

        if (newVersion) {
          if (Chatter.Active.channel) {
            Chatter.Active.channel.addMessage("New version available! Download it now: https://github.com/Jake0oo0/chatter/releases/latest")
          }
        } else {
        }
      });


      function gtVer(newVersion, oldVersion) {
        var newParts = newVersion.split('.');
        var oldParts = oldVersion.split('.');
        var testParts = oldParts.concat(newParts);

        for (var x = 0; x < testParts.length; x++) {
          var part = testParts[x];
          var numTest = /^\d+$/;
          if (!numTest.test(part)) {
            console.warn("Unable to parse version, can not continue.");
            return false;
          }
        }

        oldParts = oldParts.map(function(i) {
          return parseInt(i);
        });

        newParts = newParts.map(function(i) {
          return parseInt(i);
        });

        if (newParts[0] > oldParts[0]) {
          return true;
        } else if (newParts[0] < oldParts[0]) {
          return false;
        }

        if (newParts[1] > oldParts[1]) {
          return true;
        } else if (newParts[1] < oldParts[1]) {
          return false;
        }

        if (newParts[2] > oldParts[2]) {
          return true;
        } else if (newParts[2] < oldParts[2]) {
          return false;
        }

        return false;
      }
    }

    Chatter.vent.once("client:connect", function(connection) {
      updateCheck();
    });
  });