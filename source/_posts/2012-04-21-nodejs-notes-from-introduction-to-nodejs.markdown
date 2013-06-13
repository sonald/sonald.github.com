---
layout: post
title: "Nodejs: notes from introduction to Nodejs"
date: 2012-04-21 17:06
comments: true
tags: [nodejs]
---

I just watched [Introduction to Node.js with Ryan Dahl][1], here are some quick notes.

* There are no dom and window global object, cause it's not in web browser environment. 
Nodejs is used to do server side javascript, and as it promise do web the right way.
It basically provides a common api and a way to communicate with system. such as get
pid by accessing global object process.

* old setTimeout is provided. so anyone who is familiar with browser side js should be feel 
comfortable. node implicitly starts the event loop after all things setup. so 
 
```javascript
#!/usr/bin/env node
// simple hello-world.js demo
console.log('Hello');
setTimeout(function() {
    console.log('World');
}, 2000);
```

when you call it with `node hello-world.js`, it ends right after two seconds. Node knows when 
to drop out once all callbacks and all timouts get done.

* write a simple http server with Node is just like something below:
```javascript
#!/usr/bin/env node
// simple hello-http.js demo
var http = require('http');
http.createServer(function(req, resp) {
    resp.writeHead(200, {'content-type': 'text/plain'});
    resp.end("Hello, World\n");
}).listen(8000);
```

start it with `node hello-http.js` and use `curl -i http://localhost:8000/`, you will get response
```
HTTP/1.1 200 OK
content-type: text/plain
Connection: keep-alive
Transfer-Encoding: chunked

Hello, World
```

Notice that header include `Transfer-Encoding: chunked`, it means streamming which makes it possible to 
encode chunks to send a variable length respone.

* then here comes a simple chat server,  and I rewrite it a little bit but remains the spirit.
```javascript
#!/usr/bin/env node
var net = require('net');
var connections = []

function broadcast(msg, skip) {
    for (i = 0; i < connections.length; i += 1) {
        if (connections[i] !== skip)
            connections[i].write(msg);
    }
}

net.createServer(function(conn) {
    connections.push(conn);

    conn.on('data', function(chunk) {
        broadcast(chunk, conn);
    })
    .on('end', function() {
        connections.splice(connections.indexOf(conn),1);
    });

}).listen(8000);
```



[1]: http://www.youtube.com/watch?v=jo_B4LTHi3I&hd=1
