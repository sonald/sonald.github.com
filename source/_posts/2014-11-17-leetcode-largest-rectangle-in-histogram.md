title: leetcode: largest rectangle in histogram
date: 2014-11-17 21:23:20
tags: [algorithm]
---

第一次遇到[这个][2]问题会觉得有难度，我是先做的[maximal rectangle][1]，然后再看到这个题，所以顺手就写了，结果TLE了。其实leetcode的时间复杂度要求还不是很变态的（想变态的就去spoj找虐），所以之前pass了就没在乎。现在回过头来做这个就不得不改变下写法。其实这个算法是[我的maximal rectangle实现][3]的基础。之前的写法有问题，因为在最坏情况下是O(n<sup>3</sup>)，但是基本思想是一样的。于是重写的时候做了改进。

基本思路是迭代height数组每一项，用栈sp记录到目前为止小于当前高度、并且高度递增的所有bar的位置。我们可以计算以栈中每一项为高度的最大矩形来找到目前为止的最大矩形。

```c++
class Solution {
public:
    int largestRectangleArea(vector<int> &height) {
        std::vector<pair<int, int>> sp; // <height, index>
        int res = 0;
        sp.emplace_back(0, -1);
        for (int i = 0, n = height.size(); i < n; i++) {
            int k = height[i];
            bool dropping = false;
            while (sp.size() && sp.back().first >= k) {
                sp.pop_back();
                dropping = true;
            }
            sp.emplace_back(k, i);

            if (dropping || i == n-1 || (sp.back().first >= height[i+1])) {
                for (int p = 1; p < sp.size(); p++) {
                    auto r = sp[p].first * (i - sp[p-1].second);
                    res = max(r, res);
                }
            }            
        }

        return res;        
    }
};

```

基于同样的想法，我们可以稍微改写一下。由于我们只需要使用sp记录到当前位置为止所有上升的bar的高度，当遇到一个下降的bar时，所有栈里高度大于当前bar的位置在后面的计算中都不需要了，可以弹出并计算其最大矩形大小。整个算法用一个紧凑的while循环实现。这个方法保证了O(n)的时间复杂度。

```c++
    int largestRectangleArea(vector<int> &height) {
        std::vector<pair<int, int>> sp; 
        int res = 0;
        height.push_back(0);
        sp.emplace_back(0, -1); // sentinal
        int i = 0;
        while (i < height.size()) {
            int k = height[i];
            if (sp.size() && sp.back().first <= k) {
                sp.emplace_back(k, i++);
            } else {
                auto p = sp.back();
                sp.pop_back();                
                res = max((i-sp.back().second-1) * p.first,  res);
            }
        }

        while (sp.size() > 1) {
            auto p = sp.back();
            sp.pop_back();                
            res = max((i-sp.back().second-1) * p.first,  res);            
        }
        return res;        
    }
```

最后一个方法据说是经典实现，它基于[segment tree][4]来实现，O(nlgn)的时间复杂度。segment tree的思想可以看这个[链接][5]，实现比较容易。


```c++
class SegmentTree {
public:
    std::vector<int> nodes;
    int n;

    SegmentTree(const vector<int>& v) {
        n = v.size();
        int h = std::ceil(std::log2(n)); 
        nodes = std::vector<int>(2*std::pow(2,h)-1, 0);

        build(v, 0, 0, n-1);        
    }

    int query(const vector<int>& v, int ql, int qr) const {
        return queryMin(v, 0, 0, n-1, ql, qr);
    }

private:
    int idOfMin(const vector<int>& v, int id1, int id2) const {
        if (id1 == INT_MAX) return id2;
        else if (id2 == INT_MAX) return id1;

        return (v[id1] < v[id2]) ? id1 : id2;
    }

    // [l, r] is region of id, [ql, qr] is query region
    int queryMin(const vector<int>& v, int id, int l, int r, int ql, int qr) const {
        if (ql <= l && qr >= r) return nodes[id];
        if (ql > r || qr < l) return INT_MAX;

        int mid = l + (r - l) / 2;
        return idOfMin(v, queryMin(v, id*2+1, l, mid, ql, qr), queryMin(v, id*2+2, mid+1, r, ql, qr));
    }

    int build(const vector<int>& v, int id, int l, int r) {
        if (l == r) {
            return nodes[id] = l;
        }

        int mid = l + (r-l)/2;
        return nodes[id] = idOfMin(v, build(v, id*2+1, l, mid), build(v, id*2+2, mid+1, r));
    }

};

class Solution3 {
public:
    int largestRectangleArea(vector<int> &height) {
        if (height.size() == 0) return 0;
        SegmentTree st(height);
        return dac(height, st, 0, height.size()-1);
    }

    int dac(const vector<int>& height, const SegmentTree& st, int l, int r) {
        if (l > r) return -1;
        if (l == r) return height[l];
        int id = st.query(height, l, r);
        return max(max(dac(height, st, l, id-1), dac(height, st, id+1, r)), (r-l+1)*height[id]);
    }
};

```

[1]: https://oj.leetcode.com/problems/maximal-rectangle/
[2]: https://oj.leetcode.com/problems/largest-rectangle-in-histogram/
[3]: /2014/10/24/leetcode-maximal-rectangle/
[4]: http://www.geeksforgeeks.org/largest-rectangular-area-in-a-histogram-set-1/
[5]: http://www.geeksforgeeks.org/segment-tree-set-1-sum-of-given-range/