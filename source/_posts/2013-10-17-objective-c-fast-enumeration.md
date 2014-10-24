title: Objective C fast enumeration
date: 2013-10-17 15:24:52
tags: [objc]
---

了解Objective C的都知道，Objective C在C原有的for基础上增加了一个新的语言特性*fast enumeration*。[官方文档][fastenum]里提到*fast enumeration*要比使用NSEnumerator快，我想不是很多人知道或者想过为什么*fast enumeration*会更快。

首先，一个Objective C的类要支持*fast enumeration*就必须实现**NSFastEnumeration**协议。这个协议只有一个方法**countByEnumeratingWithState:objects:count:**，官方文档写的不太清楚，估计只看这个没人知道怎么自己实现一个支持*fast enumeration*的类。我们可以看看GNUStep里[NSArray][]的实现作为参考（Cocoa框架不开源）：

```objectivec
    
    - (NSUInteger) countByEnumeratingWithState: (NSFastEnumerationState*)state
    				   objects: (__unsafe_unretained id[])stackbuf
    				     count: (NSUInteger)len
    {
      NSUInteger size = [self count];
      NSInteger count;
    
      /* This is cached in the caller at the start and compared at each
       * iteration.   If it changes during the iteration then
       * objc_enumerationMutation() will be called, throwing an exception.
       */
      state->mutationsPtr = (unsigned long *)size;
      count = MIN(len, size - state->state);
      /* If a mutation has occurred then it's possible that we are being asked to
       * get objects from after the end of the array.  Don't pass negative values
       * to memcpy.
       */
      if (count > 0)
        {
          IMP	imp = [self methodForSelector: @selector(objectAtIndex:)];
          int	p = state->state;
          int	i;
    
          for (i = 0; i < count; i++, p++)
    	{
    	  stackbuf[i] = (*imp)(self, @selector(objectAtIndex:), p);
    	}
          state->state += count;
        }
      else
        {
          count = 0;
        }
      state->itemsPtr = stackbuf;
      return count;
    }

```

代码很简单，就是从数组中取出连续的一部分，通过参数state传给调用者。这个函数会被编译器生成的代码调用。

下面一段简单的代码使用了**fast enumeration**：

```objectivec

    void fastEnum()
    {
        NSArray *arr = @[@"one", @"two", @"three"];
        for (id s in arr) {
            NSLog(@"val: %@", s);
        }
    }


```

编译器生成的代码大概是这样的：

```objectivec
    
    void fastEnum()
    {
        NSArray *arr = ((NSArray *(*)(id, SEL, const id *, NSUInteger))(void *)objc_msgSend)(
                objc_getClass("NSArray"),
                sel_registerName("arrayWithObjects:count:"),
                (const id *)__NSContainer_literal(3U,
                    (NSString *)&__NSConstantStringImpl__var_folders_c4_mzdkvk5n677bsntjw9d7qtzw0000gn_T_Untitled_9O7vfS_mi_0,
                    (NSString *)&__NSConstantStringImpl__var_folders_c4_mzdkvk5n677bsntjw9d7qtzw0000gn_T_Untitled_9O7vfS_mi_1,
                    (NSString *)&__NSConstantStringImpl__var_folders_c4_mzdkvk5n677bsntjw9d7qtzw0000gn_T_Untitled_9O7vfS_mi_2).arr,
                3U);
        
    {
    	id s;
    	struct __objcFastEnumerationState enumState = { 0 };
    	id __rw_items[16];
    	id l_collection = (id) arr;
    	unsigned long limit =
    		((unsigned int (*) (id, SEL, struct __objcFastEnumerationState *, id *, unsigned int))(void *)objc_msgSend)
    		((id)l_collection,
    		sel_registerName("countByEnumeratingWithState:objects:count:"),
    		&enumState, (id *)__rw_items, (unsigned int)16);
    	if (limit) {
    	unsigned long startMutations = *enumState.mutationsPtr;
    	do {
    		unsigned long counter = 0;
    		do {
    			if (startMutations != *enumState.mutationsPtr)
    				objc_enumerationMutation(l_collection);
    			s = (id)enumState.itemsPtr[counter++]; {
            NSLog((NSString *)&__NSConstantStringImpl__var_folders_c4_mzdkvk5n677bsntjw9d7qtzw0000gn_T_Untitled_9O7vfS_mi_3, s);
        };
    	__continue_label_1: ;
    		} while (counter < limit);
    	} while (limit = ((unsigned int (*) (id, SEL, struct __objcFastEnumerationState *, id *, unsigned int))(void *)objc_msgSend)
    		((id)l_collection,
    		sel_registerName("countByEnumeratingWithState:objects:count:"),
    		&enumState, (id *)__rw_items, (unsigned int)16));
    	s = ((id)0);
    	__break_label_1: ;
    	}
    	else
    		s = ((id)0);
    	}
    
    }

```

这段代码是通过`clang -x objective-c -fobjc-arc -rewrite-objc test.m`生成的，去掉其他框架代码，只留下fastEnum的实现。
对比一下，可以看到，编译器生成了两层while循环，外层循环每次调用**countByEnumeratingWithState:objects:count:**读取16个连续的对象，内层循环逐个访问对象并检查集合是否发生了修改（如果发生了修改，则调用**objc_enumerationMutation**抛出异常）。**fast enumeration**性能的关键是**countByEnumeratingWithState:objects:count:**如何快速批量读取连续的对象。但是如果是像GNUStep里的实现，在性能上就不会有太大的优势。因为使用了objectAtIndex逐个取出对象，这跟NSEnumerator取出对象的方法类似。所以我估计苹果在自己的实现中使用了一些技巧，能够直接访问到NSArray的内部数据，而不是通过objactAtIndex逐个读取。

这里有一个[性能测试][perf]，可以看到当集合里的对象数量足够多的时候，**fast enumeration**的优势还是很明显的。

PS: [这里][custom]有一个如何在自定义类中实现MSFastEnumeration的说明，可以对如何合理的实现**countByEnumeratingWithState:objects:count:**有一个认识。

[perf]: http://darkdust.net/writings/objective-c/nsarray-enumeration-performance
[tech]: http://www.mikeash.com/pyblog/friday-qa-2010-04-09-comparison-of-objective-c-enumeration-techniques.html
[fastenum]: https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ProgrammingWithObjectiveC/FoundationTypesandCollections/FoundationTypesandCollections.html#//apple_ref/doc/uid/TP40011210-CH7-SW28
[NSArray]: http://code.ohloh.net/file?fid=rBQ8ejiDJHQ_lQYdK8w5SEehznQ&cid=UA1S9WRENpI&s=NSArray%20&pp=0&fp=296183&ff=1&filterChecked=true&mp=1&ml=1&me=1&md=1#L1
[custom]: http://www.mikeash.com/pyblog/friday-qa-2010-04-16-implementing-fast-enumeration.html
