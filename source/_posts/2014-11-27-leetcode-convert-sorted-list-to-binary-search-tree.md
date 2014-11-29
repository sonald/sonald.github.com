title: leetcode: Convert Sorted List to Binary Search Tree
date: 2014-11-27 18:25:52
tags: [algorithm]
---
If you have solved the previous problem, then it can be done by first convert the list into a vector and then do the same thing as the previous problem does. The interesting way is to do it on the list itself and almost O(1) space used. 

The idea is thus:

1. first, get length of the list
2. recursively build left subtree bottom up 
3. create current root and move list pointer to next element
4. recursively build right subtree bottom up
5. return the root

My orignal solution uses an instance memeber `ListNode* cur` to remember current position of list. but I see some guys using reference to ListNode pointer to finish the job which I think more elegant.

```C++
class Solution {
public:
    TreeNode *sortedListToBST(ListNode *head) {
        int n = 0;
        ListNode* p = head;
        while (p) { n++; p = p->next; }
        return helper(head, n);
    }

    TreeNode* helper(ListNode* &h, int n) {
        if (n == 0) return nullptr;
        auto* left = helper(h, n/2);
        auto* root = new TreeNode {h->val};
        h = h->next;
        root->left = left;
        root->right = helper(h, n - n/2 - 1);
        return root;
    }
};
```

**PS**: I believe the space complexity is O(lgN) due to stack usage.