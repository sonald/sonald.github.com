title: leetcode: interleaving string
date: 2014-11-23 15:54:03
tags: [algorithm]
---

The description is [here][1]. The moment you see there are overlapping sub problems and sub optimal structure you know the problem can be solved easily using **dynamical programming**. The basic idea is thus:

the value of dp[i][j] represents if there is any of the interleaved strings come out of s1[0-i]  and s2[0-j].

dp[i][j] = (dp[i-1][j] if s1[i] == s3[i+j]) or (dp[i][j-1] if s2[j] == s3[i+j])

for the sake of making programming easily, the matrix has been augmented by 1 in each dimension.

```C++
class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int n = s1.size(), m = s2.size(), len = s3.size();
        if (n + m != len) return false;

        std::vector<vector<int>> dp(n+1, std::vector<int>(m+1, false));
        dp[0][0] = true;
        for (int i = 1; i <= n; i++) dp[i][0] = s1[i-1] == s3[i-1];
        for (int i = 1; i <= m; i++) dp[0][i] = s2[i-1] == s3[i-1];            

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                auto v1 = s1[i-1], v2 = s2[j-1], r2 = s3[i+j-1];
                if (v2 == r2) dp[i][j] = dp[i][j-1];
                if (!dp[i][j] && v1 == r2) dp[i][j] = dp[i-1][j];
            }
        }
        return dp[n][m];
    }
};
```

The above uses O(m\*n) space, which is common case. We can reduce the space usage by **the observation** that to calculate dp[i][j] we only need to know dp[i-1][j] which is the value of last line above it and dp[i][j-1] which is the previous value of the same line. 

So here I use array dp to represent both the values of the last line and the previous one. the trick is that when we calculating dp[j], dp[j-1] will store the previous value of the same line, and dp[j] itself (before write new value into it) is the value of last line above. Then we can use these two values to write new value into dp[j].

```C++
class Solution {
public:
    bool isInterleave(string s1, string s2, string s3) {
        int n = s1.size(), m = s2.size(), len = s3.size();
        if (n + m != len) return false;

        std::vector<int> dp(m+1, true);
        for (int i = 1; i <= m; i++) dp[i] = s2[i-1] == s3[i-1];            

        for (int i = 1; i <= n; i++) {
            dp[0] = s1[i-1] == s3[i-1];
            for (int j = 1; j <= m; j++) {
                auto v1 = s1[i-1], v2 = s2[j-1], r2 = s3[i+j-1];
                auto old = dp[j];
                dp[j] = false;
                if (v2 == r2) dp[j] = dp[j-1];
                if (!dp[j] && v1 == r2) dp[j] = old; // the last line
                
            }
        }
        return dp[m];
    }
};
```



[1]: https://oj.leetcode.com/problems/interleaving-string/
