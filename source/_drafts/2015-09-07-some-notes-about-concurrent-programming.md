title: some rambling notes about concurrent programming

date: 2015-09-07 16:53:28

## tags: [concurrent]



关于多处理器环境和多线程程序的问题

volatile是干什么 ，能干什么，不能干什么

内存屏障（memory barrier或者fence）

与acquire  / release的区别

happens-before语意  

synchronize-with语意

why, when, and how memory barrier is needed.

software layer: compiler reorder 

hardware layer: cpu reorder, store reorder (micro op layer)

why: micro architecture related. cpu micro ops pipelined and reordered

read/store-buffers and invalidation queue exists.

MESI only care about cache coherence.

CACHE and SMP. 

uniprocessor has no issues even in multi-thread tasks. it is sequentially consistent.

