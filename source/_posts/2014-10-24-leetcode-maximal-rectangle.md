title: leetcode maximal rectangle
date: 2014-10-24 09:40:01
tags: [algorithm]
---

算法思路想到之后发现其实还是很简单的，算法复杂度是O(n*m)，基本上只要扫描两遍矩阵就能得到结果。
算法分两步：

* 首先扫描一遍做预处理，生成一个新矩阵M1。M1[i][j]代表第j列上从i行到0行连续的‘1’的个数。
比如一个这样的原矩阵

    
        {'0', '0', '0', '1', '0'},
        {'1', '0', '1', '1', '0'},
        {'1', '1', '0', '1', '1'},
        {'1', '1', '1', '1', '0'},
        {'0', '1', '1', '1', '0'}
    
经过预处理变成

        {0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0, 1, 0}，
        {0, 1, 0, 1, 2, 0}，
        {0, 2, 1, 0, 3, 1},
        {0, 3, 2, 1, 4, 0},
        {0, 0, 3, 2, 5, 0}
       
注意我把M1矩阵增广了（augmented），第一行和第一列全空，这样的目的是方便后面的遍历算法边界条件处理更容易。

```c++
      int rows = matrix.size(), cols = matrix[0].size();
      vector<vector<int>> collect(rows+1, vector<int>(cols+1, 0));
      for (int i = 1; i <= rows; i++) {
          for (int j = 1; j <= cols; j++) {
              if (matrix[i-1][j-1] == '1') {
                  collect[i][j] = collect[i-1][j] + 1;
                }
            }
        }
```   

* 按行遍历M1矩阵
    
    在遍历一行的第j列时，我们要实时计算出当前最大的全1子矩阵的面积。为此，我使用一个栈来记录一些状态。这个栈的每一项是一个pair（`std::vector<pair<int, int>> sp;`）。second记录列号，first是所指列的高度。这个栈追踪从当前离j列最近的一个高度为0的列开始，到j列的所有高度低于j列的列的信息（高度大于j列的列都从栈里弹出了）。因此这个栈里的元素是按高度单调递增的（从栈底至栈顶）。这个栈的作用是用来计算包含当前行的j列的所有全1子矩阵的大小。不记录高度大于j列的列是因为它的宽度肯定为1，已经在遍历到达j列之前做为全1子矩阵计算过了。
    

```c++
    for (int i = 1; i <= rows; ++i) {
            std::vector<pair<int, int>> sp; // <high, index>
            sp.emplace_back(0, 0);
            for (int j = 1; j <= cols; j++) {
            int k = collect[i][j];
            while (sp.size() && sp.back().first >= k) {
                sp.pop_back();
            }
            sp.emplace_back(k, j);

            for (int p = 1; p < sp.size(); p++) {
                auto h = sp[p].first;
                auto w = j - sp[p-1].second;
                if (max < w * h) {
                    max = w * h;
                }
            }
        }
    } 
```