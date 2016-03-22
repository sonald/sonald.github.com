title: "thompson nfa: a tale of fast RE"
date: 2013-06-16 23:04:33
tags: [regex, tip, c]
---

最近看了Russ Cox大神关于正则的[文章][4]。深深的被打动了。仔细看完文章之后，一时兴起，自己鼓捣了一个实现，然后再看他的代码，还是不得不佩服大神对C指针的运用。

## Russ Cox在实现时用到的一些指针技巧

* 在[nfa][6]的实现中，最有意思的地方就是PtrList的定义。一般我们在定义一个单项链表时都会定义成一个结构struct，但是在这里它被定义成union。在C中，一个union中的所有成员是共享一个地址的，怎么能表示一个链表结构呢？仔细分析后，一切就很清楚了。这里之所以可以用union的前提是基于这样一个事实，即：一个Frag中的PtrList成员所指向的是State结构中out或者out1指针的地址，在调用patch之前它的值是NULL。list1中在根据一个outp指针构造一个PtrList时是直接将其强制转换为一个PtrList。因为这个outp是某个State的out或out1的地址，还没有跟其他State连接起来（通过patch操作连接），所以这么做不会影响任何现有State对象。这个非常trick的设计需要对PtrList的作用和使用方式（在post2nfa函数中）有很深的理解。我在自己实现的时候没有使用这样的方式，目的主要是为了清晰可读。

{% codeblock PtrList lang:cpp %}
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
{% endcodeblock %}

* 在[dfa][1]的`dstate`函数实现中，当分配一个DState的内存空间时，不仅分配了DState结构体本身的内存，同时还分配了List结构中State列表的内存。这么做减少了内存分配的碎片。

{% codeblock dstate lang:cpp %}
    /* allocate, initialize new DState */
    d = malloc(sizeof *d + l->n*sizeof l->s[0]);
    memset(d, 0, sizeof *d);
    d->l.s = (State**)(d+1);
    memmove(d->l.s, l->s, l->n*sizeof l->s[0]);
    d->l.n = l->n;
{% endcodeblock %}    


* [dfa1][1]的实现加入了受控的内存使用，即只缓存特定数量的DFA状态，如果超出限制将回收当前分配的所以DState对象，回收的方法很有技巧，核心如下面的两个函数所示：

{% codeblock freestates lang:cpp %}
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
{% endcodeblock %}

也即回收之后并没用free掉之前分配的内存，而是转而将所有DState构造成一个单项链表（复用了DState的left指针）。这个链表的头是freelist。于是在分配一个DState空间时会优先检查freelist是否有项可用。

{% codeblock allocdstate lang:cpp %}
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
{% endcodeblock %}

这个技巧充分复用了已经分配的数据结构，聪明的降低了内存释放的开销。

+ `nfa-posix.y`的实现也很有意思，他的主要目的是为了实现`submatch extraction`。也就是[这里][7]提到的：
> There are two possible ways to avoid the seemingly unbounded tracking of space implied by POSIX submatching semantics. First, it turns out that matching the regular expression backward bounds the bookkeeping to being linear in the size of the regular expression. This program demonstrates the technique. 

`nfa-posix.y`采用的是逆向匹配正则，主要体现在两个地方：

{% codeblock paren lang:cpp %}
Frag
paren(Frag f, int n)
{
    State *s1, *s2;

    if(n > MPAREN)
        return f;
    s1 = state(RParen, n, f.start, NULL);
    s2 = state(LParen, n, NULL, NULL);
    patch(f.out, s2);
    return frag(s1, list1(&s2->out));
}
{% endcodeblock %}

注意这里构造的Frag的顺序，右括号指向f，f的出口指向左括号。

{% codeblock concat lang:cpp %}
concat:
    repeat
|   concat repeat
    {
        patch($2.out, $1.start);
        $$ = frag($2.start, $1.out);
    }
;
{% endcodeblock %}

可以对比下nfa里的实现，正好是反向的。$2的出口指向$1的开始。要是不细心，可能会忽略这两个微小而重要的区别。

因此，通过文中的parser构造的NFA是逆向的，所以match函数也是从字符串的尾部开始匹配。

## 我的实现
我根据[文章][4]中的描述，重写了一个实现。主要是去掉了一个静态的分配，正则的解析改用递归下降解析。并且将所有自动机内部的状态信息都封装到一个结构体中，加强了内存管理，可以释放内部创建的所有资源。我用Xcode自带的Instruments测试没有内存泄露，还算不错。我的实现放在[github][5]上了。

PS: 我将文章中相关的几个实现一起放在仓库里了，方便自己研究用。

PPS：顺便还发现了一个`nfa-posix.y`中的bug，我要不要告诉他呢。。。。纠结啊，应该是个笔误。

[1]: http://swtch.com/~rsc/regexp/dfa0.c.txt
[2]: http://swtch.com/~rsc/regexp/dfa1.c.txt
[3]: http://swtch.com/~rsc/regexp
[4]: http://swtch.com/~rsc/regexp/regexp1.html
[5]: https://github.com/sonald/thompson-nfa
[6]: http://swtch.com/~rsc/regexp/nfa.c.txt
[7]: http://swtch.com/~rsc/regexp/regexp2.html
