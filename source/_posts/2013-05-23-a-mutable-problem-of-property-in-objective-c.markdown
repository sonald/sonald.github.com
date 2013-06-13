---
layout: post
title: "NSMutableString may be immutable"
date: 2013-05-23T18:20:05+08:00
comments: true
external-url: 
tags: [objc]
---

因为有了一个苹果本，感觉不学点Objective C，不搞点iOS开发有点浪费。最近在学习Objective C的时候遇到一个坑，经过一点实验，终于想明白是怎么回事了。记下来算是个学习笔记。

长话短说，下面的代码会运行时崩溃。

    
    #include <Foundation/Foundation.h>
    
    @interface Command: NSObject
    @property (nonatomic, copy) NSMutableString *name;
    @end
    
    @implementation Command
    @end
    
    int main(int argc, char** argv) {
        Command *c1 = [[Command alloc] init];
        c1.name = [NSMutableString stringWithUTF8String:"list-panes"];
    
        NSMutableString *n = c1.name;
        [n appendString:@"(target)"];
        return 0;
    }    
    
原因是因为name属性设置了copy标志。这个copy告诉编译器生成类似下面的setter

    - (void) setName: (NSMutableString *)data {
        name = [data copy] ;
    }
    
虽然NSString遵循了NSMutableCopying协议，但是由于赋值时得到的是copy返回的对象而不是mutableCopy，所以虽然`c1.name`返回的是一个NSMutableString，但是无法修改。这个解释听起来还算合理。

**但是为什么一个NSMutableString实例是无法修改的呢？** 难道`c1.name`返回的其实不是一个NSMutableString？于是我打印出它的类型：

    NSLog(@"class: %@", [c1.name class]);
    NSLog(@"class: %@", [NSMutableString class]);
    
输出的结果是

    2013-05-24 00:04:24.395 a.out[58754:707] class: __NSCFString
    2013-05-24 00:04:24.396 a.out[58754:707] class: NSMutableString

这个完全出乎我的意料，对于刚刚接触Objective C的我来说，这太诡异了。于是我仔细查看了NSString的参考手册。里面有这么一段：

>Because of the nature of class clusters, string objects aren’t actual 
>instances of the NSString or NSMutableString classes but of one of their 
>private subclasses. Although a string object’s class is private, its interface 
>is public, as declared by these abstract superclasses, NSString and 
>NSMutableString. The string classes adopt the NSCopying and NSMutableCopying 
>protocols, making it convenient to convert a string of one type to the other.

基本意思就是说其实由NSString或NSMutableString构造出来的对象是某私有子类的类型。可以用类型检查来证实：

    
    NSString* s = [NSString stringWithUTF8String: "wor"];
    NSLog(@"kind of NSMutableString: %u", [s isKindOfClass: [NSMutableString class]]);
    NSLog(@"kind of NSString: %u", [s isKindOfClass: [NSString class]]);
    
    NSMutableString* ms = [NSMutableString stringWithUTF8String: "helo"];
    NSLog(@"kind of NSMutableString: %u", [ms isKindOfClass: [NSMutableString class]]);
    NSLog(@"kind of NSString: %u", [ms isKindOfClass: [NSString class]]);

输出结果是：
    
    2013-05-24 00:28:33.995 a.out[58996:707] kind of NSMutableString: 1
    2013-05-24 00:28:33.996 a.out[58996:707] kind of NSString: 1
    2013-05-24 00:28:33.997 a.out[58996:707] kind of NSMutableString: 1
    2013-05-24 00:28:33.998 a.out[58996:707] kind of NSString: 1
    
这说明两个string类型其实都是某个类型的子类型。

于是我仔细翻查了官方文档，发现在Foundation框架中有一个叫[类簇(class cluster)][1]的技术。在Foundation框架中有很多类簇，比如NSNumber，目的是减少暴露出来的公共类的数量，用私有子类来实现，这样使得外部接口简洁易用。具体信息可以参考苹果的[文档][1]。所以表面上你得到的是一个NSMutableString的指针，但是由于使用了immutable copy，系统进行了优化，返回给你的其实是一个不可修改的string object。要更深入的理解最好去看官方文档。

[1]: https://developer.apple.com/library/mac/#documentation/General/Conceptual/CocoaEncyclopedia/ClassClusters/ClassClusters.html#//apple_ref/doc/uid/TP40010810-CH4-SW1
