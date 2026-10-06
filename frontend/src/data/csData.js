// =============================================================================
// TutorMind - Computer Science Curriculum (Book 07)
// =============================================================================

export const csData = {
  'Computer Science:Algorithms and Big-O': {
    id: 'Computer Science:Algorithms and Big-O',
    topic: 'Computer Science',
    subjectNum: 7,
    chapterNum: 1,
    title: 'Algorithms and Big-O',
    subtitle: 'Asymptotic Analysis, Time & Space Complexity, and Search Algorithms',
    readTime: '7 min read',
    difficulty: 'Foundational',
    overview: 'An algorithm is a step-by-step recipe for solving a computational problem. Big-O notation gives software engineers a rigorous mathematical framework to measure how code scales as inputs grow from ten items to ten billion.',
    theory: `### 1. What is an Algorithm?
In computer science, an **algorithm** is an unambiguous, finite sequence of well-defined computer-implementable instructions designed to solve a class of specific problems or perform a computation.

### 2. Why Scalability Matters
A program might execute in $0.001$ seconds on an array of $10$ items. But what happens when that dataset grows to $10,000,000$ users?
- Bad algorithms crash servers and run out of memory.
- Optimal algorithms scale gracefully across massive distributed clouds.

### 3. Big-O Notation: The Common Complexities
Big-O ($O$) describes the upper bound (worst-case scenario) of runtime or memory as input size $n \\to \\infty$:

| Notation | Name | Practical Example | Speed on $n = 10^6$ |
|---|---|---|---|
| **$O(1)$** | Constant Time | Accessing an array element by index \`arr[0]\` | Instant ($\sim 1$ op) |
| **$O(\\log n)$** | Logarithmic Time | Binary Search on sorted records | $\sim 20$ ops |
| **$O(n)$** | Linear Time | Scanning an unsorted list for a value | $1,000,000$ ops |
| **$O(n \\log n)$** | Log-Linear Time | Merge Sort / Quick Sort | $\sim 20,000,000$ ops |
| **$O(n^2)$** | Quadratic Time | Nested loops / Bubble Sort | $10^{12}$ ops (Hours!) |
| **$O(2^n)$** | Exponential Time | Brute-force traveling salesperson | Heat death of universe |

### 4. Search Algorithms: Linear vs. Binary Search
#### Linear Search ($O(n)$)
Checks every element one by one from beginning to end. Works on unsorted data.

#### Binary Search ($O(\\log n)$)
Requires data to be **sorted**. Cuts the search space in half with every step:
$$\\text{Maximum Comparisons} = \\lceil \\log_2 n \\rceil$$
For $n = 1,000,000,000$ items, Binary Search finds any target in just **30 comparisons**!`,
    definitions: [
      {
        term: 'Time Complexity',
        symbol: 'O(f(n))',
        meaning: 'A mathematical function quantifying the amount of time an algorithm takes to run as a function of input length $n$.',
        example: 'A loop that inspects each of $n$ elements has $O(n)$ time complexity.'
      },
      {
        term: 'Binary Search',
        symbol: 'O(\\log_2 n)',
        meaning: 'A fast search algorithm that repeatedly divides a sorted interval in half.',
        example: 'Searching for a word in a physical dictionary by opening to the middle, checking whether your word comes before or after, and repeating.'
      }
    ],
    keyFormulas: [
      {
        name: 'Binary Search Comparisons',
        formula: 'k = \\lceil \\log_2(n) \\rceil',
        note: 'For $10^6$ items: $\\log_2(10^6) \\approx 20$ operations.'
      }
    ],
    workedExamples: [
      {
        problem: 'Analyze the Big-O time complexity of the following code snippet:\nfor (int i = 0; i < n; i++) {\n  for (int j = 0; j < n; j++) {\n    print(i, j);\n  }\n}',
        difficulty: 'Beginner',
        steps: [
          'Look at outer loop: it runs $n$ times ($i = 0$ to $n-1$).',
          'Look at inner loop: for every single iteration of $i$, the inner loop executes $n$ times ($j = 0$ to $n-1$).',
          'Multiply the operations: $n \\times n = n^2$.',
          'State the upper bound in Big-O notation: $O(n^2)$ (Quadratic Time).'
        ],
        finalAnswer: '$O(n^2)$',
        proTip: 'Whenever you see two independent nested loops running up to $n$, suspect $O(n^2)$!'
      }
    ],
    pitfalls: [
      'Forgetting that Binary Search REQUIRES sorted arrays: Running binary search on an unsorted array produces incorrect results.',
      'Assuming $O(n^2)$ is always slower than $O(n)$ for tiny inputs: For $n = 3$, constant overheads might make an $O(n^2)$ routine faster. Big-O matters as $n$ grows large.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'How many maximum comparisons does Binary Search need to find an element in a sorted list of 1,024 elements?',
        options: ['10', '512', '1,024', '20'],
        answer: '10',
        explanation: 'Because $2^{10} = 1,024$, binary search divides by two ten times: $\\log_2(1,024) = 10$.'
      },
      {
        id: 'q2',
        question: 'What is the time complexity of accessing the 500th element in an indexed array (`arr[500]`)?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(500)'],
        answer: 'O(1)',
        explanation: 'Arrays store elements in contiguous memory, allowing instant $O(1)$ constant-time calculation of the element memory address.'
      },
      {
        id: 'q3',
        question: 'Which Big-O complexity represents the most efficient scaling as $n$ approaches millions?',
        options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'],
        answer: 'O(log n)',
        explanation: 'Logarithmic time ($O(\\log n)$) scales dramatically flatter and faster than linear ($O(n)$) or polynomial ($O(n^2)$) curves.'
      }
    ]
  },

  'Computer Science:Data structures': {
    id: 'Computer Science:Data structures',
    topic: 'Computer Science',
    subjectNum: 7,
    chapterNum: 2,
    title: 'Data structures',
    subtitle: 'Memory Layout, Linked Lists, Stacks, Queues, and Binary Search Trees',
    readTime: '8 min read',
    difficulty: 'Intermediate',
    overview: 'Data structures organize and store data in computer memory so operations like search, insertion, and deletion can be carried out efficiently. Choosing the right data structure is often the single most important decision in software architecture.',
    theory: `### 1. The Core Data Structures
Programs need structured ways to model everything from shopping carts to web pages.

### 2. Arrays vs. Linked Lists
- **Array**: Contiguous block of memory cells.
  - **Lookup by index**: $O(1)$ instant.
  - **Insertion/Deletion at front**: $O(n)$ (must shift all following elements).
- **Linked List**: Nodes scattered across RAM, each holding data and a pointer (\`next\`) to the subsequent node.
  - **Lookup by index**: $O(n)$ (must traverse from head node).
  - **Insertion at head**: $O(1)$ instant.

### 3. Stacks and Queues (Constrained Linear Collections)
- **Stack (LIFO: Last-In, First-Out)**:
  - Like a stack of dinner plates: \`push()\` adds to top, \`pop()\` removes from top.
  - Used in: Browser back button, undo history, compiler call stack.
- **Queue (FIFO: First-In, First-Out)**:
  - Like a line of people at a movie theater: \`enqueue()\` joins back, \`dequeue()\` leaves front.
  - Used in: Printer print jobs, web server request buffers.

### 4. Hash Tables (Hash Maps)
Key-value storage offering average $O(1)$ retrieval:
$$h(\\text{key}) = \\text{hash code} \\pmod m$$
Uses a **hash function** to map string/object keys directly into memory array indices.

### 5. Binary Search Trees (BST)
A hierarchical node structure where every node has at most two children satisfying the **BST Invariant**:
$$\\text{Left Subtree} < \\text{Node Value} < \\text{Right Subtree}$$
Offers $O(\\log n)$ search, insert, and delete when balanced.`,
    definitions: [
      {
        term: 'Stack',
        symbol: 'LIFO',
        meaning: 'A linear data structure allowing operations at only one end (top).',
        example: 'Function call stack in programming languages.'
      },
      {
        term: 'Queue',
        symbol: 'FIFO',
        meaning: 'A linear collection where elements are added at the rear and removed from the front.',
        example: 'A playlist queue or message queue.'
      },
      {
        term: 'Binary Search Tree (BST)',
        symbol: 'Left < Root < Right',
        meaning: 'A tree where every left descendant is smaller and every right descendant is greater than the parent node.',
        example: 'Used to maintain sorted sets with fast insertions and lookups.'
      }
    ],
    keyFormulas: [
      {
        name: 'Array Memory Addressing',
        formula: '\\text{Address}(i) = \\text{Base} + i \\times \\text{ElementSize}',
        note: 'Explains why arrays have $O(1)$ random access speed.'
      },
      {
        name: 'Balanced Tree Height',
        formula: 'h = \\lfloor \\log_2 n \\rfloor',
        note: 'Ensures search takes logarithmic time in balanced trees.'
      }
    ],
    workedExamples: [
      {
        problem: 'Given an empty stack, trace the contents after: push(5), push(9), pop(), push(3), push(1), pop().',
        difficulty: 'Beginner',
        steps: [
          'Start: []',
          'push(5) -> [5]',
          'push(9) -> [5, 9]',
          'pop() removes 9 -> [5]',
          'push(3) -> [5, 3]',
          'push(1) -> [5, 3, 1]',
          'pop() removes 1 -> [5, 3]'
        ],
        finalAnswer: 'Stack contents from bottom to top: [5, 3]',
        proTip: 'Remember: LIFO means the last item pushed is the very first item popped!'
      }
    ],
    pitfalls: [
      'Attempting to pop from an empty stack: Causes a "Stack Underflow" error.',
      'Unbalanced BSTs degenerating into linked lists: If you insert sorted items (1, 2, 3, 4, 5) into a naive BST, it becomes a single chain with slow $O(n)$ search time.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which data structure behaves as First-In, First-Out (FIFO)?',
        options: ['Queue', 'Stack', 'Tree', 'Array'],
        answer: 'Queue',
        explanation: 'A Queue operates under the FIFO principle: the first element inserted is the first element removed.'
      },
      {
        id: 'q2',
        question: 'In a valid Binary Search Tree, where must an element with a value smaller than the root node be placed?',
        options: [
          'In the left subtree of the root',
          'In the right subtree of the root',
          'At the root itself',
          'In the sibling node'
        ],
        answer: 'In the left subtree of the root',
        explanation: 'The BST invariant states that all nodes in the left subtree must have values strictly less than the root node.'
      },
      {
        id: 'q3',
        question: 'What is the average time complexity to look up a value by key in a Hash Map?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        answer: 'O(1)',
        explanation: 'Hash Maps calculate an index directly from the key using a hash function, providing average $O(1)$ constant time access.'
      }
    ]
  },

  'Computer Science:Binary and digital logic': {
    id: 'Computer Science:Binary and digital logic',
    topic: 'Computer Science',
    subjectNum: 7,
    chapterNum: 3,
    title: 'Binary and digital logic',
    subtitle: 'Base-2 Number System, Two Complement, Logic Gates, and Bitwise Math',
    readTime: '7 min read',
    difficulty: 'Intermediate',
    overview: 'Underneath every pixel, web page, and video game is the binary language of 1s and 0s. Understanding binary math and Boolean logic reveals how silicon transistors compute complex mathematical logic.',
    theory: `### 1. The Binary System (Base 2)
Humans use Base 10 (decimal) because we have ten fingers. Computers use Base 2 (binary) because electronic transistors are either **ON (1)** or **OFF (0)**.

#### Positional Value in Binary
$$\\begin{aligned}
2^7 &= 128 \\\\
2^6 &= 64 \\\\
2^5 &= 32 \\\\
2^4 &= 16 \\\\
2^3 &= 8 \\\\
2^2 &= 4 \\\\
2^1 &= 2 \\\\
2^0 &= 1
\\end{aligned}$$

Converting \`101010\` to decimal:
$$1(32) + 0(16) + 1(8) + 0(4) + 1(2) + 0(1) = 32 + 8 + 2 = 42$$

### 2. Bits, Bytes, and Hexadecimal
- **Bit**: A single binary digit (\`0\` or \`1\`).
- **Byte**: 8 bits (can represent $2^8 = 256$ values from 0 to 255).
- **Hexadecimal (Base 16)**: Shorthand notation for bytes ($0-9, A=10, B=11, C=12, D=13, E=14, F=15$). One hex digit represents exactly 4 bits (a nibble).

### 3. Boolean Logic Gates
Silicon chips combine microscopic transistors into fundamental logic gates:

1. **AND ($\\land$)**: Outputs 1 only if BOTH inputs are 1.
2. **OR ($\\lor$)**: Outputs 1 if AT LEAST ONE input is 1.
3. **NOT ($\\neg$)**: Inverts input ($1 \\to 0$, $0 \\to 1$).
4. **XOR ($\\oplus$)**: Exclusive OR: Outputs 1 if inputs are DIFFERENT (one is 1, one is 0).

### 4. Bitwise Operators in Code
- **AND (\`a & b\`)**: Masking specific bits.
- **OR (\`a | b\`)**: Setting flags.
- **XOR (\`a ^ b\`)**: Toggling bits, cryptography, checksums.
- **Left Shift (\`x << 1\`)**: Fast multiplication by 2.
- **Right Shift (\`x >> 1\`)**: Fast integer division by 2.`,
    definitions: [
      {
        term: 'Bit',
        symbol: 'b',
        meaning: 'The smallest fundamental unit of digital information, holding 0 or 1.',
        example: 'A single transistor switch state.'
      },
      {
        term: 'XOR Gate',
        symbol: 'A \\oplus B',
        meaning: 'Outputs true if and only if exactly one input is true.',
        example: '$1 \\oplus 1 = 0$, $1 \\oplus 0 = 1$, $0 \\oplus 0 = 0$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Binary to Decimal Sum',
        formula: 'V = \\sum_{i=0}^{n-1} b_i \\cdot 2^i',
        note: 'Each bit $b_i$ is multiplied by 2 raised to its positional index.'
      },
      {
        name: 'Bit-shift Multiplication Rule',
        formula: 'x \\ll k = x \\cdot 2^k',
        note: 'Left shifting by $k$ bits multiplies an integer by $2^k$.'
      }
    ],
    workedExamples: [
      {
        problem: 'Convert the decimal number 25 into an 8-bit binary representation.',
        difficulty: 'Beginner',
        steps: [
          'Find highest power of 2 less than or equal to 25: $16$ ($2^4$). Remaining: $25 - 16 = 9$.',
          'Next power is 8: $9 \\geq 8$. Remaining: $9 - 8 = 1$.',
          'Next power is 4: $1 < 4$, so 0.',
          'Next power is 2: $1 < 2$, so 0.',
          'Next power is 1: $1 \\geq 1$. Remaining: 0.',
          'Assemble 8 bits: $16 + 8 + 1 \\implies 00011001_2$.'
        ],
        finalAnswer: '$00011001_2$',
        proTip: 'Verify: $16 + 8 + 1 = 25$. Correct!'
      }
    ],
    pitfalls: [
      'Integer Overflow: Adding 1 to an 8-bit unsigned integer holding 255 rolls over to 0 because there is no 9th bit to store 256.',
      'Confusing logical operators (`&&`, `||`) with bitwise operators (`&`, `|`).'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the decimal equivalent of the binary number 1101₂?',
        options: ['13', '11', '15', '9'],
        answer: '13',
        explanation: '$1(8) + 1(4) + 0(2) + 1(1) = 8 + 4 + 0 + 1 = 13$.'
      },
      {
        id: 'q2',
        question: 'What is the result of the bitwise operation 1010₂ XOR 1100₂?',
        options: ['0110₂', '1110₂', '1000₂', '0000₂'],
        answer: '0110₂',
        explanation: 'Compare bit by bit: $1\\oplus 1 = 0$, $0\\oplus 1 = 1$, $1\\oplus 0 = 1$, $0\\oplus 0 = 0$, giving $0110_2$ (decimal 6).'
      },
      {
        id: 'q3',
        question: 'How many distinct values can be stored in one byte (8 bits)?',
        options: ['256', '128', '64', '512'],
        answer: '256',
        explanation: '$2^8 = 256$ unique values (conventionally representing numbers from 0 to 255).'
      }
    ]
  },

  'Computer Science:Recursion and divide-conquer': {
    id: 'Computer Science:Recursion and divide-conquer',
    topic: 'Computer Science',
    subjectNum: 7,
    chapterNum: 4,
    title: 'Recursion and divide-conquer',
    subtitle: 'Base Cases, The Call Stack, Merge Sort, and Recursive Thinking',
    readTime: '8 min read',
    difficulty: 'Advanced',
    overview: 'Recursion occurs when a function calls itself to solve a smaller instance of the same problem. Combined with divide-and-conquer strategy, recursion powers industry-standard sorting, tree parsing, and graph algorithms.',
    theory: `### 1. The Anatomy of Recursion
Every valid recursive function must possess two core components:
1. **The Base Case**: A trivial condition that returns directly without calling the function again (the stop condition).
2. **The Recursive Step**: Calling the function with an argument closer to the base case.

Without a base case, the function loops infinitely until exhausting computer memory (**Stack Overflow**).

### 2. Classic Example: Factorial ($n!$)
Mathematically defined as:
$$n! = \\begin{cases} 1 & \\text{if } n = 0 \\text{ or } 1 \\quad (\\text{Base Case}) \\\\ n \\times (n-1)! & \\text{if } n > 1 \\quad (\\text{Recursive Step}) \\end{cases}$$

### 3. The Call Stack
Each recursive invocation pushes a new **stack frame** onto the call stack containing local variables and return address. When the base case is hit, stack frames resolve and pop off in reverse order.

### 4. Divide-and-Conquer Paradigm
1. **Divide**: Split large problem into smaller subproblems.
2. **Conquer**: Solve subproblems recursively.
3. **Combine**: Merge subproblem solutions into the final answer.

### 5. Merge Sort Algorithm ($O(n \\log n)$)
- Recursively divides array in half until individual elements remain ($n$ arrays of size 1).
- Merges sorted halves back together in linear $O(n)$ time.
- Guaranteed $O(n \\log n)$ time complexity even in the worst case.`,
    definitions: [
      {
        term: 'Base Case',
        symbol: 'n \\leq 1',
        meaning: 'The terminating condition in a recursive algorithm that stops further recursion.',
        example: 'In factorial, returning 1 when $n = 0$.'
      },
      {
        term: 'Stack Overflow',
        symbol: 'Error',
        meaning: 'A fatal runtime error occurring when the call stack exceeds its allocated memory limit due to excessive recursion.',
        example: 'Infinite recursion without a working base case.'
      }
    ],
    keyFormulas: [
      {
        name: 'Merge Sort Recurrence',
        formula: 'T(n) = 2T(n/2) + O(n) = O(n \\log n)',
        note: 'Master theorem confirms optimal $O(n \\log n)$ sorting speed.'
      }
    ],
    workedExamples: [
      {
        problem: 'Trace the recursive execution of factorial(4).',
        difficulty: 'Beginner',
        steps: [
          'Call factorial(4): needs 4 * factorial(3)',
          'Call factorial(3): needs 3 * factorial(2)',
          'Call factorial(2): needs 2 * factorial(1)',
          'Call factorial(1): hits base case, returns 1',
          'Unwind stack: factorial(2) returns 2 * 1 = 2',
          'Unwind stack: factorial(3) returns 3 * 2 = 6',
          'Unwind stack: factorial(4) returns 4 * 6 = 24'
        ],
        finalAnswer: '24',
        proTip: 'Always write down and verify your base case before coding the recursive call!'
      }
    ],
    pitfalls: [
      'Missing the base case: Causes infinite recursive calls leading to stack overflow.',
      'Using naive recursion for Fibonacci: `fib(n) = fib(n-1) + fib(n-2)` calculates identical subproblems repeatedly in exponential $O(2^n)$ time without memoization.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What happens if a recursive function does not have a base case?',
        options: [
          'It runs until memory is exhausted and crashes with Stack Overflow',
          'It automatically returns 0',
          'The compiler rejects the program',
          'It executes in O(1) time'
        ],
        answer: 'It runs until memory is exhausted and crashes with Stack Overflow',
        explanation: 'Without a base case, new stack frames keep accumulating on the call stack until memory is exhausted, throwing a Stack Overflow error.'
      },
      {
        id: 'q2',
        question: 'What is the worst-case time complexity of Merge Sort on an array of n items?',
        options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
        answer: 'O(n log n)',
        explanation: 'Merge sort always splits in half ($\\log n$ levels) and merges in linear $O(n)$ time per level, guaranteeing $O(n \\log n)$ worst-case complexity.'
      },
      {
        id: 'q3',
        question: 'Which principle characterizes the Divide-and-Conquer strategy?',
        options: [
          'Dividing a problem into subproblems, solving them recursively, and combining results',
          'Checking every possible solution sequentially',
          'Storing items in Last-In First-Out order',
          'Using bitwise operations to compute results'
        ],
        answer: 'Dividing a problem into subproblems, solving them recursively, and combining results',
        explanation: 'Divide-and-Conquer splits problems recursively into smaller manageable pieces and merges their solutions.'
      }
    ]
  }
};
