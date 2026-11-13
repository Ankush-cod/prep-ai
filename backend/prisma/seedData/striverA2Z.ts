// prisma/seedData/striverA2Z.ts
import { Difficulty } from '@prisma/client';

export interface StriverProblemSeed {
  slug: string;
  title: string;
  problemIdentifier: string;
  step: string;
  topic: string;
  difficulty: Difficulty;
  externalUrl: string;
  orderIndex: number;
  tags: string[];
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: {
    cpp: string;
    python: string;
    java: string;
    javascript: string;
    go: string;
  };
  testCases: { input: string; expectedOutput: string }[];
}

export const striverA2ZProblems: StriverProblemSeed[] = [
  // 1. Arrays
  {
    slug: 'striver-largest-element-array',
    title: 'Largest Element in an Array',
    problemIdentifier: 'STRIVER-ARR-01',
    step: 'Step 3: Solve Problems on Arrays',
    topic: 'Arrays',
    difficulty: Difficulty.EASY,
    externalUrl: 'https://takeuforward.org/data-structure/find-the-largest-element-in-an-array/',
    orderIndex: 1,
    tags: ['Arrays', 'Fundamentals', 'Striver A2Z'],
    description: 'Given an array of integers, find the largest element present in the array.',
    constraints: ['1 <= N <= 10^5', '-10^9 <= arr[i] <= 10^9'],
    examples: [
      { input: '5\n2 5 1 3 0', output: '5', explanation: '5 is the maximum element in the array.' },
      { input: '4\n8 10 5 7 9', output: '10', explanation: '10 is the maximum.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    int maxVal = -1e9;\n    for (int i = 0; i < n; i++) {\n        int x;\n        cin >> x;\n        if (x > maxVal) maxVal = x;\n    }\n    cout << maxVal << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    print(max(nums))\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int maxVal = Integer.MIN_VALUE;\n        for (int i = 0; i < n; i++) {\n            int x = sc.nextInt();\n            if (x > maxVal) maxVal = x;\n        }\n        System.out.println(maxVal);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n  const n = parseInt(tokens[0], 10);\n  const nums = tokens.slice(1, n + 1).map(Number);\n  console.log(Math.max(...nums));\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\tmaxVal := -1000000000\n\tfor i := 0; i < n; i++ {\n\t\tvar x int\n\t\tfmt.Fscan(in, &x)\n\t\tif x > maxVal { maxVal = x }\n\t}\n\tfmt.Println(maxVal)\n}'
    },
    testCases: [
      { input: '5\n2 5 1 3 0\n', expectedOutput: '5' },
      { input: '4\n8 10 5 7 9\n', expectedOutput: '10' }
    ]
  },
  {
    slug: 'striver-second-largest-element',
    title: 'Second Largest Element in Array without Sorting',
    problemIdentifier: 'STRIVER-ARR-02',
    step: 'Step 3: Solve Problems on Arrays',
    topic: 'Arrays',
    difficulty: Difficulty.EASY,
    externalUrl: 'https://takeuforward.org/data-structure/find-second-smallest-and-second-largest-element-in-an-array/',
    orderIndex: 2,
    tags: ['Arrays', 'Fundamentals', 'Striver A2Z'],
    description: 'Given an array of integers, find the second largest distinct element. If no second largest exists, return -1.',
    constraints: ['2 <= N <= 10^5', '-10^9 <= arr[i] <= 10^9'],
    examples: [
      { input: '6\n1 2 4 7 7 5', output: '5', explanation: 'Distinct elements sorted are 1, 2, 4, 5, 7. Second largest is 5.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    long long first = -2e18, second = -2e18;\n    for (int i = 0; i < n; i++) {\n        long long x;\n        cin >> x;\n        if (x > first) {\n            second = first;\n            first = x;\n        } else if (x > second && x != first) {\n            second = x;\n        }\n    }\n    if (second <= -1e18) cout << -1 << endl;\n    else cout << second << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    data = sys.stdin.read().split()\n    if not data: return\n    n = int(data[0])\n    nums = list(set(int(x) for x in data[1:n+1]))\n    nums.sort()\n    print(nums[-2] if len(nums) >= 2 else -1)\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        long first = Long.MIN_VALUE, second = Long.MIN_VALUE;\n        for (int i = 0; i < n; i++) {\n            long x = sc.nextLong();\n            if (x > first) {\n                second = first;\n                first = x;\n            } else if (x > second && x != first) {\n                second = x;\n            }\n        }\n        System.out.println(second == Long.MIN_VALUE ? -1 : second);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n  const n = parseInt(tokens[0], 10);\n  const uniq = Array.from(new Set(tokens.slice(1, n + 1).map(Number))).sort((a,b)=>a-b);\n  console.log(uniq.length >= 2 ? uniq[uniq.length - 2] : -1);\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\tfirst, second := int64(-1e18), int64(-1e18)\n\tfor i := 0; i < n; i++ {\n\t\tvar x int64\n\t\tfmt.Fscan(in, &x)\n\t\tif x > first {\n\t\t\tsecond = first\n\t\t\tfirst = x\n\t\t} else if x > second && x != first {\n\t\t\tsecond = x\n\t\t}\n\t}\n\tif second <= -1e17 { fmt.Println(-1) } else { fmt.Println(second) }\n}'
    },
    testCases: [
      { input: '6\n1 2 4 7 7 5\n', expectedOutput: '5' },
      { input: '3\n10 10 10\n', expectedOutput: '-1' }
    ]
  },
  {
    slug: 'striver-check-sorted-array',
    title: 'Check if Array is Sorted and Rotated',
    problemIdentifier: 'STRIVER-ARR-03',
    step: 'Step 3: Solve Problems on Arrays',
    topic: 'Arrays',
    difficulty: Difficulty.EASY,
    externalUrl: 'https://takeuforward.org/data-structure/check-if-an-array-is-sorted/',
    orderIndex: 3,
    tags: ['Arrays', 'Fundamentals', 'Striver A2Z'],
    description: 'Check if the given array was originally sorted in non-decreasing order and then rotated by some number of positions.',
    constraints: ['1 <= N <= 500', '1 <= arr[i] <= 100'],
    examples: [
      { input: '5\n3 4 5 1 2', output: 'true', explanation: 'Originally [1, 2, 3, 4, 5], rotated 3 positions.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    int drops = 0;\n    for (int i = 0; i < n; i++) {\n        if (a[i] > a[(i + 1) % n]) drops++;\n    }\n    cout << (drops <= 1 ? "true" : "false") << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d: return\n    n = int(d[0])\n    a = [int(x) for x in d[1:n+1]]\n    drops = sum(1 for i in range(n) if a[i] > a[(i+1)%n])\n    print("true" if drops <= 1 else "false")\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        int drops = 0;\n        for (int i = 0; i < n; i++) {\n            if (a[i] > a[(i + 1) % n]) drops++;\n        }\n        System.out.println(drops <= 1 ? "true" : "false");\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n  const n = parseInt(tokens[0], 10);\n  const a = tokens.slice(1, n + 1).map(Number);\n  let drops = 0;\n  for (let i = 0; i < n; i++) if (a[i] > a[(i + 1) % n]) drops++;\n  console.log(drops <= 1 ? "true" : "false");\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\ta := make([]int, n)\n\tfor i := 0; i < n; i++ { fmt.Fscan(in, &a[i]) }\n\tdrops := 0\n\tfor i := 0; i < n; i++ {\n\t\tif a[i] > a[(i+1)%n] { drops++ }\n\t}\n\tif drops <= 1 { fmt.Println("true") } else { fmt.Println("false") }\n}'
    },
    testCases: [
      { input: '5\n3 4 5 1 2\n', expectedOutput: 'true' },
      { input: '4\n2 1 3 4\n', expectedOutput: 'false' }
    ]
  },
  // 2. Binary Search
  {
    slug: 'striver-binary-search',
    title: 'Binary Search to Find Target in a Sorted Array',
    problemIdentifier: 'STRIVER-BS-01',
    step: 'Step 4: Binary Search',
    topic: 'Binary Search',
    difficulty: Difficulty.EASY,
    externalUrl: 'https://takeuforward.org/data-structure/binary-search-explained/',
    orderIndex: 4,
    tags: ['Binary Search', 'Striver A2Z'],
    description: 'Given a sorted array of N integers and an integer target, find the index of target in the array (0-indexed). If target is not present, return -1.',
    constraints: ['1 <= N <= 10^5', '-10^9 <= target, arr[i] <= 10^9'],
    examples: [
      { input: '6 13\n3 4 6 7 9 12 16 17', output: '-1', explanation: '13 is not in array' },
      { input: '5 7\n1 3 7 9 11', output: '2', explanation: '7 is at index 2' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n; long long target;\n    if (!(cin >> n >> target)) return 0;\n    vector<long long> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    int low = 0, high = n - 1, ans = -1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (a[mid] == target) { ans = mid; break; }\n        else if (a[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    cout << ans << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d: return\n    n = int(d[0])\n    target = int(d[1])\n    a = [int(x) for x in d[2:n+2]]\n    low, high = 0, n - 1\n    ans = -1\n    while low <= high:\n        mid = (low + high) // 2\n        if a[mid] == target: ans = mid; break\n        elif a[mid] < target: low = mid + 1\n        else: high = mid - 1\n    print(ans)\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        long target = sc.nextLong();\n        long[] a = new long[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextLong();\n        int low = 0, high = n - 1, ans = -1;\n        while (low <= high) {\n            int mid = low + (high - low) / 2;\n            if (a[mid] == target) { ans = mid; break; }\n            else if (a[mid] < target) low = mid + 1;\n            else high = mid - 1;\n        }\n        System.out.println(ans);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n  const n = parseInt(tokens[0], 10);\n  const target = parseInt(tokens[1], 10);\n  const a = tokens.slice(2, n + 2).map(Number);\n  let low = 0, high = n - 1, ans = -1;\n  while (low <= high) {\n    const mid = Math.floor((low + high) / 2);\n    if (a[mid] === target) { ans = mid; break; }\n    else if (a[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  console.log(ans);\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tvar target int64\n\tif _, err := fmt.Fscan(in, &n, &target); err != nil { return }\n\ta := make([]int64, n)\n\tfor i := 0; i < n; i++ { fmt.Fscan(in, &a[i]) }\n\tlow, high, ans := 0, n - 1, -1\n\tfor low <= high {\n\t\tmid := low + (high-low)/2\n\t\tif a[mid] == target { ans = mid; break }\n\t\tif a[mid] < target { low = mid + 1 } else { high = mid - 1 }\n\t}\n\tfmt.Println(ans)\n}'
    },
    testCases: [
      { input: '5 7\n1 3 7 9 11\n', expectedOutput: '2' },
      { input: '4 5\n1 2 3 4\n', expectedOutput: '-1' }
    ]
  },
  // 3. Strings
  {
    slug: 'striver-reverse-words-string',
    title: 'Reverse Words in a String',
    problemIdentifier: 'STRIVER-STR-01',
    step: 'Step 5: Strings [Basic and Medium]',
    topic: 'Strings',
    difficulty: Difficulty.MEDIUM,
    externalUrl: 'https://takeuforward.org/data-structure/reverse-words-in-a-string/',
    orderIndex: 5,
    tags: ['Strings', 'Two Pointers', 'Striver A2Z'],
    description: 'Given an input string s, reverse the order of the words. Words are separated by at least one space.',
    constraints: ['1 <= s.length <= 10^4'],
    examples: [
      { input: 'the sky is blue', output: 'blue is sky the', explanation: 'Order of words is reversed.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <string>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\nint main() {\n    string line; if (!getline(cin, line)) return 0;\n    stringstream ss(line);\n    string w;\n    vector<string> words;\n    while (ss >> w) words.push_back(w);\n    for (int i = (int)words.size() - 1; i >= 0; i--) {\n        cout << words[i] << (i == 0 ? "" : " ");\n    }\n    cout << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    if not s: return\n    words = s.split()\n    print(" ".join(reversed(words)))\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\nimport java.util.ArrayList;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextLine()) return;\n        String[] words = sc.nextLine().trim().split("\\\\s+");\n        StringBuilder sb = new StringBuilder();\n        for (int i = words.length - 1; i >= 0; i--) {\n            sb.append(words[i]);\n            if (i > 0) sb.append(" ");\n        }\n        System.out.println(sb.toString());\n    }\n}',
      javascript: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nif (input) {\n  console.log(input.split(/\\s+/).reverse().join(" "));\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"strings"\n)\nfunc main() {\n\tscanner := bufio.NewScanner(os.Stdin)\n\tif scanner.Scan() {\n\t\twords := strings.Fields(scanner.Text())\n\t\tfor i, j := 0, len(words)-1; i < j; i, j = i+1, j-1 {\n\t\t\twords[i], words[j] = words[j], words[i]\n\t\t}\n\t\tfmt.Println(strings.Join(words, " "))\n\t}\n}'
    },
    testCases: [
      { input: 'the sky is blue\n', expectedOutput: 'blue is sky the' },
      { input: '  hello world  \n', expectedOutput: 'world hello' }
    ]
  },
  // 4. Linked Lists
  {
    slug: 'striver-reverse-linked-list',
    title: 'Reverse a Singly Linked List',
    problemIdentifier: 'STRIVER-LL-01',
    step: 'Step 6: Learn LinkedList',
    topic: 'Linked Lists',
    difficulty: Difficulty.EASY,
    externalUrl: 'https://takeuforward.org/data-structure/reverse-a-linked-list/',
    orderIndex: 6,
    tags: ['Linked Lists', 'Pointers', 'Striver A2Z'],
    description: 'Given the head of a singly linked list represented as space-separated integers, reverse the list and print the elements.',
    constraints: ['1 <= N <= 5000', '-5000 <= node.val <= 5000'],
    examples: [
      { input: '5\n1 2 3 4 5', output: '5 4 3 2 1', explanation: 'Reversed order.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    for (int i = n - 1; i >= 0; i--) {\n        cout << a[i] << (i == 0 ? "" : " ");\n    }\n    cout << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d: return\n    n = int(d[0])\n    print(" ".join(d[1:n+1][::-1]))\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        for (int i = n - 1; i >= 0; i--) {\n            System.out.print(a[i] + (i == 0 ? "\\n" : " "));\n        }\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n  const n = parseInt(tokens[0], 10);\n  console.log(tokens.slice(1, n + 1).reverse().join(" "));\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\ta := make([]int, n)\n\tfor i := 0; i < n; i++ { fmt.Fscan(in, &a[i]) }\n\tfor i := n - 1; i >= 0; i-- {\n\t\tif i == 0 { fmt.Println(a[i]) } else { fmt.Printf("%d ", a[i]) }\n\t}\n}'
    },
    testCases: [
      { input: '5\n1 2 3 4 5\n', expectedOutput: '5 4 3 2 1' }
    ]
  },
  // 5. Recursion & Backtracking
  {
    slug: 'striver-subset-sums',
    title: 'Subset Sums',
    problemIdentifier: 'STRIVER-REC-01',
    step: 'Step 7: Recursion [PatternWise]',
    topic: 'Recursion',
    difficulty: Difficulty.MEDIUM,
    externalUrl: 'https://takeuforward.org/data-structure/subset-sum-sum-of-all-subsets/',
    orderIndex: 7,
    tags: ['Recursion', 'Backtracking', 'Striver A2Z'],
    description: 'Given a list arr of N integers, print sums of all subsets in sorted order.',
    constraints: ['1 <= N <= 15', '0 <= arr[i] <= 10^4'],
    examples: [
      { input: '2\n2 3', output: '0 2 3 5', explanation: 'Subsets are {}, {2}, {3}, {2, 3}.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvoid solve(int idx, int sum, const vector<int>& a, vector<int>& ans) {\n    if (idx == (int)a.size()) { ans.push_back(sum); return; }\n    solve(idx + 1, sum + a[idx], a, ans);\n    solve(idx + 1, sum, a, ans);\n}\n\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    vector<int> ans;\n    solve(0, 0, a, ans);\n    sort(ans.begin(), ans.end());\n    for (int i = 0; i < (int)ans.size(); i++) {\n        cout << ans[i] << (i == (int)ans.size() - 1 ? "" : " ");\n    }\n    cout << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d: return\n    n = int(d[0])\n    a = [int(x) for x in d[1:n+1]]\n    ans = []\n    def dfs(i, s):\n        if i == n:\n            ans.append(s)\n            return\n        dfs(i + 1, s + a[i])\n        dfs(i + 1, s)\n    dfs(0, 0)\n    ans.sort()\n    print(" ".join(map(str, ans)))\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.*;\n\npublic class Main {\n    static void dfs(int i, int sum, int[] a, List<Integer> ans) {\n        if (i == a.length) { ans.add(sum); return; }\n        dfs(i + 1, sum + a[i], a, ans);\n        dfs(i + 1, sum, a, ans);\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        List<Integer> ans = new ArrayList<>();\n        dfs(0, 0, a, ans);\n        Collections.sort(ans);\n        for (int i = 0; i < ans.size(); i++) {\n            System.out.print(ans.get(i) + (i == ans.size() - 1 ? "\\n" : " "));\n        }\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n  const n = parseInt(tokens[0], 10);\n  const a = tokens.slice(1, n + 1).map(Number);\n  const ans = [];\n  function dfs(i, sum) {\n    if (i === n) { ans.push(sum); return; }\n    dfs(i + 1, sum + a[i]);\n    dfs(i + 1, sum);\n  }\n  dfs(0, 0);\n  ans.sort((x, y) => x - y);\n  console.log(ans.join(" "));\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"sort"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\ta := make([]int, n)\n\tfor i := 0; i < n; i++ { fmt.Fscan(in, &a[i]) }\n\tans := []int{}\n\tvar dfs func(int, int)\n\tdfs = func(i, s int) {\n\t\tif i == n { ans = append(ans, s); return }\n\t\tdfs(i+1, s+a[i])\n\t\tdfs(i+1, s)\n\t}\n\tdfs(0, 0)\n\tsort.Ints(ans)\n\tfor i, v := range ans {\n\t\tif i == len(ans)-1 { fmt.Println(v) } else { fmt.Printf("%d ", v) }\n\t}\n}'
    },
    testCases: [
      { input: '2\n2 3\n', expectedOutput: '0 2 3 5' }
    ]
  },
  // 6. Stacks & Queues
  {
    slug: 'striver-valid-parentheses',
    title: 'Valid Parentheses',
    problemIdentifier: 'STRIVER-STK-01',
    step: 'Step 9: Stack and Queues',
    topic: 'Stacks and Queues',
    difficulty: Difficulty.EASY,
    externalUrl: 'https://takeuforward.org/data-structure/check-for-balanced-parentheses/',
    orderIndex: 8,
    tags: ['Stacks', 'Strings', 'Striver A2Z'],
    description: 'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    constraints: ['1 <= s.length <= 10^4'],
    examples: [
      { input: '()[]{}', output: 'true', explanation: 'All brackets match.' },
      { input: '(]', output: 'false', explanation: 'Mismatched brackets.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <string>\n#include <stack>\nusing namespace std;\n\nint main() {\n    string s; if (!(cin >> s)) return 0;\n    stack<char> st;\n    bool ok = true;\n    for (char c : s) {\n        if (c == \'(\' || c == \'{\' || c == \'[\') st.push(c);\n        else {\n            if (st.empty()) { ok = false; break; }\n            char top = st.top(); st.pop();\n            if ((c == \')\' && top != \'(\') || (c == \'}\' && top != \'{\') || (c == \']\' && top != \'[\')) { ok = false; break; }\n        }\n    }\n    if (!st.empty()) ok = false;\n    cout << (ok ? "true" : "false") << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    s = sys.stdin.read().strip()\n    if not s: return\n    st = []\n    pairs = {")": "(", "}": "{", "]": "["}\n    for c in s:\n        if c in "({[":\n            st.append(c)\n        elif c in pairs:\n            if not st or st[-1] != pairs[c]:\n                print("false"); return\n            st.pop()\n    print("true" if not st else "false")\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\nimport java.util.Stack;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String s = sc.next();\n        Stack<Character> st = new Stack<>();\n        boolean ok = true;\n        for (char c : s.toCharArray()) {\n            if (c == \'(\' || c == \'{\' || c == \'[\') st.push(c);\n            else {\n                if (st.isEmpty()) { ok = false; break; }\n                char top = st.pop();\n                if ((c == \')\' && top != \'(\') || (c == \'}\' && top != \'{\') || (c == \']\' && top != \'[\')) { ok = false; break; }\n            }\n        }\n        if (!st.isEmpty()) ok = false;\n        System.out.println(ok ? "true" : "false");\n    }\n}',
      javascript: 'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf-8").trim();\nif (s) {\n  const st = [];\n  const p = { ")": "(", "}": "{", "]": "[" };\n  let ok = true;\n  for (const c of s) {\n    if ("({[".includes(c)) st.push(c);\n    else if (p[c]) {\n      if (!st.length || st.pop() !== p[c]) { ok = false; break; }\n    }\n  }\n  if (st.length) ok = false;\n  console.log(ok ? "true" : "false");\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tvar s string\n\tif _, err := fmt.Fscan(bufio.NewReader(os.Stdin), &s); err != nil { return }\n\tst := []rune{}\n\tok := true\n\tfor _, c := range s {\n\t\tif c == \'(\' || c == \'{\' || c == \'[\' {\n\t\t\tst = append(st, c)\n\t\t} else {\n\t\t\tif len(st) == 0 { ok = false; break }\n\t\t\ttop := st[len(st)-1]\n\t\t\tst = st[:len(st)-1]\n\t\t\tif (c == \')\' && top != \'(\') || (c == \'}\' && top != \'{\') || (c == \']\' && top != \'[\') {\n\t\t\t\tok = false; break\n\t\t\t}\n\t\t}\n\t}\n\tif len(st) > 0 { ok = false }\n\tif ok { fmt.Println("true") } else { fmt.Println("false") }\n}'
    },
    testCases: [
      { input: '()[]{}\n', expectedOutput: 'true' },
      { input: '(]\n', expectedOutput: 'false' }
    ]
  },
  // 7. Dynamic Programming
  {
    slug: 'striver-climbing-stairs',
    title: 'Climbing Stairs',
    problemIdentifier: 'STRIVER-DP-01',
    step: 'Step 16: Dynamic Programming',
    topic: 'Dynamic Programming',
    difficulty: Difficulty.EASY,
    externalUrl: 'https://takeuforward.org/data-structure/dynamic-programming-climbing-stairs/',
    orderIndex: 9,
    tags: ['Dynamic Programming', 'Memoization', 'Striver A2Z'],
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    constraints: ['1 <= n <= 45'],
    examples: [
      { input: '2', output: '2', explanation: '1+1 or 2' },
      { input: '3', output: '3', explanation: '1+1+1, 1+2, or 2+1' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    if (n <= 2) { cout << n << endl; return 0; }\n    long long a = 1, b = 2;\n    for (int i = 3; i <= n; i++) {\n        long long c = a + b;\n        a = b;\n        b = c;\n    }\n    cout << b << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d: return\n    n = int(d[0])\n    if n <= 2: print(n); return\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    print(b)\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        if (n <= 2) { System.out.println(n); return; }\n        long a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            long c = a + b;\n            a = b;\n            b = c;\n        }\n        System.out.println(b);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim();\nif (input) {\n  const n = parseInt(input, 10);\n  if (n <= 2) { console.log(n); process.exit(0); }\n  let a = 1n, b = 2n;\n  for (let i = 3; i <= n; i++) {\n    const c = a + b;\n    a = b;\n    b = c;\n  }\n  console.log(b.toString());\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tvar n int\n\tif _, err := fmt.Fscan(bufio.NewReader(os.Stdin), &n); err != nil { return }\n\tif n <= 2 { fmt.Println(n); return }\n\ta, b := int64(1), int64(2)\n\tfor i := 3; i <= n; i++ {\n\t\tc := a + b\n\t\ta = b\n\t\tb = c\n\t}\n\tfmt.Println(b)\n}'
    },
    testCases: [
      { input: '2\n', expectedOutput: '2' },
      { input: '3\n', expectedOutput: '3' },
      { input: '5\n', expectedOutput: '8' }
    ]
  },
  // 8. Graphs
  {
    slug: 'striver-number-of-provinces',
    title: 'Number of Connected Components / Provinces',
    problemIdentifier: 'STRIVER-GRA-01',
    step: 'Step 15: Graphs',
    topic: 'Graphs',
    difficulty: Difficulty.MEDIUM,
    externalUrl: 'https://takeuforward.org/data-structure/number-of-provinces/',
    orderIndex: 10,
    tags: ['Graphs', 'BFS', 'DFS', 'Disjoint Set', 'Striver A2Z'],
    description: 'There are n cities. An n x n adjacency matrix is given where isConnected[i][j] = 1 if the ith city and the jth city are directly connected. Return total number of provinces (connected components).',
    constraints: ['1 <= n <= 200', 'isConnected[i][j] is 1 or 0.'],
    examples: [
      { input: '3\n1 1 0\n1 1 0\n0 0 1', output: '2', explanation: 'Cities 0 and 1 form one province, city 2 forms another.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid dfs(int u, int n, const vector<vector<int>>& g, vector<bool>& vis) {\n    vis[u] = true;\n    for (int v = 0; v < n; v++) {\n        if (g[u][v] == 1 && !vis[v]) dfs(v, n, g, vis);\n    }\n}\n\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    vector<vector<int>> g(n, vector<int>(n));\n    for (int i = 0; i < n; i++)\n        for (int j = 0; j < n; j++) cin >> g[i][j];\n    vector<bool> vis(n, false);\n    int provinces = 0;\n    for (int i = 0; i < n; i++) {\n        if (!vis[i]) { dfs(i, n, g, vis); provinces++; }\n    }\n    cout << provinces << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d: return\n    n = int(d[0])\n    mat = []\n    idx = 1\n    for _ in range(n):\n        mat.append([int(x) for x in d[idx:idx+n]])\n        idx += n\n    vis = [False] * n\n    def dfs(u):\n        vis[u] = True\n        for v in range(n):\n            if mat[u][v] == 1 and not vis[v]:\n                dfs(v)\n    ans = 0\n    for i in range(n):\n        if not vis[i]:\n            dfs(i)\n            ans += 1\n    print(ans)\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    static void dfs(int u, int n, int[][] g, boolean[] vis) {\n        vis[u] = true;\n        for (int v = 0; v < n; v++) {\n            if (g[u][v] == 1 && !vis[v]) dfs(v, n, g, vis);\n        }\n    }\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int[][] g = new int[n][n];\n        for (int i = 0; i < n; i++)\n            for (int j = 0; j < n; j++) g[i][j] = sc.nextInt();\n        boolean[] vis = new boolean[n];\n        int count = 0;\n        for (int i = 0; i < n; i++) {\n            if (!vis[i]) { dfs(i, n, g, vis); count++; }\n        }\n        System.out.println(count);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n  const n = parseInt(tokens[0], 10);\n  const g = [];\n  let idx = 1;\n  for (let i = 0; i < n; i++) {\n    g.push(tokens.slice(idx, idx + n).map(Number));\n    idx += n;\n  }\n  const vis = new Array(n).fill(false);\n  function dfs(u) {\n    vis[u] = true;\n    for (let v = 0; v < n; v++) {\n      if (g[u][v] === 1 && !vis[v]) dfs(v);\n    }\n  }\n  let count = 0;\n  for (let i = 0; i < n; i++) {\n    if (!vis[i]) { dfs(i); count++; }\n  }\n  console.log(count);\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\tg := make([][]int, n)\n\tfor i := 0; i < n; i++ {\n\t\tg[i] = make([]int, n)\n\t\tfor j := 0; j < n; j++ { fmt.Fscan(in, &g[i][j]) }\n\t}\n\tvis := make([]bool, n)\n\tvar dfs func(int)\n\tdfs = func(u int) {\n\t\tvis[u] = true\n\t\tfor v := 0; v < n; v++ {\n\t\t\tif g[u][v] == 1 && !vis[v] { dfs(v) }\n\t\t}\n\t}\n\tcount := 0\n\tfor i := 0; i < n; i++ {\n\t\tif !vis[i] { dfs(i); count++ }\n\t}\n\tfmt.Println(count)\n}'
    },
    testCases: [
      { input: '3\n1 1 0\n1 1 0\n0 0 1\n', expectedOutput: '2' },
      { input: '3\n1 0 0\n0 1 0\n0 0 1\n', expectedOutput: '3' }
    ]
  }
];
