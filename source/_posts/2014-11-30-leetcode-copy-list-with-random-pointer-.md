title: leetcode: Copy List with Random Pointer 
date: 2014-11-30 11:25:12
tags: [algorithm]
---

[This problam][1] inspires a lot of interesting solutions. 

we can create the new list by iterating the origin list. when the origin node has a random pointer. we spawn a new node and record it in a map. the key of map is the random pointer from origin node and the value is the new node for new list. 


```C++
class Solution {
public:
    RandomListNode *copyRandomList(RandomListNode *head) {
        // old <-> new
        unordered_map<RandomListNode*, RandomListNode*> rel;
        RandomListNode* p = head;
        RandomListNode dummy {0};
        RandomListNode* res = &dummy;
        while (p) {
            if (rel.find(p) != rel.end()) {
                res->next = rel[p];
            } else {
                res->next = new RandomListNode {p->label};
            }

            if (p->random) {
                if (rel.find(p->random) == rel.end()) {
                    rel[p->random] = new RandomListNode {p->random->label};
                }
                res->next->random = rel[p->random];
            }

            p = p->next;
            res = res->next;
        }

        return dummy.next;
    }
};
```

Another interesting way of doing it w/o extra space can be accomplished by:

1. first generate new list's nodes and interleave with old list by using old node's next pointer to pointer to new node. after this done, we get one single list with two lists' nodes included and interleaved.
2. repair new list nodes' random pointer inplace.
3. split two lists apart to restore the structure.

 

```C++
class Solution {
public:
    RandomListNode *copyRandomList(RandomListNode *head) {
        RandomListNode* p = head;
        RandomListNode dummy {0};
        RandomListNode* res = &dummy;
        while (p) {
            auto* t = new RandomListNode {p->label};
            t->next = p->next;
            p->next = t;
            p = t->next;
        }

        p = head;
        while (p) {
            if (p->random)
                p->next->random = p->random->next;
            p = p->next->next;
        }

        p = head;
        if (p) { dummy.next = p->next; res = p->next; }
        while (p) {
            p->next = p->next->next;
            if (res->next) res->next = res->next->next;
            p = p->next;
            res = res->next;
        }

        return dummy.next;
    }
};
```

PS: if OJ allows me to modify the orignal list, then we can actually do it in two-pass without extra space.

```C++
class Solution {
public:
    RandomListNode *copyRandomList(RandomListNode *head) {
        RandomListNode* p = head;
        RandomListNode dummy {0};
        RandomListNode* res = &dummy;
        while (p) {
            res->next = new RandomListNode {p->label};
            res->next->random = p->random;

            auto* pp = p;
            p = p->next;
            pp->next = res->next;
            res = res->next;
        }

        res = dummy.next;
        while (res) {
            if (res->random) res->random = res->random->next;
            res = res->next;
        }
        return dummy.next;
    }
};
```

[1]: https://oj.leetcode.com/problems/copy-list-with-random-pointer/

