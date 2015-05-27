define(["app", "underscore"], function (Chatter, _) {
  "use strict";
  var Commands = {};

  Commands.list = [];

  Commands.register = function(matcher, handler) {
    var context = {
      matcher: matcher,
      handler: handler
    };
    if (_.isFunction(handler)) {
      // new command
      context.type = 1;
    } else if(_.isString(handler)) {
      // alias
      context.type = 2;
    }
    Commands.list.push(context);
  };

  Commands.handle = function(client, data, def) {
    var commands = Commands.list;
    var args = data.message.substring(1).split(" ");
    var cmd = args[0];
    data.command = cmd;

    for (var x = 0; x < commands.length; x++) {
      var command = commands[x];
      if (command.matcher === cmd) {
        cmd = command;
        break;
      }
    }
    if (cmd.type === 2) {
      for (var x = 0; x < commands.length; x++) {
        var command = commands[x];
        if (command.matcher === cmd.handler) {
          cmd = command;
          break;
        }
      }
    }
    if (!cmd) {
      return def(client, data, args.slice(1));
    }
    return cmd.handler(client, data, args.slice(1));
  };

  return Commands;
});