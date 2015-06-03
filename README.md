# Chatter [![Build Status](https://img.shields.io/travis/Jake0oo0/chatter.svg?style=flat-square)](https://travis-ci.org/Jake0oo0/chatter) [![Code Climate](https://img.shields.io/codeclimate/github/Jake0oo0/chatter.svg?style=flat-square)](https://codeclimate.com/github/Jake0oo0/chatter)


Chatter is an IRC client built on [node.js](https://nodejs.org/), [nw.js](https://github.com/nwjs), and [Backbone](http://backbonejs.org/). The primary goal of Chatter is to provide an easy to use, cross-platform and efficient IRC client. 

## Developing
0. Run ```gulp``` to compile app files and serve the application. Files will be watched and automatically updated.

## Building
0. Run ```npm install```
0. Run ```bower install```
0. Run ```gulp build```
0. Access compiled files in ```./build/Chatter/os/```

## Event API

Chatter provides a short list of events based on Backbone's [event protocol](http://backbonejs.org/#Events). These events can be accessed through the window Chatter object.

* ```message [channel, message]``` - Triggered when a message is received.
* ```sentMessage [receiver, message]``` - Triggered when a message is sent.
* ```topic [channel, topic, nick]``` - Triggered when the topic is changed.
* ```join [channel]``` - Triggered when a user joins a channel.
* ```self:join [channel]``` - Triggered when the client joins a channel.
* ```part [channel]``` - Triggered when a user leaves a channel.
* ```self:part [channel]``` - Triggered when the client leaves a channel.
* ```part [channel]``` - Triggered when a user quits a channel.
* ```self:quit [channel]``` - Triggered when the client quits a channel.
* ```client:error [message]``` - Triggered when the client throws an error.
* ```client:connect [connection]``` - Triggered when a client connects to a server successfully.
* ```client:disconnect [connection]``` - Triggered when a client disconnects from a server.
* ```focus:channel [channel]``` - Triggered when a channel is focused by being clicked on or joined.

Example:

```js
Chatter.vent.on('self:join', function(channel) {
  console.log("Joined", channel.get('name'));
});
```