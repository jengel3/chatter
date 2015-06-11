define(["app", "underscore", "jquery", "modules/channels/channellist", "modules/channels/channelview", "modules/channels/channel", "modules/servers/serverview"], function(Chatter, _, $, ChannelList, ChannelView, Channel, ServerView) {
  "use strict";
  var irc = require("irc");
  var Connection = function(server) {
    var self = this;
    self.attrs = server.attributes;
    self.server = server;
    self.nick = server.attributes.nick;
    self.connected = false;
    self.firstConnect = true;

    self.channels = new ChannelList();

    self.setup();

    self.views = [];

    Chatter.Connections[self.server.id] = self;

    self.onConnect = function() {
      self.connected = true;

      var commands = self.server.get("onConnect");
      for (var i = 0; i < commands.length; i++) {
        var command = commands[i].trim();
        var args = command.split(" ");
        self.client.send.apply(self.client, args);
        self.join();
      }
    }

    self.connect(function() {
      console.debug("Successfully connected to " + self.server.get("title"));

      var connectionInterval = function() {
        if (self.client && self.client.conn && window.navigator.onLine) {
          if (!self.connected) {
            self.connected = true;
            self.connect(function() {
              self.onConnect();
              console.debug("Successfully reconnected to " + self.server.get("title"))
              return true;
            });
          }
        } else {

          console.debug("Warning: No longer online...");
          if (self.connected) {

            self.client.disconnect();
            Chatter.vent.trigger("client:disconnect:" + self.server.id, self.server);

            self.connected = false;

            self.channels.each(function(channel) {
              channel.addMessage("Disconnected from server...attempting to reconnect...");
            });
          }
          return false;

        }
      }

      setInterval(connectionInterval, 5000);

      self.onConnect();
    });
  };

  Connection.prototype.join = function() {
    var self = this;
    _.each(self.server.get("channels"), function(channel) {
      self.client.join(channel.trim() + " ", function() {});
    });
    Chatter.Active.server = self.server;
  };

  Connection.prototype.connect = function(callback) {
    var self = this;
    self.client.connect(function() {
      Chatter.vent.trigger('client:connect', self);
      callback();
    });
  };

  Connection.prototype.setup = function() {
    var self = this;
    var options = {
      debug: true,
      autoConnect: false,
      userName: self.attrs.nick,
      port: self.attrs.port,
      realName: self.attrs.realName
    };

    self.client = new irc.Client(self.attrs.host, self.attrs.nick, options);
    Chatter.Clients[self.server.attributes.id] = self.client;

    self.client.addListener("error", function(message) {});

    self.client.addListener("registered", function(message) {
      if (self.firstConnect) {
        var view = new ServerView({
          model: self.server
        });
        self.views.push(view);
        $("#content").append(view.render().el);
        self.firstConnect = false;
      }
    });

    self.client.addListener("names", function(ch, names) {
      self.renderNames(ch, names);
    });


    self.client.addListener("message", function(from, to, message) {
      var channel;
      var isPM = false;
      if (self.isChannel(to)) {
        channel = self.findChannel(to);
      } else {
        channel = self.createPM(from);
        isPM = true;
      }

      channel.addMessage("<span class='author'>" + from + ": </span>" + message);
      Chatter.vent.trigger('message', channel, message, isPM);

    });

    self.client.addListener("action", function(from, to, text, message) {
      var channel = self.findChannel(to);

      channel.addMessage("* " + from + " " + text);
    });

    self.client.addListener("notice", function(nick, to, text, message) {
      Chatter.vent.trigger("notice:" + self.server.id, nick, to, text);
    });

    Chatter.vent.on("notice:" + self.server.id, function(from, to, message) {
      if (!from) {
        from = self.nick;
      }
      var channel = Chatter.Active.channel;
      if (self.isChannel(to)) {
        channel = self.findChannel(to);
        channel.addMessage("<span class='author notice'>-" + from + "/" + to + "-: </span>" + message);
      } else {
        if (channel && self.channels.contains(channel)) {
          channel.addMessage("<span class='author notice'>-" + from + "-: </span>" + message);
        } else {
          self.serverMessage("<span class='author notice'>-" + from + "-: </span>" + message);
        }
      }
    });

    self.client.addListener("raw", function(message) {
      // https://www.alien.net.au/irc/irc2numerics.html
      // we need to specify which codes are important
      // and which ones can be passed to the server

      var pass = [
        "001", "002", "003", "004", "005", "006", "007",
        "372", "375", "376", "377", "378"
      ];

      // any 'message' with these codes will be passed to
      // the current channel, or server if necessary
      var important = [
        "705", "404", "411", "412", "421", "433",
        "464", "472", "477", "524", "479", "292",
        "347", "304"
      ];

      var args = message.args;
      if (message.args[0] === self.nick) {
        args = args.slice(1);
      }
      var raw = args.join(" ");

      if (_.contains(pass, message.rawCommand)) {
        self.serverMessage(raw);
      } else if (message.rawCommand === "401" || message.rawCommand === "403") {
        // we need to clean up a channel if it was created before getting this response
        var chan = args[0];
        var channel = self.findChannel(chan);
        if (channel) {
          self.removeChannel(channel);
          if (!channel.get('pm')) {
            self.client.part(chan);
          }
        }
        if (Chatter.Active.channel && Chatter.Active.channel.server === self.server.id) {
          var channel = Chatter.Active.channel;
          channel.addMessage(raw);
        } else {
          self.serverMessage(raw);
        }
      } else if (_.contains(important, message.rawCommand) || message.commandType === "error") {
        if (Chatter.Active.channel) {
          var channel = Chatter.Active.channel;
          channel.addMessage(raw);
        }
        self.serverMessage(raw);
      } else if (message.rawCommand === "324") {
        var channel = self.findChannel(message.args[1]);
        var modes = message.args.slice(2);
        var mstring = modes.join(" ").trim();
        channel.set("modes", mstring);
      }
    });

    self.client.addListener("+mode", function(channel, by, mode, argument, message, isChannel) {
      self.updateModes(channel, by, mode, argument, message, isChannel, true);
    });

    self.client.addListener("-mode", function(channel, by, mode, argument, message, isChannel) {
      self.updateModes(channel, by, mode, argument, message, isChannel, false);
    });

    self.client.addListener("selfMessage", function(to, message) {
      var channel = self.findChannel(to);

      channel.addMessage("<span class=\"author\">" + self.nick + ": </span>" + message);
      Chatter.vent.trigger('sentMessage', to, message);
    });

    self.client.addListener("topic", function(chan, topic, nick, message) {
      var channel = self.findChannel(chan);

      channel.set('topic', topic);

      channel.addMessage("*" + nick + " set the topic to: " + topic);

      Chatter.vent.trigger('topic', channel, topic, nick);
    });


    self.client.addListener("join", function(chan, nick, message) {
      var channel = self.findChannel(chan);
      if (nick === self.nick) {
        if (!channel) {
          channel = new Channel({
            name: chan
          });
          self.channels.add(channel);

          self.server.addChannel(chan);
          var view = Chatter.Views.servers;
          $('#channels > ul').html(view.render().el);
          view.delegateEvents();
          var chView = new ChannelView({
            model: channel
          });
          self.views.push(chView);
          $("#content").append(chView.render().el);
          channel.focus();
          Chatter.vent.trigger('self:join', channel);
        }
      } else {
        var newnames = channel.get("names");
        newnames[nick] = "";
        self.renderNames(chan, newnames);
        if (!Chatter.Settings.getValue("channels.hideJoinPart")) {
          channel.addMessage("*" + nick + " has joined " + chan);
        }
        Chatter.vent.trigger("join", channel);
      }
    });

    self.client.addListener("part", function(chan, nick, reason, message) {
      var channel = self.findChannel(chan);

      if (nick !== self.nick) {
        if (!Chatter.Settings.getValue("channels.hideJoinPart")) {
          channel.addMessage("*" + nick + " has left " + chan);
        }
        self.removeUser(nick, channel);
        Chatter.vent.trigger('part', channel);
      } else {
        self.removeChannel(channel);
        Chatter.vent.trigger('self:part', channel);
      }
    });

    self.client.addListener("setNick", function(newNick) {
      self.nick = newNick;
    });

    self.client.addListener("quit", function(nick, reason, chans, message) {
      if (nick !== self.nick) {
        for (var x = 0; x < chans.length; x++) {
          var ch = chans[x];
          var channel = self.channels.findWhere({
            name: ch
          });
          if (channel.get("names")[nick]) {
            if (!Chatter.Settings.getValue("channels.hideJoinPart")) {
              channel.addMessage("*" + nick + " has quit " + ch + ": " + reason);
            }
            Chatter.vent.trigger("quit", channel);
          }
        }
      } else {
        Chatter.vent.trigger("client:disconnect:" + self.server.id, self.server);
      }
    });

    Chatter.vent.on("part:" + self.server.id, function(chan, message) {
      var channel = self.findChannel(chan);
      if (channel.get("pm")) {
        self.removeChannel(channel);
      } else {
        self.client.part(chan, message || Chatter.Settings.getValue("channels.partMessage"));
      }
    });

    Chatter.vent.on("privateMessage:" + self.server.id, function(nick, message) {
      var channel = self.createPM(nick);
      self.client.say(nick, message);
    });

    Chatter.vent.on("sendingMessage:" + self.server.id, function(receiver, message) {
      if (message.trim() !== "") {
        if (message.slice()[0] === "/") {
          var data = {
            receiver: receiver,
            message: message,
            nick: self.nick
          };
          Chatter.Commands.handle(self.client, data, function(client, data, args) {
            client.send(data.command, args.join(" "));
          });
        } else {
          if (receiver.modelName === "Channel") {
            self.client.say(receiver.get("name"), message);
          } else if (receiver.modelName === "Server") {
            self.client.send(message);
          }
        }
      }
    });
  };

  Connection.prototype.updateModes = function(channel, by, mode, argument, message, isChannel, adding) {
    var self = this;
    if (isChannel) {
      self.client.send("MODE", channel);
    } else {
      self.client.send("NAMES", channel);
    }

    var output = by + " ";
    if (adding) {
      output += "sets";
    } else {
      output += "removes";
    }

    if (isChannel) {
      output += " channel mode(s) " + mode + " " + (argument ? argument : "") + " on " + channel;
    } else {
      output += " user mode(s) " + mode + " on " + argument;
    }

    var chan = self.findChannel(channel);
    chan.addMessage(output);
  };

  Connection.prototype.serverMessage = function(message) {
    var self = this;
    var messages = $("#content div.server-wrap[data-server=\"" + self.server.id + "\"] .messages");
    $(messages).append("<div class=\"message\">" + message + "</div>");
    messages.scrollTop(messages.prop("scrollHeight"));
  };

  Connection.prototype.removeChannel = function(channel) {
    var self = this;
    var wrap = $("#content div.channel-wrap[data-channel=\"" + channel.id + "\"]");
    self.channels.remove(channel);
    var view = Chatter.Views.servers;
    $('#channels > ul').html(view.render().el);
    view.delegateEvents();
    var first = self.channels.first();
    wrap.remove();
    first.focus();
  };

  Connection.prototype.isChannel = function(chan) {
    return chan.startsWith('#');
  };

  Connection.prototype.createPM = function(nickname) {
    var self = this;
    var channel = self.findChannel(nickname);
    if (!channel) {
      channel = new Channel({
        name: nickname
      });
      self.channels.add(channel);

      var view = Chatter.Views.servers;
      $('#channels > ul').html(view.render().el);
      view.delegateEvents();

      var chView = new ChannelView({
        model: channel
      });
      self.views.push(chView);

      $("#content").append(chView.render().el);
      channel.hide();
    }
    if (channel.get('name') !== nickname) {
      channel.set('name', nickname);
    }
    return channel;
  };

  Connection.prototype.renderNames = function(chan, names) {
    var self = this;
    var channel = self.findChannel(chan);
    var sorted = Object.keys(names).sort(function(a, b) {
      return toPriority(names[a]) - toPriority(names[b]);
    });
    channel.set("names", names);
    var users = $("#content div.channel-wrap[data-channel='" + channel.id + "'] .users ul");
    var users_new = "";
    for (var x = 0; x < sorted.length; x++) {
      var username = sorted[x];
      var rank = names[username];
      var added = "<li class='user'>";
      if (rank === "@") {
        added += "<span class='rank operator'>@</span>";
      } else if (rank === "+") {
        added += "<span class='rank voiced'>+</span>";
      }
      added += username + "</li>";
      users_new += added;
    }
    $(users).html(users_new);
  };

  Connection.prototype.removeUser = function(user, channel) {
    var self = this;
    var names = channel.get("names");
    delete names[user];
    self.renderNames(channel.get("name"), names);
  };

  Connection.prototype.findChannel = function(ch) {
    var self = this;
    var channel = self.channels.findWhere({
      lower: ch.toLowerCase()
    });
    return channel;
  };

  function toPriority(sym) {
    if (sym === "@") {
      return 0;
    } else if (sym === "+") {
      return 1;
    } else {
      return 2;
    }
  }

  return Connection;
});