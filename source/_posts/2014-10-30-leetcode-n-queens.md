title: "leetcode: n queens"
date: 2014-10-30 22:18:03
tags: [algorithm]
---
这个题基本没什么好说的了，经典回溯算法。主要问题在于如何快速剪支。我使用了三个数组来追踪每列，每条对角线以及反向对角线上是否有冲突。看了几个网上的实现，都是在放置一个皇后之后，通过计算两个坐标是否同线来判断是否（反）对角线冲突。而我是直接计算出皇后所处位置的对角线（用一个数来表示）。

```c++
class Solution {
public:
    std::vector<bool> cols;
    std::vector<bool> diags;
    std::vector<bool> rdiags;
    
    vector<vector<string> > solveNQueens(int n) {
        cols = std::vector<bool>(n, false);
        diags = std::vector<bool>(n, false);
        rdiags = std::vector<bool>(n, false);

        vector<vector<string>> res;
        if (n <= 0) return res;

        std::vector<string> ans(n, string(n, '.'));
        solve(res, ans, n, 0);
        return res;
    }

    void solve(vector<vector<string>>& res, vector<string>& board, int n, int row) {
        if (row == n) {
            res.push_back((board));
            return;
        }

        for (int i = 0; i < n; i++) {
            int d = row + i, rd = n - 1 - row + i;
            if (!cols[i] && !diags[d] && !rdiags[rd]) {
                board[row][i] = 'Q';
                cols[i] = diags[d] = rdiags[rd] = true;
                solve(res, board, n, row+1);
                cols[i] = diags[d] = rdiags[rd] = false;
                board[row][i] = '.';
            }
        }
    }
};

```
