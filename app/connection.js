define(["app", "modules/channels/channellist", "modules/channels/channelview", "modules/channels/channel", "modules/servers/serverview"], function (Chatter, ChannelList, ChannelView, Channel, ServerView) {
  "use strict";
  var irc = require("irc");
  var Connection = function (server) {
    var self = this;
    self.attrs = server.attributes;
    self.server = server;
    self.nick = server.attributes.nick;
    self.connected = false;

    self.channels = new ChannelList();

    self.setup();

    self.views = [];

    Chatter.Connections[self.server.id] = self;

    self.connect(function() {
      console.debug("Successfully connected to " + self.server.attributes.title);
      self.connected = true;
      self.join();
    });
  };

  Connection.prototype.findChannel = function (ch) {
    var self = this;
    var channel = self.channels.findWhere({name: ch});
    return channel;
  };

  Connection.prototype.join = function () {
    var self = this;
    _.each(self.server.get("channels"), function (channel, index, list) {
      self.client.join(channel.trim() + " ", function () {});
    });
    Chatter.Active.server = self.server;
  };

  Connection.prototype.connect = function (callback) {
    var self = this;
    self.client.connect(function () {
      callback();
    });
  };

  Connection.prototype.renderNames = function(chan, names) {
    var self = this;
    var channel = self.findChannel(chan);
    var sorted = Object.keys(names).sort(function (a, b) {
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

  Connection.prototype.setup = function () {
    var self = this;
    var options = {
      debug: true,
      autoConnect: false,
      userName: self.attrs.nick,
      port: self.attrs.port,
      realName: self.attrs.real_name
    };
    self.client = new irc.Client(self.attrs.host, self.attrs.nick, options);
    Chatter.Clients[self.server.attributes.id] = self.client;

    self.client.addListener("error", function (message) {
      var messages = $("#content div.server-wrap[data-server=\"" + self.server.id + "\"] .messages");
      $(messages).append("<div class=\"message\"><span class=\"err-msg\">Chatter Error: </span>" + message.command + "</div>");
      $(messages).scrollTop(($(messages).height() * 2));
      if (Chatter.Active.channel) {
        Chatter.Active.channel.addMessage("<div class=\"message\"><span class=\"err-msg\">Chatter Error: </span>" + message.command + "</div>");
      }
    });

    self.client.addListener("registered", function (message) {
      var view = new ServerView({
        model: self.server
      });
      self.views.push(view);
      $("#content").append(view.render().el);
    });

    self.client.addListener("names", function (ch, names) {
      self.renderNames(ch, names);
    });

    self.client.addListener("motd", function (motd) {
      var messages = $("#content div.server-wrap[data-server=\"" + self.server.id + "\"] .messages");
      var lines = motd.split(/\n/);
      for (var x = 0; x < lines.length; x++) {
        var line = lines[x];
        $(messages).append("<div class=\"message\">" + line + "</div>");
        $(messages).scrollTop(($(messages).height() * 2));
      }
    });

    self.client.addListener("message#", function (from, to, message) {
      var channel = self.findChannel(to);

      channel.addMessage("<span class=\"author\">" + from + ": </span>" + message);
    });

    self.client.addListener("action", function (from, to, text, message) {
      var channel = self.findChannel(to);

      channel.addMessage("* " + from + " " + text);
    });

    self.client.addListener("selfMessage", function (to, message) {
      var channel = self.findChannel(to);

      channel.addMessage("<span class=\"author\">" + self.nick + ": </span>" + message);
    });

    self.client.addListener("topic", function (chan, topic, nick, message) {
      var channel = self.findChannel(chan);
      channel.set("topic", topic);

      var wrapper = $("#content div.channel-wrap[data-channel=\"" + channel.id + "\"]");
      $(wrapper).find(".topic").text(topic);
      $(wrapper).find(".topic").attr("title", topic);


      channel.addMessage("*" + nick + " set the topic to: " + topic);
    });


    self.client.addListener("join", function (chan, nick, message) {
      var channel = self.findChannel(chan);
      if (nick === self.nick) {
        if (!channel) {
          channel = new Channel({name: chan});
          self.channels.add(channel);
        }
        self.server.addChannel(chan);
        $("li.server[data-id=" + self.server.id + "]").find("ul").append("<li data-channel-id=\"" + channel.id + "\">" + chan + "</li>");
        var chView = new ChannelView({
          model: channel
        });
        self.views.push(chView);
        $("#content").append(chView.render().el);
        channel.focus();
      } else {
        var newnames = channel.get("names");
        newnames[nick] = "";
        self.renderNames(chan, newnames);
        channel.addMessage("*" + nick + " has joined " + chan);
      }
    });

    self.client.addListener("part", function (chan, nick, reason, message) {
      var channel = self.findChannel(chan);

      if (nick !== self.nick) {
        channel.addMessage("*" + nick + " has left " + chan);
        self.removeUser(nick, channel);
      } else {
        var wrap = $("#content div.channel-wrap[data-channel=\"" + channel.id + "\"]");
        $("#channels li[data-channel-id=\"" + channel.id + "\"]").remove();
        self.channels.remove(channel);

        var first = self.channels.first();
        wrap.remove();
        first.focus();
      }
    });

    self.client.addListener("setNick", function (newNick) {
      self.nick = newNick;
    });

    self.client.addListener("quit", function (nick, reason, chans, message) {
      if (nick !== self.nick) {
        for (var x = 0; x < chans.length; x++) {
          var ch = chans[x];
          var channel = self.channels.findWhere({name: ch});
          if (channel.get("names")[nick]) {
            channel.addMessage("*" + nick + " has quit " + ch + ": " + reason);
          }
        }
      } else {
        self.connected = false;
      }
    });
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