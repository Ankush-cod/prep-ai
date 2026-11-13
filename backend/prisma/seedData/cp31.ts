// prisma/seedData/cp31.ts
import { Difficulty } from '@prisma/client';

export interface Cp31ProblemSeed {
  slug: string;
  title: string;
  contestNumber: number;
  problemIdentifier: string;
  rating: number;
  difficulty: Difficulty;
  topic: string;
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

export const cp31Problems: Cp31ProblemSeed[] = [
  // 1. Team (231A, Rating 800)
  {
    slug: 'cf-231a-team',
    title: 'Team',
    contestNumber: 231,
    problemIdentifier: '231A',
    rating: 800,
    difficulty: Difficulty.EASY,
    topic: 'Implementation / Brute Force',
    externalUrl: 'https://codeforces.com/problemset/problem/231/A',
    orderIndex: 1,
    tags: ['brute force', 'greedy', 'CP-31', 'Rating 800'],
    description: 'One day three best friends Petya, Vasya and Tonya decided to form a team and take part in programming contests. They will solve a problem if at least two of them are sure about the solution. Find how many problems they will solve.',
    constraints: ['1 <= n <= 1000', 'Each element is 0 or 1'],
    examples: [
      { input: '3\n1 1 0\n1 1 1\n1 0 0', output: '2', explanation: 'In first and second problem at least 2 friends are sure.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    int solved = 0;\n    for (int i = 0; i < n; i++) {\n        int a, b, c;\n        cin >> a >> b >> c;\n        if (a + b + c >= 2) solved++;\n    }\n    cout << solved << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d: return\n    n = int(d[0])\n    ans = 0\n    idx = 1\n    for _ in range(n):\n        a, b, c = int(d[idx]), int(d[idx+1]), int(d[idx+2])\n        if a + b + c >= 2: ans += 1\n        idx += 3\n    print(ans)\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int count = 0;\n        for (int i = 0; i < n; i++) {\n            int a = sc.nextInt(), b = sc.nextInt(), c = sc.nextInt();\n            if (a + b + c >= 2) count++;\n        }\n        System.out.println(count);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 4) {\n  const n = parseInt(tokens[0], 10);\n  let ans = 0, idx = 1;\n  for (let i = 0; i < n; i++) {\n    const a = Number(tokens[idx]), b = Number(tokens[idx+1]), c = Number(tokens[idx+2]);\n    if (a + b + c >= 2) ans++;\n    idx += 3;\n  }\n  console.log(ans);\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\tans := 0\n\tfor i := 0; i < n; i++ {\n\t\tvar a, b, c int\n\t\tfmt.Fscan(in, &a, &b, &c)\n\t\tif a+b+c >= 2 { ans++ }\n\t}\n\tfmt.Println(ans)\n}'
    },
    testCases: [
      { input: '3\n1 1 0\n1 1 1\n1 0 0\n', expectedOutput: '2' },
      { input: '2\n1 0 0\n0 1 1\n', expectedOutput: '1' }
    ]
  },
  // 2. Way Too Long Words (71A, Rating 800)
  {
    slug: 'cf-71a-way-too-long-words',
    title: 'Way Too Long Words',
    contestNumber: 71,
    problemIdentifier: '71A',
    rating: 800,
    difficulty: Difficulty.EASY,
    topic: 'Strings',
    externalUrl: 'https://codeforces.com/problemset/problem/71/A',
    orderIndex: 2,
    tags: ['strings', 'CP-31', 'Rating 800'],
    description: 'Sometimes some words like "localization" or "internationalization" are so long that writing them many times is tiresome. A word is considered too long if its length is strictly more than 10 characters. Replace it with abbreviation: first character, number of characters between first and last, and last character.',
    constraints: ['1 <= n <= 100', 'Word length between 1 and 100 lowercase Latin letters.'],
    examples: [
      { input: '4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis', output: 'word\nl10n\ni18n\np43s', explanation: 'Words > 10 chars are abbreviated.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    while (n--) {\n        string s; cin >> s;\n        if (s.length() > 10) {\n            cout << s[0] << s.length() - 2 << s.back() << endl;\n        } else {\n            cout << s << endl;\n        }\n    }\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    lines = sys.stdin.read().split()\n    if not lines: return\n    n = int(lines[0])\n    for i in range(1, n + 1):\n        w = lines[i]\n        if len(w) > 10:\n            print(f"{w[0]}{len(w)-2}{w[-1]}")\n        else:\n            print(w)\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        for (int i = 0; i < n; i++) {\n            String s = sc.next();\n            if (s.length() > 10) {\n                System.out.println("" + s.charAt(0) + (s.length() - 2) + s.charAt(s.length() - 1));\n            } else {\n                System.out.println(s);\n            }\n        }\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length) {\n  const n = parseInt(tokens[0], 10);\n  for (let i = 1; i <= n; i++) {\n    const s = tokens[i];\n    if (s.length > 10) console.log(`${s[0]}${s.length - 2}${s[s.length - 1]}`);\n    else console.log(s);\n  }\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\tfor i := 0; i < n; i++ {\n\t\tvar s string\n\t\tfmt.Fscan(in, &s)\n\t\tif len(s) > 10 {\n\t\t\tfmt.Printf("%c%d%c\\n", s[0], len(s)-2, s[len(s)-1])\n\t\t} else {\n\t\t\tfmt.Println(s)\n\t\t}\n\t}\n}'
    },
    testCases: [
      { input: '4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis\n', expectedOutput: 'word\nl10n\ni18n\np43s' }
    ]
  },
  // 3. Bit++ (282A, Rating 800)
  {
    slug: 'cf-282a-bit-plus-plus',
    title: 'Bit++',
    contestNumber: 282,
    problemIdentifier: '282A',
    rating: 800,
    difficulty: Difficulty.EASY,
    topic: 'Implementation',
    externalUrl: 'https://codeforces.com/problemset/problem/282/A',
    orderIndex: 3,
    tags: ['implementation', 'CP-31', 'Rating 800'],
    description: 'The programming language Bit++ has one variable x initialized to 0 and two operations: ++ increments x, -- decrements x. Execute all n statements and print the final value of x.',
    constraints: ['1 <= n <= 150'],
    examples: [
      { input: '1\n++X', output: '1', explanation: 'X is incremented from 0 to 1.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    int x = 0;\n    while (n--) {\n        string s; cin >> s;\n        if (s.find("++") != string::npos) x++;\n        else x--;\n    }\n    cout << x << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d: return\n    n = int(d[0])\n    x = 0\n    for op in d[1:n+1]:\n        if "++" in op: x += 1\n        else: x -= 1\n    print(x)\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        int x = 0;\n        for (int i = 0; i < n; i++) {\n            String s = sc.next();\n            if (s.contains("++")) x++; else x--;\n        }\n        System.out.println(x);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length) {\n  const n = parseInt(tokens[0], 10);\n  let x = 0;\n  for (let i = 1; i <= n; i++) {\n    if (tokens[i].includes("++")) x++; else x--;\n  }\n  console.log(x);\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"strings"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\tx := 0\n\tfor i := 0; i < n; i++ {\n\t\tvar s string\n\t\tfmt.Fscan(in, &s)\n\t\tif strings.Contains(s, "++") { x++ } else { x-- }\n\t}\n\tfmt.Println(x)\n}'
    },
    testCases: [
      { input: '1\n++X\n', expectedOutput: '1' },
      { input: '2\nX++\n--X\n', expectedOutput: '0' }
    ]
  },
  // 4. Next Round (158A, Rating 800)
  {
    slug: 'cf-158a-next-round',
    title: 'Next Round',
    contestNumber: 158,
    problemIdentifier: '158A',
    rating: 800,
    difficulty: Difficulty.EASY,
    topic: 'Implementation',
    externalUrl: 'https://codeforces.com/problemset/problem/158/A',
    orderIndex: 4,
    tags: ['implementation', 'CP-31', 'Rating 800'],
    description: '"Contestant who earns a score equal to or greater than the k-th place finisher\'s score will advance to the next round, as long as the contestant earns a positive score..." Calculate how many participants advance.',
    constraints: ['1 <= k <= n <= 50', 'Scores in non-increasing order: 0 <= a_i <= 100'],
    examples: [
      { input: '8 5\n10 9 8 7 7 7 5 5', output: '6', explanation: '5th place score is 7. Six participants scored >= 7.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, k; if (!(cin >> n >> k)) return 0;\n    vector<int> a(n);\n    for (int i = 0; i < n; i++) cin >> a[i];\n    int threshold = a[k - 1];\n    int ans = 0;\n    for (int i = 0; i < n; i++) {\n        if (a[i] >= threshold && a[i] > 0) ans++;\n    }\n    cout << ans << endl;\n    return 0;\n}',
      python: 'import sys\n\ndef main():\n    d = sys.stdin.read().split()\n    if not d: return\n    n, k = int(d[0]), int(d[1])\n    a = [int(x) for x in d[2:n+2]]\n    thresh = a[k-1]\n    print(sum(1 for x in a if x >= thresh and x > 0))\n\nif __name__ == "__main__":\n    main()',
      java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt(), k = sc.nextInt();\n        int[] a = new int[n];\n        for (int i = 0; i < n; i++) a[i] = sc.nextInt();\n        int thresh = a[k - 1];\n        int ans = 0;\n        for (int x : a) if (x >= thresh && x > 0) ans++;\n        System.out.println(ans);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst tokens = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (tokens.length >= 2) {\n  const n = parseInt(tokens[0], 10), k = parseInt(tokens[1], 10);\n  const a = tokens.slice(2, n + 2).map(Number);\n  const thresh = a[k - 1];\n  console.log(a.filter(x => x >= thresh && x > 0).length);\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n, k int\n\tif _, err := fmt.Fscan(in, &n, &k); err != nil { return }\n\ta := make([]int, n)\n\tfor i := 0; i < n; i++ { fmt.Fscan(in, &a[i]) }\n\tthresh := a[k-1]\n\tans := 0\n\tfor _, x := range a {\n\t\tif x >= thresh && x > 0 { ans++ }\n\t}\n\tfmt.Println(ans)\n}'
    },
    testCases: [
      { input: '8 5\n10 9 8 7 7 7 5 5\n', expectedOutput: '6' },
      { input: '4 2\n0 0 0 0\n', expectedOutput: '0' }
    ]
  },
  // 5. Domino piling (50A, Rating 800)
  {
    slug: 'cf-50a-domino-piling',
    title: 'Domino piling',
    contestNumber: 50,
    problemIdentifier: '50A',
    rating: 800,
    difficulty: Difficulty.EASY,
    topic: 'Math',
    externalUrl: 'https://codeforces.com/problemset/problem/50/A',
    orderIndex: 5,
    tags: ['greedy', 'math', 'CP-31', 'Rating 800'],
    description: 'You are given a rectangular board of M x N squares. You also have an unlimited number of standard domino tiles of 2 x 1 size. Find the maximum number of dominoes which can be placed under these restrictions.',
    constraints: ['1 <= M <= N <= 16'],
    examples: [
      { input: '2 4', output: '4', explanation: '2x4 board fits (2*4)//2 = 4 dominoes.' },
      { input: '3 3', output: '4', explanation: '3x3 board fits (3*3)//2 = 4 dominoes.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long m, n; if (cin >> m >> n) cout << (m * n) / 2 << endl;\n    return 0;\n}',
      python: 'import sys\ndef main():\n    d = sys.stdin.read().split()\n    if d: print((int(d[0]) * int(d[1])) // 2)\nif __name__ == "__main__": main()',
      java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) System.out.println((sc.nextLong() * sc.nextLong()) / 2);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst t = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (t.length >= 2) console.log(Math.floor((Number(t[0]) * Number(t[1])) / 2));',
      go: 'package main\nimport "fmt"\nfunc main() {\n\tvar m, n int64\n\tif _, err := fmt.Scan(&m, &n); err == nil { fmt.Println((m * n) / 2) }\n}'
    },
    testCases: [
      { input: '2 4\n', expectedOutput: '4' },
      { input: '3 3\n', expectedOutput: '4' }
    ]
  },
  // 6. Beautiful Matrix (263A, Rating 800)
  {
    slug: 'cf-263a-beautiful-matrix',
    title: 'Beautiful Matrix',
    contestNumber: 263,
    problemIdentifier: '263A',
    rating: 800,
    difficulty: Difficulty.EASY,
    topic: 'Implementation',
    externalUrl: 'https://codeforces.com/problemset/problem/263/A',
    orderIndex: 6,
    tags: ['implementation', 'CP-31', 'Rating 800'],
    description: 'You\'ve got a 5x5 matrix consisting of 24 zeroes and a single number one. In one move you can swap two adjacent rows or columns. Count the minimum number of moves to bring the number one to the center (cell 3,3).',
    constraints: ['Matrix size is 5x5', '24 zeroes and 1 one'],
    examples: [
      { input: '0 0 0 0 0\n0 0 0 0 1\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0', output: '3', explanation: '|2 - 3| + |5 - 3| = 1 + 2 = 3 moves.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <cmath>\nusing namespace std;\n\nint main() {\n    for (int r = 1; r <= 5; r++) {\n        for (int c = 1; c <= 5; c++) {\n            int x; cin >> x;\n            if (x == 1) {\n                cout << abs(r - 3) + abs(c - 3) << endl;\n                return 0;\n            }\n        }\n    }\n    return 0;\n}',
      python: 'import sys\ndef main():\n    nums = [int(x) for x in sys.stdin.read().split()]\n    idx = nums.index(1)\n    r, c = idx // 5 + 1, idx % 5 + 1\n    print(abs(r - 3) + abs(c - 3))\nif __name__ == "__main__": main()',
      java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        for (int r = 1; r <= 5; r++) {\n            for (int c = 1; c <= 5; c++) {\n                if (sc.nextInt() == 1) {\n                    System.out.println(Math.abs(r - 3) + Math.abs(c - 3));\n                    return;\n                }\n            }\n        }\n    }\n}',
      javascript: 'const fs = require("fs");\nconst nums = fs.readFileSync(0, "utf-8").trim().split(/\\s+/).map(Number);\nconst idx = nums.indexOf(1);\nconst r = Math.floor(idx / 5) + 1, c = (idx % 5) + 1;\nconsole.log(Math.abs(r - 3) + Math.abs(c - 3));',
      go: 'package main\nimport (\n\t"fmt"\n\t"math"\n)\nfunc main() {\n\tfor r := 1; r <= 5; r++ {\n\t\tfor c := 1; c <= 5; c++ {\n\t\t\tvar x int\n\t\t\tfmt.Scan(&x)\n\t\t\tif x == 1 {\n\t\t\t\tfmt.Println(int(math.Abs(float64(r-3))) + int(math.Abs(float64(c-3))))\n\t\t\t\treturn\n\t\t\t}\n\t\t}\n\t}\n}'
    },
    testCases: [
      { input: '0 0 0 0 0\n0 0 0 0 1\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n', expectedOutput: '3' },
      { input: '0 0 0 0 0\n0 0 0 0 0\n0 1 0 0 0\n0 0 0 0 0\n0 0 0 0 0\n', expectedOutput: '1' }
    ]
  },
  // 7. Football (96A, Rating 900)
  {
    slug: 'cf-96a-football',
    title: 'Football',
    contestNumber: 96,
    problemIdentifier: '96A',
    rating: 900,
    difficulty: Difficulty.MEDIUM,
    topic: 'Strings',
    externalUrl: 'https://codeforces.com/problemset/problem/96/A',
    orderIndex: 7,
    tags: ['strings', 'implementation', 'CP-31', 'Rating 900'],
    description: 'Petya loves football. A situation is considered dangerous if there are at least 7 consecutive players of the same team (all zeroes or all ones). Determine if the given sequence represents a dangerous situation.',
    constraints: ['1 <= s.length <= 100', 'Contains only characters 0 and 1'],
    examples: [
      { input: '001001', output: 'NO', explanation: 'No 7 consecutive players of same team.' },
      { input: '1000000001', output: 'YES', explanation: 'Eight consecutive zeroes.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s; if (cin >> s) {\n        if (s.find("0000000") != string::npos || s.find("1111111") != string::npos) cout << "YES" << endl;\n        else cout << "NO" << endl;\n    }\n    return 0;\n}',
      python: 'import sys\ndef main():\n    s = sys.stdin.read().strip()\n    print("YES" if "0000000" in s or "1111111" in s else "NO")\nif __name__ == "__main__": main()',
      java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            System.out.println(s.contains("0000000") || s.contains("1111111") ? "YES" : "NO");\n        }\n    }\n}',
      javascript: 'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf-8").trim();\nconsole.log(s.includes("0000000") || s.includes("1111111") ? "YES" : "NO");',
      go: 'package main\nimport (\n\t"fmt"\n\t"strings"\n)\nfunc main() {\n\tvar s string\n\tif _, err := fmt.Scan(&s); err == nil {\n\t\tif strings.Contains(s, "0000000") || strings.Contains(s, "1111111") {\n\t\t\tfmt.Println("YES")\n\t\t} else {\n\t\t\tfmt.Println("NO")\n\t\t}\n\t}\n}'
    },
    testCases: [
      { input: '001001\n', expectedOutput: 'NO' },
      { input: '1000000001\n', expectedOutput: 'YES' }
    ]
  },
  // 8. Twins (160A, Rating 900)
  {
    slug: 'cf-160a-twins',
    title: 'Twins',
    contestNumber: 160,
    problemIdentifier: '160A',
    rating: 900,
    difficulty: Difficulty.MEDIUM,
    topic: 'Greedy',
    externalUrl: 'https://codeforces.com/problemset/problem/160/A',
    orderIndex: 8,
    tags: ['greedy', 'sortings', 'CP-31', 'Rating 900'],
    description: 'Two identical twins have a set of n coins. You want to take the minimum number of coins such that the sum of your coins is strictly greater than the sum of the remaining coins.',
    constraints: ['1 <= n <= 100', '1 <= a_i <= 100'],
    examples: [
      { input: '2\n3 3', output: '2', explanation: 'Taking 1 coin gives 3 == 3. Must take both coins.' },
      { input: '3\n2 1 2', output: '2', explanation: 'Taking coins 2 and 2 gives 4 > 1.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n; if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    int total = 0;\n    for (int i = 0; i < n; i++) { cin >> a[i]; total += a[i]; }\n    sort(a.rbegin(), a.rend());\n    int mySum = 0, count = 0;\n    for (int x : a) {\n        mySum += x;\n        count++;\n        if (mySum > total - mySum) break;\n    }\n    cout << count << endl;\n    return 0;\n}',
      python: 'import sys\ndef main():\n    d = [int(x) for x in sys.stdin.read().split()]\n    if not d: return\n    n = d[0]\n    a = sorted(d[1:n+1], reverse=True)\n    total = sum(a)\n    cur = 0\n    for i, x in enumerate(a, 1):\n        cur += x\n        if cur > total - cur:\n            print(i)\n            return\nif __name__ == "__main__": main()',
      java: 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNextInt()) return;\n        int n = sc.nextInt();\n        Integer[] a = new Integer[n];\n        int total = 0;\n        for (int i = 0; i < n; i++) { a[i] = sc.nextInt(); total += a[i]; }\n        Arrays.sort(a, Collections.reverseOrder());\n        int cur = 0, count = 0;\n        for (int x : a) {\n            cur += x; count++;\n            if (cur > total - cur) break;\n        }\n        System.out.println(count);\n    }\n}',
      javascript: 'const fs = require("fs");\nconst nums = fs.readFileSync(0, "utf-8").trim().split(/\\s+/).map(Number);\nif (nums.length) {\n  const n = nums[0];\n  const a = nums.slice(1, n + 1).sort((x, y) => y - x);\n  const total = a.reduce((s, x) => s + x, 0);\n  let cur = 0, count = 0;\n  for (const x of a) {\n    cur += x; count++;\n    if (cur > total - cur) break;\n  }\n  console.log(count);\n}',
      go: 'package main\nimport (\n\t"bufio"\n\t"fmt"\n\t"os"\n\t"sort"\n)\nfunc main() {\n\tin := bufio.NewReader(os.Stdin)\n\tvar n int\n\tif _, err := fmt.Fscan(in, &n); err != nil { return }\n\ta := make([]int, n)\n\ttotal := 0\n\tfor i := 0; i < n; i++ { fmt.Fscan(in, &a[i]); total += a[i] }\n\tsort.Slice(a, func(i, j int) bool { return a[i] > a[j] })\n\tcur, count := 0, 0\n\tfor _, x := range a {\n\t\tcur += x; count++\n\t\tif cur > total-cur { break }\n\t}\n\tfmt.Println(count)\n}'
    },
    testCases: [
      { input: '2\n3 3\n', expectedOutput: '2' },
      { input: '3\n2 1 2\n', expectedOutput: '2' }
    ]
  },
  // 9. Theatre Square (1A, Rating 1000)
  {
    slug: 'cf-1a-theatre-square',
    title: 'Theatre Square',
    contestNumber: 1,
    problemIdentifier: '1A',
    rating: 1000,
    difficulty: Difficulty.MEDIUM,
    topic: 'Math',
    externalUrl: 'https://codeforces.com/problemset/problem/1/A',
    orderIndex: 9,
    tags: ['math', 'CP-31', 'Rating 1000'],
    description: 'Theatre Square in the capital city of Berland has a rectangular shape with the size n x m meters. On the occasion of the city\'s anniversary, a decision was taken to pave the Square with square granite flagstones. Each flagstone is of the size a x a. What is the least number of flagstones needed to pave the Square?',
    constraints: ['1 <= n, m, a <= 10^9'],
    examples: [
      { input: '6 6 4', output: '4', explanation: 'Tiles along length: ceil(6/4)=2, along width: ceil(6/4)=2 -> 2*2=4.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n, m, a;\n    if (cin >> n >> m >> a) {\n        long long x = (n + a - 1) / a;\n        long long y = (m + a - 1) / a;\n        cout << x * y << endl;\n    }\n    return 0;\n}',
      python: 'import sys\ndef main():\n    d = [int(x) for x in sys.stdin.read().split()]\n    if d:\n        n, m, a = d[0], d[1], d[2]\n        print(((n + a - 1) // a) * ((m + a - 1) // a))\nif __name__ == "__main__": main()',
      java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLong()) {\n            long n = sc.nextLong(), m = sc.nextLong(), a = sc.nextLong();\n            long x = (n + a - 1) / a;\n            long y = (m + a - 1) / a;\n            System.out.println(x * y);\n        }\n    }\n}',
      javascript: 'const fs = require("fs");\nconst [n, m, a] = fs.readFileSync(0, "utf-8").trim().split(/\\s+/).map(BigInt);\nif (n && m && a) {\n  const x = (n + a - 1n) / a;\n  const y = (m + a - 1n) / a;\n  console.log((x * y).toString());\n}',
      go: 'package main\nimport "fmt"\nfunc main() {\n\tvar n, m, a int64\n\tif _, err := fmt.Scan(&n, &m, &a); err == nil {\n\t\tx := (n + a - 1) / a\n\t\ty := (m + a - 1) / a\n\t\tfmt.Println(x * y)\n\t}\n}'
    },
    testCases: [
      { input: '6 6 4\n', expectedOutput: '4' }
    ]
  },
  // 10. String Task (118A, Rating 1000)
  {
    slug: 'cf-118a-string-task',
    title: 'String Task',
    contestNumber: 118,
    problemIdentifier: '118A',
    rating: 1000,
    difficulty: Difficulty.MEDIUM,
    topic: 'Strings',
    externalUrl: 'https://codeforces.com/problemset/problem/118/A',
    orderIndex: 10,
    tags: ['strings', 'implementation', 'CP-31', 'Rating 1000'],
    description: 'Petya has a string. He deletes all vowels ("A", "O", "Y", "E", "U", "I"), inserts a character "." before each consonant, and writes all consonants in lowercase. Print the resulting string.',
    constraints: ['1 <= s.length <= 100'],
    examples: [
      { input: 'tour', output: '.t.r', explanation: 'o and u are deleted. .t and .r added.' },
      { input: 'Codeforces', output: '.c.d.f.r.c.s', explanation: 'All consonants converted to lowercase with dot.' }
    ],
    starterCode: {
      cpp: '#include <iostream>\n#include <string>\n#include <cctype>\nusing namespace std;\n\nint main() {\n    string s; if (!(cin >> s)) return 0;\n    string vowels = "aoyeui";\n    for (char c : s) {\n        char lc = tolower(c);\n        if (vowels.find(lc) == string::npos) {\n            cout << "." << lc;\n        }\n    }\n    cout << endl;\n    return 0;\n}',
      python: 'import sys\ndef main():\n    s = sys.stdin.read().strip()\n    v = "aoyeui"\n    res = ["." + c.lower() for c in s if c.lower() not in v]\n    print("".join(res))\nif __name__ == "__main__": main()',
      java: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (!sc.hasNext()) return;\n        String s = sc.next();\n        String v = "aoyeui";\n        StringBuilder sb = new StringBuilder();\n        for (char c : s.toCharArray()) {\n            char lc = Character.toLowerCase(c);\n            if (v.indexOf(lc) == -1) sb.append(\'.\').append(lc);\n        }\n        System.out.println(sb.toString());\n    }\n}',
      javascript: 'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf-8").trim();\nconst v = "aoyeui";\nconst res = [];\nfor (const c of s) {\n  const lc = c.toLowerCase();\n  if (!v.includes(lc)) res.push("." + lc);\n}\nconsole.log(res.join(""));',
      go: 'package main\nimport (\n\t"fmt"\n\t"strings"\n\t"unicode"\n)\nfunc main() {\n\tvar s string\n\tif _, err := fmt.Scan(&s); err == nil {\n\t\tv := "aoyeui"\n\t\tvar sb strings.Builder\n\t\tfor _, r := range s {\n\t\t\tlc := unicode.ToLower(r)\n\t\t\tif !strings.ContainsRune(v, lc) {\n\t\t\t\tsb.WriteRune(\'.\')\n\t\t\t\tsb.WriteRune(lc)\n\t\t\t}\n\t\t}\n\t\tfmt.Println(sb.String())\n\t}\n}'
    },
    testCases: [
      { input: 'tour\n', expectedOutput: '.t.r' },
      { input: 'Codeforces\n', expectedOutput: '.c.d.f.r.c.s' }
    ]
  }
];
