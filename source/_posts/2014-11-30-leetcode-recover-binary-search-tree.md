title: leetcode: Recover Binary Search Tree
date: 2014-11-30 00:21:28
tags: [algorithm]
---
[The problam][1] is fun. The note says 
> A solution using O(n) space is pretty straight forward. Could you devise a constant space solution?

I first devise a way to detect mis-placed elements in one pass with a stack. the idea is quite simple after you thought through:

traverse the tree inorderly, the elements should appear in ascending order. the ones that disobey the rule are our spots.

```C++
class Solution {
public:
    TreeNode* n1 = nullptr, *n2 = nullptr;
    void recoverTree(TreeNode *root) {
        if (!root) return;

        vector<TreeNode*> sp;
        TreeNode* nd = root, *prev = nullptr;
        while (sp.size() || nd) {
            while (nd) { sp.push_back(nd); nd = nd->left; }
            nd = sp.back(); sp.pop_back();
            if (n1 && n1->val < nd->val) break;

            if (prev && prev->val > nd->val) {
               if (!n1) {
                   n1 = prev;
                   n2 = nd;
               } else { n2 = nd; break; }
            }
            prev = nd;
            nd = nd->right;
        }

        std::swap(n1->val, n2->val);
    }
};
```

Then it is easy to trasfer the above into a O(1) space solution with morris inorder traversal.

```C++
class Solution2 {
public:
    TreeNode* n1 = nullptr, *n2 = nullptr;
    void recoverTree(TreeNode *root) {
        if (!root) return;

        TreeNode* prev = nullptr, *cur = nullptr;
        while (root) {
            if (!root->left) {
                prev = cur; cur = root;
                root = root->right;
            } else {
                auto* l = root->left;
                while (l->right && l->right != root) l = l->right;
                if (l->right == root) {
                    prev = cur; cur = root;
                    root = root->right;
                    l->right = nullptr;
                } else {
                    l->right = root;
                    root = root->left;
                }
            }
            if (prev && prev->val > cur->val) {
                if (!n1) { n1 = prev; n2 = cur; } 
                else { n2 = cur; }
            }
        }

        std::swap(n1->val, n2->val);
    }
};
```

PS: I found there is also a [solution][2] that first cleverly transforms the tree into an ordered linked-list and then detects the misplaced elements and then restore it back. 

[1]: https://oj.leetcode.com/problems/recover-binary-search-tree/
[2]: https://oj.leetcode.com/discuss/14863/share-my-o-n-time-o-1-space-solution