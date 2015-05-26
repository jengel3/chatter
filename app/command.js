define(["app"], function (Chatter) {
  "use strict";
  var Commands = {};

  Commands.list = [];

  Commands.add = function(matcher, handler) {
    Commands.list.push({
      matcher: matcher,
      handler: handler
    });
  };

  Commands.handle = function(client, data) {
    var commands = Commands.list;
    var args = data.message.substring(1).split(" ");
    var cmd = args[0];

    for (var x = 0; x < commands.length; x++) {
      var command = commands[x];
      if (command.matcher === cmd) {
        cmd = command;
        break;
      }
    }
    if (!cmd) {
      return false;
    }
    return cmd.handler(client, data, args.slice(1));
  };

  return Commands;
});