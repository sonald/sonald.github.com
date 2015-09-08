title: leetcode: text justification
date: 2014-12-02 12:54:56
tags: [algorithm]
---

I don't know why it marked as hard since there is no need to messing around with strings or arrays. for clarity, I use two pass below, actually it can be done with one pass concisely.

The idea is:

+ group strings according to if they fit into the same line
+ then caculate space between words in each line and generate compound string.


```C++
class Solution {
    public:
        vector<string> fullJustify(vector<string> &words, int L) {
            //pack
            vector<vector<string>> groups;
            while (words.size()) {
                int len = 0;
                vector<string> g;
                while (words.size() && words.front().size() + len <= L) {
                    g.push_back(words.front());
                    len += words.front().size() + 1;
                    words.erase(words.begin());
                }
                if (g.size()) groups.push_back(g);
            }

            //adjust
            int j = 0;
            for (auto& x: groups) {
                string s = x.front();
                if (x.size() == 1) s += string(L - s.size(), ' ');
                else {
                    auto k = L;
                    for (auto& i: x) k -= i.size();
                    auto d = k / (x.size()-1), r = k % (x.size()-1);

                    if (j == groups.size()-1) {d = 0; r = x.size(); }
                    for (int i = 1; i < x.size(); i++) {
                        s += string((i <= r ? (d+1) : d), ' ') + x[i];
                        k -= d+(i<=r?1:0);
                    }
                    if (k) s += string(k, ' ');
                }
                words.push_back(s);
                j++;
            }

            return words;
        }
};
```
