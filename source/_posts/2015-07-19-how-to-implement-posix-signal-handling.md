title: 如何实现简单的POSIX信号处理
date: 2015-07-19 00:28:07
tags: [os]
---

这是一篇关于POSIX信号实现机制的文章，主要是基于自己的思考、[sos][]实现以及对早期linux内核（0.11和1.0版本）的分析。这里谈论的是古老的实现方式，我不确定是否还有系统在使用类似的方法。因为这里的实现技术具有很多缺陷，在描述实现细节之后我们再来看看一些现代linux的更好的实现方式。

我将不会描述什么是信号以及如何使用信号，这方面最好的参考是UNIX环境高级编程。信号的生命周期包括生成（generate），送达（deliver）。在这里我把重点放在deliver的实现上，更精确地说，我要描述的是操作系统内核是怎么调用用户空间提前设置好的信号处理函数的。

我们都知道操作系统内核和用户程序分别运行于独立的特权级。用户空间通过受限的方式（系统调用、文件读写等）访问内核资源。用户通过使用signal或sigaction来设置信号的自定义处理函数。我们都知道，POSIX信号是异步执行的（不考虑实时信号），发送信号的时刻与该信号相关的处理可能会相隔很远，具体要看是什么信号以及进程所处的状态。当信号最终被送达目标进程并被处理时，内核并不能直接调用自定义的信号处理函数，因为它所处的内存页是用户级的（准确的说其实是可以的，高特权级的代码是可以调用低特权级代码的，但由于各种安全原因并不会直接调用）。为了执行一段用户态的代码，内核需要使用一些技巧。

在x86系统下，如果代码要从高特权级（内核）跳转到一个低特权级（用户态）的代码段最基本的方法是手工构造一个iret调用。基本上这是所有中断服务例程返回用户态的方法。而处理函数执行的就是利用了这个iret指令。基本思路是：

iret指令返回用户态时会从内核栈中弹出五个数据，分别是用户态的ss、esp、eflags，cs、eip。eip是执行系统调用的中断指令的下一条指令的地址。在正常情况下，iret将返回到eip地址处继续用户程序的执行。如果我们在iret执行前，修改了内核栈中对应eip位置的值，让其指向用户先前设置的信号处理函数的地址，那么iret返回后不就执行信号处理函数了吗。但是事情还没完，函数执行时，我们需要给它提供一个参数。而且这个函数执行完成后会返回哪里呢？合理的情况下当然是返回修改eip前，iret应该返回的位置。这么一来就清楚了，我们需要手动为信号处理函数在用户态的栈空间里建立一个栈帧，设置函数的参数和返回地址。这里有一个细节问题，那就是当我们手动建立栈帧时，势必修改了用户esp的值，而且信号处理函数有可能改动了某些寄存器的值。我们在处理函数ret之前要把现场恢复到原始状态，就好像iret是直接返回的一样。

根据上面的描述，我们来看一个具体的实现，也就是[sos][]的[handle_signal][]。在实现上面的机制时，有很多的选择性。比如如何保存和恢复现场，我所采用的方法基本上跟linux 0.11版本一样（后来我看过几个其他的简单内核，其思路基本也是一样的）。这个函数目前实现不完整，但是表达了基本的要素。当检查到用户设置了自定义的处理函数时，就着手构造一个处理函数执行的环境。这段代码不长，我直接贴出来：

``` c
    uint32_t oesp = regs->useresp;    
    uint32_t* ustack = (uint32_t*)((char*)oesp - sizeof(sigcontext_t));
    sigcontext_t ctx;
    ctx.eax = regs->eax;
    ctx.ebx = regs->ebx;
    ctx.ecx = regs->ecx;
    ctx.edx = regs->edx;
    ctx.esi = regs->esi;
    ctx.edi = regs->edi;
    ctx.ebp = regs->ebp;
    ctx.uesp = regs->useresp;
    ctx.eip = regs->eip;
    ctx.sig_mask = current->sig.blocked;
    memcpy(ustack, &ctx, sizeof(sigcontext_t));

    // trampoline code
    // movl SYS_sigreturn, %eax
    // int $0x80
    // ret
    char* code = (char*)ustack - 1;
    *code-- = 0xc3; // ret
    *code-- = 0x80; 
    *code = 0xcd; // int $0x80
    code -= 4;
    *(uint32_t*)code = SYS_sigreturn;
    code--;
    *code = 0xb8;

    signal_dbg("save at 0x%x, code at 0x%x, new eip 0x%x\n",
            ustack, code, handler);
    ustack = (uint32_t*)code - 2;
    ustack[0] = (uint32_t)code;
    ustack[1] = sig;
    regs->eip = (uint32_t)handler;
    regs->useresp = (uint32_t)ustack;
```

可以分几个部分来看这段代码：

- 首先是保存原始环境。regs指向内核栈iret返回前的中断上下文。我在用户栈的栈顶位置开辟一个空间来保存（sigcontext_t结构）。
- 然后是一段硬编码的x86 32位代码，如注释所示，它构造了一个函数，这个函数执行了一个系统调用SYS_sigreturn。如果你去看[sys_sigreturn][]的代码，你就知道它是用来恢复现场的。可以看出来，这段代码存放在用户栈中。
- 最后修改了regs的eip，使其指向信号处理函数。而useresp指向新的ustack位置。ustack的栈底最后两个位置一个是信号处理函数的参数（即信号值）以及返回地址。返回地址指向了硬编码的那段代码的第一条指令的地址。于是在信号处理函数执行完成后，会跳转到上面的那段代码，该代码立即执行一个系统调用来恢复被信号处理函数改变的现场。

需要注意的是，上面的方法是不安全的，而且也不具有可移植性。现代的操作系统应该不会允许用户栈具有可执行权限（在linux下可以用cat /proc/self/maps看看[stack]区域）。而硬编码指令的做法也无法在不同的体系结构下运行。所以现代linux在恢复信号处理后的现场时，采用了其他技术（比如利用vdso和c库配合），这个下回分解。





PS：这有一个方便的查询linux系统调用的[网址][syscall_ref]，挺方便的。

PPS：[sos][]是我自己写的一个简单内核，极度不完善。



[syscall_ref]: http://syscalls.kernelgrok.com
[sos]: http://github.com/sonald/sos
[handle_signal]: https://github.com/sonald/sos/blob/master/kern%2Fcore%2Fsignal.cc#L216
[sys_sigreturn]: https://github.com/sonald/sos/blob/master/kern%2Fcore%2Fsignal.cc#L191

