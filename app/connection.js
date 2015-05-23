define(["app", "modules/channels/channellist", "modules/channels/channelview", "modules/channels/channel", "modules/servers/serverview", "command"], function (Chatter, ChannelList, ChannelView, Channel, ServerView, Commands) {
  var irc = require('irc');
  var Connection = function (server) {
    var self = this;
    self.attrs = server.attributes;
    self.server = server;
    self.nick = server.attributes.nick;

    self.channels = new ChannelList();
    channels.fetch();


    self.setup();

    self.connect(function (inst) {
      console.debug("Successfully connected to " + self.server.attributes.title);
      self.join();
    })
  };

  Connection.prototype.findChannel = function(ch) {
    var self = this;
    var channel = channels.findWhere({name: ch, server: self.server.id});
    return channel;
  };

  Connection.prototype.join = function () {
    var self = this;
    var list = new ChannelList();
    list.fetch();
    var results = new ChannelList(list.where({
      server: self.attrs.id
    }));

    results.each(function (channel) {
      self.client.join(channel.get('name') + ' ', function () {})
    });
    Chatter.Active.server = self.server;
  };

  Connection.prototype.connect = function (callback) {
    var self = this;
    self.client.connect(function () {
      callback(self);
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


  function renderNames(channel, names) {
    var col = new ChannelList();
    col.fetch();
    var channel = col.findWhere({
      name: ch,
      server: self.server.id
    });
    var sorted = Object.keys(names).sort(function (a, b) {
      return toPriority(names[a]) - toPriority(names[b])
    });
    var users = $('#content div.channel-wrap[data-channel="' + channel.id + '"] .users ul');
    var users_new = ''
    for (var x = 0; x < sorted.length; x++) {
      var username = sorted[x];
      var rank = names[username];
      var added = '<li class="user">';
      if (rank === '@') {
        added += '<span class="operator">@</span>'
      } else if (rank === '+') {
        added += '<span class="voiced">+</span>'
      }
      added += username + '</li>'
      users_new += added;
    }
    $(users).html(users_new);
  }

  Connection.prototype.setup = function () {
    var self = this;
    var options = {
      debug: true,
      autoConnect: false,
      userName: self.attrs.nick,
      port: self.attrs.port,
      realName: self.attrs.real_name
    }
    self.client = new irc.Client(self.attrs.host, self.attrs.nick, options);
    Chatter.Store[self.server.attributes.id] = self.client;

    self.client.addListener('error', function (message) {
      var messages = $('#content div.server-wrap[data-server="' + self.server.id + '"] .messages');
      $(messages).append('<div class="message"><span class="err-msg">Chatter Error: </span>' + message + '</div>')
      $(messages).scrollTop(($(messages).height() * 2));
    });

    self.client.addListener('registered', function (message) {
      var view = new ServerView({
        model: self.server
      });
      $('#content').append(view.render().el);
    });

    self.client.addListener('names', function (ch, names) {
      renderNames(ch, names);
    });

    self.client.addListener('motd', function (motd) {
      var messages = $('#content div.server-wrap[data-server="' + self.server.id + '"] .messages');
      var lines = motd.split(/\n/);
      for (var x = 0; x < lines.length; x++) {
        var line = lines[x];
        $(messages).append('<div class="message">' + line + '</div>')
        $(messages).scrollTop(($(messages).height() * 2));
      }
    });

    self.client.addListener('message', function (from, to, message) {
      var col = new ChannelList();
      col.fetch();
      var channel = col.findWhere({
        name: to,
        server: self.server.id
      });

      var messages = $('#content div.channel-wrap[data-channel="' + channel.id + '"] .messages');
      $(messages).append('<div class="message"><span class="author">' + from + ': </span>' + message + '</div>')
      $(messages).scrollTop(($(messages).height() * 2));

    });

    self.client.addListener('selfMessage', function (to, message) {
      var col = new ChannelList();
      col.fetch();
      var channel = col.findWhere({
        name: to,
        server: self.server.id
      });

      var messages = $('#content div.channel-wrap[data-channel="' + channel.id + '"] .messages');
      $(messages).append('<div class="message"><span class="author">' + self.nick + ': </span>' + message + '</div>')
      $(messages).scrollTop(($(messages).height() * 2));

    });

    self.client.addListener('topic', function (channel, topic, nick, message) {
      var col = new ChannelList();
      col.fetch();
      var channel = col.findWhere({
        name: channel,
        server: self.attrs.id
      });
      channel.set('topic', topic);
      channel.save();

      var wrapper = $('#content div.channel-wrap[data-channel="' + channel.id + '"]');
      $(wrapper).find('.topic').text(topic);

      var messages = $(wrapper).find('.messages');
      $(messages).append('<div class="message"> *' + nick + ' set the topic to: ' + topic + '</div>')
      $(messages).scrollTop(($(messages).height() * 2));
    });


    self.client.addListener('join', function (ch, nick, message) {
      var col = new ChannelList();
      col.fetch();
      var channel = col.findWhere({
        name: ch,
        server: self.server.id
      });
      if (nick === self.nick) {
        if (!channel) {
          channel = new Channel({
            name: ch,
            server: self.server.id
          });
          col.add(channel);
          channel.save();
        }
        $('li.server[data-id=' + self.server.id + ']').find('ul').append('<li data-channel-id="' + channel.id + '">' + ch + '</li>');
        var chView = new ChannelView({
          model: channel
        });
        if ($('#content > div').length >= 1) {
          $('#content > div').hide();
        }
        $('#content').append(chView.render().el)
        $('#content > div').last().find('.messages').focus();
        Chatter.Active.channel = channel;
      } else {

        var messages = $('#content div.channel-wrap[data-channel="' + channel.id + '"] .messages');

        $(messages).append('<div class="message"> *' + nick + ' has joined ' + ch + '</div>')
        $(messages).scrollTop(($(messages).height() * 2));
      }
    });
self.client.addListener('part', function (ch, nick, reason, message) {
  var col = new ChannelList();
  col.fetch();
  var channel = col.findWhere({
    name: ch,
    server: self.server.id
  });

  if (nick !== self.nick) {

    var messages = $('#content div.channel-wrap[data-channel="' + channel.id + '"] .messages');

    $(messages).append('<div class="message"> *' + nick + ' has left ' + ch + '</div>')
    $(messages).scrollTop(($(messages).height() * 2));
  } else {
    var wrap = $('#content div.channel-wrap[data-channel="' + channel.id + '"]');
    $('#channels li[data-channel-id="' + channel.id + '"]').remove();
    channel.destroy();
    var first = col.findWhere({
      server: self.server.id
    });

    var next = $('#content div.channel-wrap[data-channel="' + first.id + '"]');
    Chatter.Active.channel = next;
    wrap.remove();
    next.show();

    next.find('.messages').focus();
  }
});

self.client.addListener('setNick', function (newNick) {
  self.nick = newnick;

});

self.client.addListener('quit', function (nick, reason, channels, message) {
  if (nick !== self.nick) {
    var col = new ChannelList();
    col.fetch();
    for (var x = 0; x < channels.length; x++) {
      var ch = channels[x];
      var channel = col.findWhere({
        name: ch,
        server: self.server.id
      });
      var messages = $('#content div.channel-wrap[data-channel="' + channel.id + '"] .messages');

      $(messages).append('<div class="message"> *' + nick + ' has quit ' + ch + ': ' + reason + '</div>')
      $(messages).scrollTop(($(messages).height() * 2));
    }
  }
});
};
return Connection;
});