title: "leetcode: path sum"
date: 2014-11-11 23:04:38
tags: [algorithm]
---

这个问题其实很简单，DFS的基础，所以我写了4个版本。第一个是递归，其实效率在4个里面算很好的，递归真的是简洁而优雅。

```
	public:
	    bool hasPathSum(TreeNode *root, int sum) {
	        if (!root) return false;
	        if (!root->left && !root->right) 
	            return root->val == sum;

	        return hasPathSum(root->left, sum-root->val) || hasPathSum(root->right, sum-root->val);
		    }
		};
		
```

第二个非递归版本，用sp模拟栈，accessed记录访问过的节点。

```
	class Solution2 {
	public:
	    bool hasPathSum(TreeNode *root, int sum) {
	        if (!root) return false;

	        std::vector<TreeNode*> sp;
	        unordered_map<TreeNode*, bool> accessed;

	        sp.push_back(root);
	        int len = 0;
	        while (sp.size()) {    
	            auto* np = sp.back();
	            if (np->left && !accessed[np->left]) {
	                len += np->val;                        
	                sp.push_back(np->left);
	            } else if (np->right && !accessed[np->right]) {
	                len += np->val;                                        
	                sp.push_back(np->right);
	            } else {
	                if (!np->left && !np->right)
	                    if (len + np->val == sum) return true;
	                accessed[np] = true;
	                sp.pop_back();
	                if (sp.size()) len -= sp.back()->val;
	            }
	        }

	        return false;
	    }
	};

```
后面两个比较有意思，Solution3是一个intrusive版本，它在下降过程中修改子节点的val值，使得每个节点保存从根节点到达的路径的sum。这样，当遇到叶子节点时就知道这条路径的sum大小。

```
	class Solution3 {
	public:
	    bool hasPathSum(TreeNode *root, int sum) {
	        if (!root) return false;

	        std::vector<TreeNode*> sp;
	        sp.push_back(root);
	        while (sp.size()) {    
	            auto* np = sp.back();
	            sp.pop_back();

	            if (!np->left && !np->right) {                
	                if (np->val == sum) return true;
	            }

	            if (np->left) {
	                np->left->val += np->val;                        
	                sp.push_back(np->left);
	            }
	            if (np->right) {
	                np->right->val += np->val;                                        
	                sp.push_back(np->right);
	            }
	        }

	        return false;
	    }
	};
```

第四个版本比较有意思，基础是morris遍历，所用得技巧跟第三版本比较类似，就是在下降过程中修改节点的val值，保存路径的sum大小。关键就是在哪几个地方做这个事情。看代码不如画图，画张图就清楚了。代码里的注释解释了一个问题，就是在找到一个解时不能直接`return true`。大概是leetcode提交环境的问题，因为morris遍历修改了每个节点的左子树的最右节点的right指向，leetcode希望树结构保持不变。

```
	class Solution4 {
	public:
	    bool hasPathSum(TreeNode *root, int sum) {
	        if (!root) return false;

	        bool ret = false;
	        TreeNode* nd = root;
	        while (nd) {
	            if (!nd->left) {
	                //NOTE: can not write `return true` here. since morris traversion modified
	                //struture of tree, we need to run over to make sure all changes restored.
	                //because of this, this may not as fast as primitive solution.
	                if (!nd->right && nd->val == sum) ret = true;
	                if (nd->right) nd->right->val += nd->val;                
	                nd = nd->right;
	            } else {
	                auto* l = nd->left;
	                while (l->right && l->right != nd) l = l->right;
	                if (l->right == nd) {
	                    if (!l->left && l->val == sum) ret = true;                                                                        
	                    nd = nd->right;
	                    l->right = nullptr;
	                } else {
	                    nd->left->val += nd->val;                    
	                    if (nd->right) nd->right->val += nd->val;                    
	                    l->right = nd;
	                    nd = nd->left;
	                }
	            }
	        }

	        return ret;
	    }
	};
```
