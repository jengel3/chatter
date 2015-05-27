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

0. ```message [channel, message]``` - Triggered when a message is received.
0. ```sentMessage [receiver, message]``` - Triggered when a message is sent.
0. ```topic [channel, topic, nick]``` - Triggered when the topic is changed.
0. ```join [channel]``` - Triggered when a user joins a channel.
0. ```self:join [channel]``` - Triggered when the client joins a channel.
0. ```part [channel]``` - Triggered when a user leaves a channel.
0. ```self:part [channel]``` - Triggered when the client leaves a channel.
0. ```part [channel]``` - Triggered when a user quits a channel.
0. ```self:quit [channel]``` - Triggered when the client quits a channel.
0. ```client:error [message]``` - Triggered when the client throws an error.
0. ```client:connect [connection]``` - Triggered when a client connects to a server successfully.
0. ```client:disconnect [connection]``` - Triggered when a client disconnects from a server.
0. ```focus:channel [channel]``` - Triggered when a channel is focused by being clicked on or joined.