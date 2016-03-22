title: "'leetcode: longest consecutive sequence'"
date: 2014-12-05 21:32:10
tags: [algorithm]
---
[It][1] blocke me at first for a while, then suddenly I came up with an idea:

first build a map, whose key is the beginning of consective seq and value is end of seq, which is initially equals to the beginning (length of seq is 1). 

then we walk through the map, during the walking, join the neighbour seqs and erase from map so we won't visit twice.

```C++
class Solution {
    public:
        int longestConsecutive(vector<int> &num) {
            int res = 0;
            unordered_map<int, int> h;
            for (int i = 0, n = num.size(); i < n; i++) {
                h[num[i]] = num[i];
            }

            auto x = h.begin();
            unordered_map<int, int>::iterator i;            
            while (x != h.end()) {
                auto v = x->second;
                while ((i = h.find(v+1)) != h.end()) {
                    x->second = h[v+1];
                    v = h[v+1];
                    h.erase(i);                                        
                }
                res = max(res, v-x->first+1);
                x++;
            }
            return res;
        }
};
```

The same idea can be described in a more concise way in one pass:

This time we build the map on the way. The key is the num, but the value means the length of the sequence which has the key as one of its borders.

we iterate each value in the num array, if it resides in the map, just ignore. Else, we find the two adjcent sequences from left and right, and combine them into one seq. after that, we update the value of the borders of the new seq to the length of the seq.

```C++
class Solution2 {
    public:
        int longestConsecutive(vector<int> &num) {
            int res = 0;
            unordered_map<int, int> h;
            for (auto& x: num) {
                if (!h[x]) {
                    h[x] = 1 + h[x+1] + h[x-1];
                    if (h[x+1]) h[h[x+1]+x] = h[x]; 
                    if (h[x-1]) h[x-h[x-1]] = h[x];
                }
                res = max(h[x], res);
            }

            return res;
        }
};
```

[1]: https://oj.leetcode.com/problems/longest-consecutive-sequence/
