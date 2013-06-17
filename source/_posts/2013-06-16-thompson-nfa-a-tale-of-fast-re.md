title: thompson nfa: a tale of fast RE
date: 2013-06-16 23:04:33
tags: [regex, tip]
---

最近看了Russ Cox大神关于正则的[文章][4]。深深的被打动了。仔细看完文章之后，一时兴起，自己鼓捣了一个实现，然后再看他的代码，还是不得不佩服大神对C的指正的理解。

## Russ Cox在实现时用到的一些指针技巧

+ 在[nfa][6]的实现中，最有意思的地方就是PtrList的定义。一般我们在定义一个单项链表时都会定义成一个结构struct，但是在这里它被定义成union。在C中，一个union中的所有成员是共享一个地址的，怎么能表示一个链表结构呢？仔细分析后，一切就很清楚了。这里之所以可以用union的前提是基于这样一个事实，即：一个Frag中的PtrList成员所指向的是State结构中out或者out1指针的地址，在调用patch之前它的值是NULL。list1中在根据一个outp指针构造一个PtrList时是直接将其强制转换为一个PtrList。因为这个outp是某个State的out或out1的地址，还没有跟其他State连接起来（通过patch操作连接），所以这么做不会影响任何现有State对象。这个非常trick的设计需要对PtrList的作用和使用方式（在post2nfa函数中）有很深的理解。我在自己实现的时候没有使用这样的方式，目的主要是为了清晰可读。

```C

    /*
     * Since the out pointers in the list are always 
     * uninitialized, we use the pointers themselves
     * as storage for the Ptrlists.
     */
    union Ptrlist
    {
    	Ptrlist *next;
    	State *s;
    };
    
    /* Create singleton list containing just outp. */
    Ptrlist*
    list1(State **outp)
    {
    	Ptrlist *l;
    	
    	l = (Ptrlist*)outp;
    	l->next = NULL;
    	return l;
    }

```



+ 在[dfa][1]的`dstate`函数实现中，当分配一个DState的内存空间时，不仅分配了DState结构体本身的内存，同时还分配了List结构中State列表的内存。这么做减少了内存分配的碎片。

```C

    /* allocate, initialize new DState */
    d = malloc(sizeof *d + l->n*sizeof l->s[0]);
    memset(d, 0, sizeof *d);
    d->l.s = (State**)(d+1);
    memmove(d->l.s, l->s, l->n*sizeof l->s[0]);
    d->l.n = l->n;
    
```

+ [dfa1][1]的实现加入了受控的内存使用，即只缓存特定数量的DFA状态，如果超出限制将回收当前分配的所以DState对象，回收的方法很有技巧，核心如下面的两个函数所示：

```C

    /* Free the tree of states rooted at d. */
    void
    freestates(DState *d)
    {
    	if(d == NULL)
    		return;
    	freestates(d->left);
    	freestates(d->right);
    	d->left = freelist;
    	freelist = d;
    }


    /* Throw away the cache and start over. */
    void
    freecache(void)
    {
    	freestates(alldstates);
    	alldstates = NULL;
    	nstates = 0;
    }

```

也即回收之后并没用free掉之前分配的内存，而是转而将所有DState构造成一个单项链表（复用了DState的left指针）。这个链表的头是freelist。于是在分配一个DState空间时会优先检查freelist是否有项可用。

```C

    /* Allocate DStates from a cached list. */
    DState*
    allocdstate(void)
    {
    	DState *d;
    	
    	if((d = freelist) != NULL)
    		freelist = d->left;
    	else{
    		d = malloc(sizeof *d + nstate*sizeof(State*));
    		d->l.s = (State**)(d+1);
    	}
    	d->left = NULL;
    	d->right = NULL;
    	memset(d->next, 0, sizeof d->next);
    	return d;
    }

```

这个技巧充分复用了已经分配的数据结构，聪明的降低了内存释放的开销。

## 我的实现
我根据[文章][4]中的描述，重写了一个实现。主要是去掉了一个静态的分配，正则的解析改用递归下降解析。并且将所有自动机内部的状态信息都封装到一个结构体中，加强了内存管理，可以释放内部创建的所有资源。我用Xcode自带的Instruments测试没有内存泄露，还算不错。我的实现放在[github][5]上了。


[1]: http://swtch.com/~rsc/regexp/dfa0.c.txt
[2]: http://swtch.com/~rsc/regexp/dfa1.c.txt
[3]: http://swtch.com/~rsc/regexp
[4]: http://swtch.com/~rsc/regexp/regexp1.html
[5]: https://github.com/sonald/thompson-nfa
[6]: http://swtch.com/~rsc/regexp/nfa.c.txt