// =============================================================================
// TutorMind Comprehensive Textbook Curriculum Engine
// Contains in-depth chapter theory, KaTeX formulas, formal definitions,
// multi-step worked examples, pitfalls, and progressive 3-question quizzes.
import { physicsData } from './physicsData.js';
import { csData } from './csData.js';
import { chemistryData } from './chemistryData.js';

export const textbookData = {
  // ===========================================================================
  // ALGEBRA
  // ===========================================================================
  'Algebra:Foundations of variables': {
    id: 'Algebra:Foundations of variables',
    topic: 'Algebra',
    subjectNum: 1,
    chapterNum: 1,
    title: 'Foundations of variables',
    subtitle: 'Variables, Constants, Coefficients, and Mathematical Modeling',
    readTime: '6 min read',
    difficulty: 'Foundational',
    overview: 'In arithmetic, numbers are fixed values like $5$ or $12$. In algebra, we introduce symbols (usually letters like $x, y, z$) called variables to represent unknown quantities, varying values, or generalized rules.',
    theory: `### 1. The Language of Algebra
Arithmetic allows us to calculate specific quantities: for example, $5 + 3 = 8$. But what if we want to express a pattern that works for **any** number? Or what if a number is unknown?

In algebra, a **variable** is a letter or symbol that stands for a quantity that may change or is currently unknown. The word *variable* comes from the Latin *variare*, meaning "to change".

#### Anatomy of an Algebraic Term
Consider the expression:
$$7x^2 - 4x + 9$$

- **Variable**: The letter representing an unknown quantity ($x$).
- **Coefficient**: The numerical factor multiplying a variable. In $7x^2$, the coefficient of $x^2$ is **$7$**. In $-4x$, the coefficient is **$-4$**. If a variable appears alone like $x$, its coefficient is implicitly **$1$** ($1x = x$).
- **Constant**: A fixed number with no variable attached. Here, **$+9$** is the constant term.
- **Exponent (Power)**: The degree to which a variable is raised. In $7x^2$, the exponent is **$2$**.

### 2. Why Do We Use Letters?
1. **To solve for unknowns**: If a mystery number plus $4$ equals $10$, we write:
   $$x + 4 = 10 \implies x = 6$$
2. **To state universal laws**: The commutative property of addition holds for all real numbers:
   $$a + b = b + a$$
3. **To model real-world relationships**: If a taxi charges a $\\$3$ base fare plus $\\$2$ per mile ($m$), the total cost $C$ is:
   $$C = 2m + 3$$`,
    definitions: [
      {
        term: 'Variable',
        symbol: 'x, y, t, \\theta',
        meaning: 'A symbol representing an unknown or changing quantity.',
        example: 'In $3x + 2 = 11$, $x$ is the variable representing the value $3$.'
      },
      {
        term: 'Coefficient',
        symbol: 'a \\text{ in } ax',
        meaning: 'The numerical factor multiplied with a variable term.',
        example: 'In $-5y$, the coefficient is $-5$. In $z$, the coefficient is $1$.'
      },
      {
        term: 'Constant',
        symbol: 'c',
        meaning: 'A fixed numerical value that does not change.',
        example: 'In $4x + 9$, the number $9$ is the constant term.'
      },
      {
        term: 'Term',
        symbol: 'ax^n',
        meaning: 'A single number, variable, or product of numbers and variables separated by $+$ or $-$ signs.',
        example: 'The expression $2x^2 - 3x + 5$ has three terms: $2x^2$, $-3x$, and $5$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Implicit Multiplication Rule',
        formula: 'a \\cdot b = a(b) = ab',
        note: 'When a number sits right next to a variable (e.g. $4x$), multiplication is implied: $4 \\times x$.'
      },
      {
        name: 'Identity Coefficient',
        formula: '1 \\cdot x = x, \\quad -1 \\cdot x = -x',
        note: 'Coefficients of $1$ and $-1$ are rarely written explicitly.'
      },
      {
        name: 'Substitution Property',
        formula: '\\text{If } x = k, \\text{ then } f(x) = f(k)',
        note: 'To evaluate an expression, replace every occurrence of the variable with its assigned numerical value using parentheses.'
      }
    ],
    workedExamples: [
      {
        problem: 'Identify the coefficients, variables, and constants in the algebraic expression: $8y^3 - 5y + 14$',
        difficulty: 'Beginner',
        steps: [
          'Identify all distinct terms separated by addition and subtraction: the terms are $8y^3$, $-5y$, and $14$.',
          'Identify the variable: the variable present in the terms is $y$.',
          'Find the coefficients: the coefficient of $y^3$ is $8$, and the coefficient of $y$ is $-5$.',
          'Identify the constant: the term with no variable attached is $+14$.'
        ],
        finalAnswer: 'Variables: $y$ | Coefficients: $8$ (for $y^3$) and $-5$ (for $y$) | Constant: $14$',
        proTip: 'Always include the negative sign with the coefficient! In $-5y$, the coefficient is $-5$, not $5$.'
      },
      {
        problem: 'Evaluate the expression $3x^2 - 4x + 7$ when $x = -2$.',
        difficulty: 'Intermediate',
        steps: [
          'Substitute $x = (-2)$ into the expression using parentheses to maintain correct signs: $3(-2)^2 - 4(-2) + 7$.',
          'Apply the order of operations (PEMDAS): calculate exponent $(-2)^2 = 4$.',
          'Perform multiplications: $3(4) = 12$ and $-4(-2) = +8$.',
          'Add the remaining terms: $12 + 8 + 7 = 27$.'
        ],
        finalAnswer: '27',
        proTip: 'Careful with $(-2)^2$ vs $-2^2$. $(-2)^2 = (-2) \\times (-2) = +4$, whereas $-2^2 = -(2^2) = -4$. Always wrap negative numbers in parentheses when substituting.'
      }
    ],
    pitfalls: [
      'Dropping negative signs: In $-3x$, the coefficient is $-3$, not $+3$.',
      'Confusing variables with multiplication signs: $2 \\times x$ is written as $2x$ to avoid confusing the letter $x$ with the cross multiplication symbol $\\times$.',
      'Assuming $x$ without a number has coefficient $0$: The term $x$ means $1x$. If the coefficient were $0$, $0x = 0$ and the term would vanish.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'In the expression $-9x^2 + 4x - 13$, what is the coefficient of $x^2$?',
        options: ['9', '-9', '4', '-13'],
        answer: '-9',
        explanation: 'The coefficient of $x^2$ is the numerical factor directly multiplying $x^2$, including its sign: $-9$.'
      },
      {
        id: 'q2',
        question: 'What is the value of the expression $2a^2 - 3a + 5$ when $a = 3$?',
        options: ['14', '20', '32', '11'],
        answer: '14',
        explanation: 'Substitute $a=3$: $2(3)^2 - 3(3) + 5 = 2(9) - 9 + 5 = 18 - 9 + 5 = 14$.'
      },
      {
        id: 'q3',
        question: 'A car rental company charges a flat fee of $30 plus $0.20 per mile driven ($m$). Which expression represents the total cost for driving $m$ miles?',
        options: ['30m + 0.20', '0.20m + 30', '30.20m', 'm + 30.20'],
        answer: '0.20m + 30',
        explanation: 'The per-mile charge depends on $m$, so it multiplies $m$ ($0.20m$), while the fixed $\\$30$ flat fee is the constant ($+30$).'
      }
    ]
  },

  'Algebra:Expressions and simplification': {
    id: 'Algebra:Expressions and simplification',
    topic: 'Algebra',
    subjectNum: 1,
    chapterNum: 2,
    title: 'Expressions and simplification',
    subtitle: 'Order of Operations, Distributive Property, and Combining Like Terms',
    readTime: '7 min read',
    difficulty: 'Foundational',
    overview: 'Algebraic expressions can look messy, but using the distributive law and combining like terms allows us to rewrite complicated expressions into clean, equivalent, and manageable forms.',
    theory: `### 1. What are Like Terms?
**Like terms** are terms whose variable parts (including exponents) are identical. Only their numerical coefficients may differ.

- **Like Terms**: $4x$ and $-9x$; $3x^2y$ and $7x^2y$; $12$ and $-5$ (constants are like terms).
- **Unlike Terms**: $3x$ and $3x^2$ (different exponents); $5x$ and $5y$ (different variables).

#### Combining Like Terms
To combine like terms, add or subtract their coefficients while keeping the variable base unchanged:
$$5x + 3x = (5 + 3)x = 8x$$
$$7x^2 - 2x^2 + 4x = 5x^2 + 4x$$

### 2. The Distributive Property
The **distributive property** states that multiplying a sum by a number gives the same result as multiplying each addend individually:
$$a(b + c) = ab + ac$$
$$a(b - c) = ab - ac$$

When expanding with a negative sign outside parentheses:
$$-(3x - 5) = -1 \\cdot (3x - 5) = -3x + 5$$

### 3. Standard Order of Operations (PEMDAS / BODMAS)
1. **P**arentheses & Grouping symbols: $( ), [ ], \\{ \\}, | |$
2. **E**xponents & Roots: $x^2, \\sqrt{x}$
3. **M**ultiplication & **D**ivision (from left to right)
4. **A**ddition & **S**ubtraction (from left to right)`,
    definitions: [
      {
        term: 'Like Terms',
        symbol: 'ax^k, \\; bx^k',
        meaning: 'Terms containing the exact same variables raised to the exact same powers.',
        example: '$5xy^2$ and $-2xy^2$ are like terms because both have variable part $xy^2$.'
      },
      {
        term: 'Distributive Law',
        symbol: 'a(b + c) = ab + ac',
        meaning: 'Multiplying a monomial factor across every term inside parentheses.',
        example: '$3(2x + 4) = 6x + 12$.'
      },
      {
        term: 'Equivalent Expressions',
        symbol: 'E_1 \\equiv E_2',
        meaning: 'Two algebraic expressions that yield the exact same output for every allowable input value.',
        example: '$2(x + 3)$ and $2x + 6$ are equivalent.'
      }
    ],
    keyFormulas: [
      {
        name: 'Distributive Property',
        formula: 'a(bx + c) = abx + ac',
        note: 'Multiply the outside coefficient $a$ by both $bx$ and $c$.'
      },
      {
        name: 'Double Distributive (FOIL)',
        formula: '(a + b)(c + d) = ac + ad + bc + bd',
        note: 'First, Outside, Inside, Last terms multiplied systematically.'
      },
      {
        name: 'Negation Distribution',
        formula: '-(a - b) = -a + b',
        note: 'Distributing a minus sign flips the sign of every term inside.'
      }
    ],
    workedExamples: [
      {
        problem: 'Simplify the algebraic expression: $4(2x - 3) - 3(x - 5) + 6$',
        difficulty: 'Intermediate',
        steps: [
          'Distribute $4$ into $(2x - 3)$: $4 \\cdot 2x - 4 \\cdot 3 = 8x - 12$.',
          'Distribute $-3$ into $(x - 5)$: $-3 \\cdot x - 3 \\cdot (-5) = -3x + 15$.',
          'Reassemble all terms: $8x - 12 - 3x + 15 + 6$.',
          'Group like terms: $(8x - 3x) + (-12 + 15 + 6)$.',
          'Combine coefficients: $5x + 9$.'
        ],
        finalAnswer: '5x + 9',
        proTip: 'Be very vigilant with $-3(x - 5)$: the negative times a negative gives $+15$. Sign mistakes here are the most frequent algebra error.'
      },
      {
        problem: 'Expand and simplify: $(2x + 3)(x - 4)$',
        difficulty: 'Intermediate',
        steps: [
          'Multiply First terms: $2x \\cdot x = 2x^2$.',
          'Multiply Outside terms: $2x \\cdot (-4) = -8x$.',
          'Multiply Inside terms: $3 \\cdot x = 3x$.',
          'Multiply Last terms: $3 \\cdot (-4) = -12$.',
          'Combine middle like terms: $-8x + 3x = -5x$.'
        ],
        finalAnswer: '2x^2 - 5x - 12',
        proTip: 'Always check if the two middle terms are like terms and can be combined.'
      }
    ],
    pitfalls: [
      'Adding unlike terms: $3x + 4$ CANNOT be simplified to $7x$. They are unlike terms.',
      'Forgetting to distribute to the second term: Writing $2(x + 4) = 2x + 4$ instead of $2x + 8$.',
      'Misinterpreting exponent multiplication: $x \\cdot x = x^2$, but $x + x = 2x$.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Simplify by combining like terms: $7x - 4 + 2x - 9$',
        options: ['9x - 13', '9x + 5', '5x - 13', '9x^2 - 13'],
        answer: '9x - 13',
        explanation: 'Combine $x$-terms: $7x + 2x = 9x$. Combine constant terms: $-4 - 9 = -13$. Result is $9x - 13$.'
      },
      {
        id: 'q2',
        question: 'What is the expanded form of $-2(3x - 7)$?',
        options: ['-6x - 14', '-6x + 14', '6x - 14', '-6x - 7'],
        answer: '-6x + 14',
        explanation: 'Distribute $-2$: $-2 \\times 3x = -6x$ and $-2 \\times (-7) = +14$. Thus $-6x + 14$.'
      },
      {
        id: 'q3',
        question: 'Simplify completely: $5(x + 2) - 2(2x - 1)$',
        options: ['x + 12', 'x + 8', '9x + 12', 'x + 9'],
        answer: 'x + 12',
        explanation: 'Expand: $5x + 10 - 4x + 2 = (5x - 4x) + (10 + 2) = x + 12$.'
      }
    ]
  },

  'Algebra:Linear equations': {
    id: 'Algebra:Linear equations',
    topic: 'Algebra',
    subjectNum: 1,
    chapterNum: 3,
    title: 'Linear equations',
    subtitle: 'The Balance Scale Model, Inverse Operations, and Multi-Step Solving',
    readTime: '8 min read',
    difficulty: 'Core',
    overview: 'A linear equation is a statement that two algebraic expressions are equal. Think of an equation as a perfectly balanced scale: whatever operation you perform on one side, you must also perform on the other to keep it balanced.',
    theory: `### 1. The Balance Principle
An equation states that the left-hand side (LHS) has the exact same value as the right-hand side (RHS):
$$\\text{LHS} = \\text{RHS}$$

To solve an equation means to isolate the variable on one side by applying **inverse operations**:
- Addition $\\longleftrightarrow$ Subtraction
- Multiplication $\\longleftrightarrow$ Division
- Powers $\\longleftrightarrow$ Roots

### 2. Systematic 4-Step Strategy for Any Linear Equation
1. **Clear Parentheses**: Use the distributive property to eliminate brackets.
2. **Clear Fractions (if any)**: Multiply every single term by the least common denominator (LCD).
3. **Group Variable Terms**: Add or subtract to move all variable terms to one side (usually LHS) and all constants to the other (RHS).
4. **Isolate the Variable**: Multiply or divide by the variable's coefficient to get $x = \\text{value}$.
5. **Sanity Check**: Substitute the solution back into the original equation to verify balance.

### 3. Graphical Meaning
Graphically, solving $ax + b = c$ corresponds to finding the $x$-coordinate where the line $y = ax + b$ intersects the horizontal line $y = c$. A standard linear equation has exactly **one unique solution**, unless it simplifies to a contradiction ($0 = 5$, no solution) or an identity ($0 = 0$, infinite solutions).`,
    definitions: [
      {
        term: 'Linear Equation',
        symbol: 'ax + b = c',
        meaning: 'An algebraic equation in which the highest exponent of the variable is $1$.',
        example: '$3x + 7 = 22$ is linear; $x^2 + 4 = 0$ is quadratic (non-linear).'
      },
      {
        term: 'Inverse Operations',
        symbol: '+ \\leftrightarrow -, \\; \\times \\leftrightarrow \\div',
        meaning: 'Opposite mathematical operations that undo each other.',
        example: 'To undo adding $5$, subtract $5$. To undo multiplying by $4$, divide by $4$.'
      },
      {
        term: 'Solution Set',
        symbol: '\\{x = k\\}',
        meaning: 'The value(s) of the variable that make the equation true.',
        example: 'For $2x = 10$, the solution is $x = 5$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Standard Linear Form',
        formula: 'ax + b = 0 \\implies x = -\\frac{b}{a} \\quad (a \\neq 0)',
        note: 'The universal solution for any first-degree polynomial equation.'
      },
      {
        name: 'Addition Property of Equality',
        formula: 'A = B \\iff A + c = B + c',
        note: 'Adding or subtracting the same quantity from both sides preserves equality.'
      },
      {
        name: 'Multiplication Property of Equality',
        formula: 'A = B \\iff cA = cB \\quad (c \\neq 0)',
        note: 'Multiplying or dividing both sides by a non-zero number preserves equality.'
      }
    ],
    workedExamples: [
      {
        problem: 'Solve for $x$: $3x + 8 = 29$',
        difficulty: 'Beginner',
        steps: [
          'Identify the operations applied to $x$: $x$ is multiplied by $3$, then $8$ is added.',
          'Undo addition first: subtract $8$ from both sides: $3x + 8 - 8 = 29 - 8 \\implies 3x = 21$.',
          'Undo multiplication: divide both sides by $3$: $\\frac{3x}{3} = \\frac{21}{3} \\implies x = 7$.',
          'Check: $3(7) + 8 = 21 + 8 = 29$ ✓ True!'
        ],
        finalAnswer: 'x = 7',
        proTip: 'When solving equations, work in reverse PEMDAS order (undo addition/subtraction first, then multiplication/division).'
      },
      {
        problem: 'Solve the multi-step equation: $5(2x - 1) = 3(x + 4) + 4$',
        difficulty: 'Intermediate',
        steps: [
          'Step 1: Distribute on both sides: $10x - 5 = 3x + 12 + 4$.',
          'Step 2: Combine constants on RHS: $10x - 5 = 3x + 16$.',
          'Step 3: Move variable terms to LHS by subtracting $3x$ from both sides: $7x - 5 = 16$.',
          'Step 4: Move constant to RHS by adding $5$ to both sides: $7x = 21$.',
          'Step 5: Divide by $7$: $x = 3$.',
          'Step 6: Check: LHS $= 5(2(3)-1) = 5(5) = 25$. RHS $= 3(3+4)+4 = 3(7)+4 = 25$ ✓.'
        ],
        finalAnswer: 'x = 3',
        proTip: 'Always simplify each side completely before moving terms across the equals sign.'
      }
    ],
    pitfalls: [
      'Operating on only one side of the equals sign: Always apply operations to BOTH sides equally.',
      'Sign errors when moving terms: When adding/subtracting terms across the equals sign, remember that moving $+3x$ requires subtracting $3x$.',
      'Dividing by zero: Never divide both sides by an expression that could equal zero.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Solve for $x$: $4x - 7 = 21$',
        options: ['x = 7', 'x = 5', 'x = 28', 'x = 3.5'],
        answer: 'x = 7',
        explanation: 'Add 7 to both sides: $4x = 28$. Divide by 4: $x = 7$.'
      },
      {
        id: 'q2',
        question: 'Solve for $y$: $2(y + 6) = 30$',
        options: ['y = 9', 'y = 12', 'y = 15', 'y = 6'],
        answer: 'y = 9',
        explanation: 'Divide by 2: $y + 6 = 15$. Subtract 6: $y = 9$.'
      },
      {
        id: 'q3',
        question: 'Solve for $x$: $6x - 5 = 2x + 15$',
        options: ['x = 5', 'x = 2.5', 'x = 4', 'x = 10'],
        answer: 'x = 5',
        explanation: 'Subtract $2x$: $4x - 5 = 15$. Add 5: $4x = 20$. Divide by 4: $x = 5$.'
      }
    ]
  },

  'Algebra:Quadratic equations': {
    id: 'Algebra:Quadratic equations',
    topic: 'Algebra',
    subjectNum: 1,
    chapterNum: 4,
    title: 'Quadratic equations',
    subtitle: 'Factoring, The Quadratic Formula, and Parabolic Trajectories',
    readTime: '9 min read',
    difficulty: 'Advanced',
    overview: 'A quadratic equation contains a squared variable ($x^2$). While linear equations create straight lines, quadratic relationships form symmetrical curves called parabolas, which describe gravity, projectile motion, and optimal areas.',
    theory: `### 1. Standard Form
Every single-variable quadratic equation can be written in **standard form**:
$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$

- $a$ is the **quadratic coefficient** (determines whether the parabola opens up $a > 0$ or down $a < 0$).
- $b$ is the **linear coefficient**.
- $c$ is the **constant term** (the $y$-intercept when graphed).

### 2. Method 1: Factoring & Zero-Product Property
If a product of two factors is zero, at least one of the factors must be zero:
$$\\text{If } A \\cdot B = 0, \\text{ then } A = 0 \\text{ or } B = 0$$

Example: For $x^2 - 5x + 6 = 0$:
$$(x - 2)(x - 3) = 0 \\implies x = 2 \\text{ or } x = 3$$

### 3. Method 2: The Universal Quadratic Formula
When an equation cannot be factored easily, use the quadratic formula derived from completing the square:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

#### The Discriminant $\\Delta = b^2 - 4ac$
- If $\\Delta > 0$: **Two distinct real roots** (crosses the $x$-axis twice).
- If $\\Delta = 0$: **One repeated real root** (touches the $x$-axis at its vertex).
- If $\\Delta < 0$: **No real roots** (two complex conjugate roots; floating parabola).`,
    definitions: [
      {
        term: 'Quadratic Equation',
        symbol: 'ax^2 + bx + c = 0',
        meaning: 'A second-degree polynomial equation where the highest power of $x$ is $2$.',
        example: '$2x^2 - 8 = 0$ is quadratic.'
      },
      {
        term: 'Discriminant',
        symbol: '\\Delta = b^2 - 4ac',
        meaning: 'The expression under the square root in the quadratic formula determining the nature of roots.',
        example: 'In $x^2 - 4x + 4 = 0$, $\\Delta = (-4)^2 - 4(1)(4) = 0$, indicating exactly one real root.'
      },
      {
        term: 'Zero-Product Property',
        symbol: 'uv = 0 \\implies u=0 \\lor v=0',
        meaning: 'If a product is zero, at least one factor must be zero.',
        example: '$(x+1)(x-7) = 0 \\implies x=-1$ or $x=7$.'
      }
    ],
    keyFormulas: [
      {
        name: 'The Quadratic Formula',
        formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        note: 'Universal method to find the roots of any quadratic equation $ax^2 + bx + c = 0$.'
      },
      {
        name: 'Vertex of a Parabola',
        formula: 'x_v = -\\frac{b}{2a}, \\quad y_v = f(x_v)',
        note: 'Coordinates of the maximum or minimum turning point of the quadratic curve.'
      },
      {
        name: 'Difference of Squares',
        formula: 'a^2 - b^2 = (a - b)(a + b)',
        note: 'Useful for instant factoring (e.g. $x^2 - 25 = (x - 5)(x + 5)$).'
      }
    ],
    workedExamples: [
      {
        problem: 'Solve $x^2 - 7x + 12 = 0$ by factoring.',
        difficulty: 'Intermediate',
        steps: [
          'Find two numbers that multiply to $+12$ and add to $-7$: the numbers are $-3$ and $-4$ since $(-3)(-4) = 12$ and $-3 + (-4) = -7$.',
          'Write in factored form: $(x - 3)(x - 4) = 0$.',
          'Apply Zero-Product Property: $x - 3 = 0 \\implies x = 3$, or $x - 4 = 0 \\implies x = 4$.'
        ],
        finalAnswer: 'x = 3 \\text{ or } x = 4',
        proTip: 'Quick sanity check: plug $3$ back in: $3^2 - 7(3) + 12 = 9 - 21 + 12 = 0$ ✓.'
      },
      {
        problem: 'Solve $2x^2 + 5x - 3 = 0$ using the Quadratic Formula.',
        difficulty: 'Advanced',
        steps: [
          'Identify coefficients: $a = 2$, $b = 5$, $c = -3$.',
          'Calculate discriminant $\\Delta = b^2 - 4ac = 5^2 - 4(2)(-3) = 25 + 24 = 49$.',
          'Since $\\sqrt{49} = 7$, apply the formula: $x = \\frac{-5 \\pm 7}{2(2)} = \\frac{-5 \\pm 7}{4}$.',
          'Compute Root 1: $x_1 = \\frac{-5 + 7}{4} = \\frac{2}{4} = \\frac{1}{2}$.',
          'Compute Root 2: $x_2 = \\frac{-5 - 7}{4} = \\frac{-12}{4} = -3$.'
        ],
        finalAnswer: 'x = \\frac{1}{2}, \\; x = -3',
        proTip: 'Always calculate $b^2 - 4ac$ first to determine if the roots are rational, irrational, or non-real.'
      }
    ],
    pitfalls: [
      'Applying quadratic formula when equation is not set to zero: Always rearrange to $ax^2 + bx + c = 0$ first.',
      'Forgetting the $\\pm$ sign: A quadratic equation usually has TWO roots; omitting $\\pm$ misses half the solution.',
      'Forgetting to divide the entire numerator by $2a$: The fraction line covers both $-b$ and the square root.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What are the solutions to $x^2 - 9 = 0$?',
        options: ['x = 3 and x = -3', 'x = 9 and x = -9', 'x = 3 only', 'x = 0'],
        answer: 'x = 3 and x = -3',
        explanation: '$x^2 - 9 = (x - 3)(x + 3) = 0$, which gives $x = 3$ and $x = -3$.'
      },
      {
        id: 'q2',
        question: 'How many real solutions does $x^2 + 2x + 5 = 0$ have?',
        options: ['0 real solutions', '1 real solution', '2 real solutions', 'Infinitely many'],
        answer: '0 real solutions',
        explanation: 'Discriminant $\\Delta = 2^2 - 4(1)(5) = 4 - 20 = -16 < 0$. Negative discriminant means 0 real solutions.'
      },
      {
        id: 'q3',
        question: 'What is the sum of the roots of $x^2 - 10x + 21 = 0$?',
        options: ['10', '-10', '21', '7'],
        answer: '10',
        explanation: 'By Vieta\'s formulas (or factoring $(x-3)(x-7)=0$), the sum of the roots is $3 + 7 = 10$, or $-(-10)/1 = 10$.'
      }
    ]
  },

  'Algebra:Inequalities': {
    id: 'Algebra:Inequalities',
    topic: 'Algebra',
    subjectNum: 1,
    chapterNum: 5,
    title: 'Inequalities',
    subtitle: 'Order Relations, Number Line Sets, and The Negative Inversion Rule',
    readTime: '6 min read',
    difficulty: 'Core',
    overview: 'Unlike equations that yield specific single numbers, inequalities describe ranges and regions of numbers (e.g. "you must be at least 18 years old", $a \\ge 18$).',
    theory: `### 1. Inequality Symbols & Notation
- $<$ : "is strictly less than" (open circle on number line $\\circ$, parentheses in interval notation $(a, b)$)
- $>$ : "is strictly greater than"
- $\\le$ : "is less than or equal to" (solid closed dot $\\bullet$, brackets $[a, b]$)
- $\\ge$ : "is greater than or equal to"

### 2. The Golden Rule of Inequalities
Solving inequalities is almost identical to solving equations, with **one critical exception**:
> **When you multiply or divide both sides by a NEGATIVE number, you MUST reverse (flip) the inequality symbol.**

#### Why Does the Sign Flip?
Consider the true statement:
$$2 < 5$$
Multiply both sides by $-1$:
$$-2 > -5$$
On a number line, $-2$ is to the right of $-5$, so it is larger! Multiplying by a negative reflects the values across zero, reversing their relative order.

### 3. Compound Inequalities
- **AND ($A < x < B$)**: The intersection (overlap) of two conditions.
- **OR ($x < A \\text{ or } x > B$)**: The union of two disjoint regions.`,
    definitions: [
      {
        term: 'Inequality',
        symbol: '<, \\le, >, \\ge',
        meaning: 'A mathematical statement comparing two expressions using relational ordering symbols.',
        example: '$2x + 1 < 9$.'
      },
      {
        term: 'Interval Notation',
        symbol: '[a, b), \\; (-\\infty, k]',
        meaning: 'A compact notation for expressing connected subsets of real numbers.',
        example: '$x \\ge 3$ is written in interval notation as $[3, \\infty)$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Negative Multiplication Rule',
        formula: 'a < b \\iff -a > -b',
        note: 'Multiplying or dividing by a negative constant strictly flips the inequality direction.'
      },
      {
        name: 'Interval Notation Brackets',
        formula: 'x \\in [a, b] \\iff a \\le x \\le b, \\quad x \\in (a, b) \\iff a < x < b',
        note: 'Round parenthesis $=$ exclusive ($<, >$); square bracket $=$ inclusive ($\\le, \\ge$).'
      }
    ],
    workedExamples: [
      {
        problem: 'Solve and graph the solution set: $-3x + 5 \\le 20$',
        difficulty: 'Intermediate',
        steps: [
          'Subtract $5$ from both sides: $-3x \\le 15$.',
          'Divide both sides by $-3$. Since we are dividing by a negative, FLIP the inequality from $\\le$ to $\\ge$: $x \\ge \\frac{15}{-3}$.',
          'Simplify: $x \\ge -5$.',
          'Interval notation: $[-5, \\infty)$.'
        ],
        finalAnswer: 'x \\ge -5 \\quad (\\text{Interval: } [-5, \\infty))',
        proTip: 'Whenever your next step is dividing or multiplying by a negative number, immediately draw an arrow or write FLIP to remind yourself.'
      }
    ],
    pitfalls: [
      'Forgetting to flip the inequality sign when dividing by a negative number.',
      'Flipping the sign when subtracting: Subtraction DOES NOT flip the inequality; only multiplying or dividing by a negative flips it.',
      'Using square brackets with infinity: Infinity is a concept, not a reachable number, so always use round parentheses: $(-\\infty, \\infty)$.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Solve for $x$: $-2x < 10$',
        options: ['x > -5', 'x < -5', 'x > 5', 'x < 5'],
        answer: 'x > -5',
        explanation: 'Dividing by $-2$ reverses the inequality symbol: $x > -5$.'
      },
      {
        id: 'q2',
        question: 'Which interval represents all real numbers strictly between $-3$ and $7$?',
        options: ['(-3, 7)', '[-3, 7]', '(-3, 7]', '[-3, 7)'],
        answer: '(-3, 7)',
        explanation: '"Strictly between" means exclusive of endpoints, which is represented with round parentheses: $(-3, 7)$.'
      },
      {
        id: 'q3',
        question: 'Solve $5x - 4 \\ge 2x + 11$',
        options: ['x >= 5', 'x <= 5', 'x >= 3', 'x <= 3'],
        answer: 'x >= 5',
        explanation: 'Subtract $2x$: $3x - 4 \\ge 11$. Add 4: $3x \\ge 15$. Divide by 3: $x \\ge 5$.'
      }
    ]
  },

  // ===========================================================================
  // GEOMETRY
  // ===========================================================================
  'Geometry:Shapes and their properties': {
    id: 'Geometry:Shapes and their properties',
    topic: 'Geometry',
    subjectNum: 2,
    chapterNum: 1,
    title: 'Shapes and their properties',
    subtitle: 'Polygons, Vertices, Edges, and Geometric Classifications',
    readTime: '6 min read',
    difficulty: 'Foundational',
    overview: 'Geometry is the mathematical study of shapes, sizes, dimensions, and spatial properties. Polygons are closed two-dimensional shapes formed by straight line segments.',
    theory: `### 1. Polygons & Classifications
A **polygon** is a closed 2D plane figure bounded by $n$ straight line segments (edges) that meet at endpoints (vertices).
- **Triangle** ($n = 3$): Internal angle sum $= (3-2) \\times 180^\\circ = 180^\\circ$.
- **Quadrilateral** ($n = 4$): Internal angle sum $= 360^\\circ$.
- **Pentagon** ($n = 5$): Internal angle sum $= 540^\\circ$.
- **Hexagon** ($n = 6$): Internal angle sum $= 720^\\circ$.
- **$n$-gon**: Internal angle sum $= (n - 2) \\times 180^\\circ$.

### 2. Triangle Taxonomy
1. **By Side Lengths**:
   - *Equilateral*: 3 equal sides, all angles $= 60^\\circ$.
   - *Isosceles*: At least 2 equal sides, base angles equal.
   - *Scalene*: All 3 sides have distinct lengths.
2. **By Internal Angles**:
   - *Acute*: All three angles $< 90^\\circ$.
   - *Right*: Exactly one $90^\\circ$ angle ($a^2 + b^2 = c^2$).
   - *Obtuse*: Exactly one angle $> 90^\\circ$.

### 3. Quadrilaterals Hierarchy
- **Parallelogram**: Opposite sides parallel and equal, opposite angles equal.
- **Rectangle**: Parallelogram with four $90^\\circ$ right angles.
- **Rhombus**: Parallelogram with four equal sides (perpendicular diagonals).
- **Square**: Both a rectangle and a rhombus (4 equal sides + 4 right angles).
- **Trapezoid (Trapezium)**: Exactly one pair of parallel opposite sides.`,
    definitions: [
      {
        term: 'Polygon',
        symbol: 'n \\ge 3',
        meaning: 'A closed two-dimensional geometric figure made of straight line segments.',
        example: 'Triangles, squares, and octagons are polygons; circles are not because their boundary is curved.'
      },
      {
        term: 'Vertex',
        symbol: 'V',
        meaning: 'A corner point where two or more edges meet.',
        example: 'A triangle has 3 vertices; a cube has 8 vertices.'
      },
      {
        term: 'Regular Polygon',
        symbol: '\\text{Equiangular + Equilateral}',
        meaning: 'A polygon with all sides equal and all interior angles equal.',
        example: 'An equilateral triangle or a square.'
      }
    ],
    keyFormulas: [
      {
        name: 'Interior Angle Sum of an n-gon',
        formula: 'S = (n - 2) \\times 180^\\circ',
        note: 'Where $n$ is the number of sides of the polygon.'
      },
      {
        name: 'Individual Interior Angle of Regular n-gon',
        formula: '\\theta = \\frac{(n - 2) \\times 180^\\circ}{n}',
        note: 'Example: for a regular hexagon ($n=6$), $\\theta = \\frac{4 \\times 180}{6} = 120^\\circ$.'
      },
      {
        name: 'Exterior Angle Sum',
        formula: 'S_{ext} = 360^\\circ',
        note: 'The sum of exterior angles for ANY convex polygon is always $360^\\circ$.'
      }
    ],
    workedExamples: [
      {
        problem: 'Find the measure of each interior angle in a regular octagon ($8$ sides).',
        difficulty: 'Beginner',
        steps: [
          'Identify the number of sides: $n = 8$.',
          'Calculate total interior angle sum: $S = (8 - 2) \\times 180^\\circ = 6 \\times 180^\\circ = 1080^\\circ$.',
          'Divide by $8$ equal angles: $\\theta = \\frac{1080^\\circ}{8} = 135^\\circ$.'
        ],
        finalAnswer: '135^\\circ',
        proTip: 'Alternative shortcut: Each exterior angle is $\\frac{360^\\circ}{8} = 45^\\circ$. Since interior $+$ exterior $= 180^\\circ$, interior $= 180^\\circ - 45^\\circ = 135^\\circ$!'
      }
    ],
    pitfalls: [
      'Assuming all 4-sided shapes are rectangles: A general quadrilateral has no required right angles.',
      'Confusing regular polygons with irregular ones: The formula $\\frac{(n-2)180}{n}$ ONLY applies to regular (equal angle) polygons.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the sum of interior angles in a 5-sided polygon (pentagon)?',
        options: ['540°', '360°', '720°', '180°'],
        answer: '540°',
        explanation: 'Sum $= (5 - 2) \\times 180^\\circ = 3 \\times 180^\\circ = 540^\\circ$.'
      },
      {
        id: 'q2',
        question: 'A triangle has sides of length 7 cm, 7 cm, and 10 cm. What type of triangle is it?',
        options: ['Isosceles', 'Equilateral', 'Scalene', 'Right'],
        answer: 'Isosceles',
        explanation: 'A triangle with at least two equal sides is an isosceles triangle.'
      },
      {
        id: 'q3',
        question: 'What is the measure of each interior angle in a regular hexagon?',
        options: ['120°', '108°', '135°', '90°'],
        answer: '120°',
        explanation: 'For $n=6$: Sum $= (6-2)\\times 180 = 720^\\circ$. Each angle $= 720/6 = 120^\\circ$.'
      }
    ]
  },

  'Geometry:Angles': {
    id: 'Geometry:Angles',
    topic: 'Geometry',
    subjectNum: 2,
    chapterNum: 2,
    title: 'Angles',
    subtitle: 'Complementary, Supplementary, Transversals, and Angle Theorems',
    readTime: '7 min read',
    difficulty: 'Core',
    overview: 'An angle measures the amount of rotational turn between two intersecting rays originating from a common vertex. Angles are fundamental to construction, navigation, and physics.',
    theory: `### 1. Fundamental Angle Classifications
- **Acute**: $0^\\circ < \\theta < 90^\\circ$
- **Right**: $\\theta = 90^\\circ$ (indicated by a square box symbol $\\llcorner$)
- **Obtuse**: $90^\\circ < \\theta < 180^\\circ$
- **Straight**: $\\theta = 180^\\circ$ (a continuous straight line)
- **Reflex**: $180^\\circ < \\theta < 360^\\circ$

### 2. Angle Pair Relationships
1. **Complementary Angles**: Two angles that add up to $90^\\circ$ ($A + B = 90^\\circ$).
2. **Supplementary Angles**: Two angles that add up to $180^\\circ$ ($A + B = 180^\\circ$).
3. **Vertical (Opposite) Angles**: When two straight lines intersect, the angles opposite each other are always **strictly equal** ($A = B$).

### 3. Parallel Lines Cut by a Transversal
When two parallel lines $L_1 \\parallel L_2$ are crossed by a transversal line $T$:
- **Corresponding Angles** are equal ($F$-shape).
- **Alternate Interior Angles** are equal ($Z$-shape).
- **Alternate Exterior Angles** are equal.
- **Consecutive (Co-interior) Angles** are supplementary (sum to $180^\\circ$, $C$-shape).`,
    definitions: [
      {
        term: 'Complementary Angles',
        symbol: '\\alpha + \\beta = 90^\\circ',
        meaning: 'Two angles whose sum is exactly $90^\\circ$.',
        example: '$35^\\circ$ and $55^\\circ$ are complementary.'
      },
      {
        term: 'Supplementary Angles',
        symbol: '\\alpha + \\beta = 180^\\circ',
        meaning: 'Two angles whose sum is exactly $180^\\circ$ (forming a linear pair).',
        example: '$110^\\circ$ and $70^\\circ$ are supplementary.'
      },
      {
        term: 'Vertical Angles',
        symbol: '\\angle 1 \\cong \\angle 3',
        meaning: 'The non-adjacent angles formed by two intersecting lines.',
        example: 'Intersecting scissors form pairs of equal opposite angles.'
      }
    ],
    keyFormulas: [
      {
        name: 'Linear Pair Postulate',
        formula: '\\theta_1 + \\theta_2 = 180^\\circ',
        note: 'Adjacent angles on a straight line add to $180^\\circ$.'
      },
      {
        name: 'Triangle Angle Sum Theorem',
        formula: '\\angle A + \\angle B + \\angle C = 180^\\circ',
        note: 'The three interior angles of any Euclidean triangle always sum to $180^\\circ$.'
      }
    ],
    workedExamples: [
      {
        problem: 'Two angles are supplementary. One angle is $30^\\circ$ larger than twice the other. Find the measure of both angles.',
        difficulty: 'Intermediate',
        steps: [
          'Let the smaller angle be $x$.',
          'The larger angle is $2x + 30$.',
          'Since they are supplementary: $x + (2x + 30) = 180$.',
          'Combine like terms: $3x + 30 = 180 \\implies 3x = 150 \\implies x = 50^\\circ$.',
          'Calculate the larger angle: $2(50) + 30 = 130^\\circ$.',
          'Check: $50^\\circ + 130^\\circ = 180^\\circ$ ✓.'
        ],
        finalAnswer: '50^\\circ \\text{ and } 130^\\circ',
        proTip: 'Remember: Complementary $=$ Corner ($90^\\circ$); Supplementary $=$ Straight line ($180^\\circ$).'
      }
    ],
    pitfalls: [
      'Confusing complementary ($90^\\circ$) with supplementary ($180^\\circ$).',
      'Assuming lines are parallel without explicit markings ($>$ arrows) or statements.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the complement of a 38° angle?',
        options: ['52°', '142°', '62°', '42°'],
        answer: '52°',
        explanation: 'Complement $= 90^\\circ - 38^\\circ = 52^\\circ$.'
      },
      {
        id: 'q2',
        question: 'If two intersecting lines create an angle of 65°, what is the measure of the vertical angle opposite to it?',
        options: ['65°', '115°', '25°', '180°'],
        answer: '65°',
        explanation: 'Vertical angles are always equal, so the opposite angle is also $65^\\circ$.'
      },
      {
        id: 'q3',
        question: 'In a right triangle, one acute angle measures 34°. What is the other acute angle?',
        options: ['56°', '46°', '146°', '66°'],
        answer: '56°',
        explanation: 'The two acute angles in a right triangle must sum to $90^\\circ$: $90^\\circ - 34^\\circ = 56^\\circ$.'
      }
    ]
  },

  'Geometry:Area and perimeter': {
    id: 'Geometry:Area and perimeter',
    topic: 'Geometry',
    subjectNum: 2,
    chapterNum: 3,
    title: 'Area and perimeter',
    subtitle: '2D Boundary Length, Enclosed Surface Space, and Geometric Formulas',
    readTime: '7 min read',
    difficulty: 'Core',
    overview: 'Perimeter measures the one-dimensional distance around the outside of a shape, while Area measures the two-dimensional surface space enclosed within its boundary.',
    theory: `### 1. Perimeter (1D Length)
Perimeter is the total boundary length, measured in linear units (meters, inches, cm).
- **Rectangle**: $P = 2(l + w)$
- **Circle (Circumference)**: $C = 2\\pi r = \\pi d$

### 2. Area (2D Surface Space)
Area is the amount of square units needed to cover a flat region.
- **Rectangle / Square**: $A = l \\times w$
- **Triangle**: $A = \\frac{1}{2} \\times \\text{base} \\times \\text{perpendicular height}$
- **Parallelogram**: $A = b \\times h$
- **Trapezoid**: $A = \\frac{a + b}{2} \\times h$ (average of parallel bases multiplied by height)
- **Circle**: $A = \\pi r^2$

### 3. Decomposing Compound Shapes
Complex irregular shapes can be calculated by splitting them into simpler shapes (rectangles, triangles, semicircles), computing each sub-area, and adding them together.`,
    definitions: [
      {
        term: 'Perimeter',
        symbol: 'P',
        meaning: 'The continuous line forming the boundary of a closed geometric figure.',
        example: 'Fencing around a garden.'
      },
      {
        term: 'Area',
        symbol: 'A',
        meaning: 'The extent or measurement of a surface or piece of land in square units.',
        example: 'Carpeting needed for a bedroom floor.'
      }
    ],
    keyFormulas: [
      {
        name: 'Area of a Circle',
        formula: 'A = \\pi r^2',
        note: 'Where $r$ is the radius (half the diameter).'
      },
      {
        name: 'Area of a Triangle',
        formula: 'A = \\frac{1}{2} b h',
        note: 'The height $h$ must be strictly perpendicular (at $90^\\circ$) to the chosen base $b$.'
      },
      {
        name: 'Area of a Trapezoid',
        formula: 'A = \\frac{b_1 + b_2}{2} h',
        note: 'Average of top and bottom parallel sides times height.'
      }
    ],
    workedExamples: [
      {
        problem: 'A circular garden has a diameter of $14$ meters. Find its perimeter (circumference) and its area (use $\\pi \\approx \\frac{22}{7}$).',
        difficulty: 'Intermediate',
        steps: [
          'Radius $r = \\frac{d}{2} = \\frac{14}{2} = 7$ m.',
          'Circumference $C = 2\\pi r = 2 \\times \\frac{22}{7} \\times 7 = 44$ m.',
          'Area $A = \\pi r^2 = \\frac{22}{7} \\times 7^2 = \\frac{22}{7} \\times 49 = 22 \\times 7 = 154\\text{ m}^2$.'
        ],
        finalAnswer: 'Circumference = 44 m, \\; Area = 154 m^2',
        proTip: 'Always check whether a problem gives the radius or diameter! Using diameter directly in $\\pi r^2$ causes a $4\\times$ error.'
      }
    ],
    pitfalls: [
      'Using the slanted side of a triangle as height: Height must be the perpendicular height, not the slant length.',
      'Unit confusion: Perimeter is measured in linear units (e.g. $\\text{cm}$), while area is measured in square units (e.g. $\\text{cm}^2$).'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the area of a triangle with base 12 cm and perpendicular height 7 cm?',
        options: ['42 cm²', '84 cm²', '19 cm²', '38 cm²'],
        answer: '42 cm²',
        explanation: 'Area $= \\frac{1}{2} \\times b \\times h = \\frac{1}{2} \\times 12 \\times 7 = 42\\text{ cm}^2$.'
      },
      {
        id: 'q2',
        question: 'What is the area of a trapezoid with parallel bases of 6 cm and 10 cm, and height 4 cm?',
        options: ['32 cm²', '64 cm²', '24 cm²', '40 cm²'],
        answer: '32 cm²',
        explanation: 'Area $= \\frac{6 + 10}{2} \\times 4 = 8 \\times 4 = 32\\text{ cm}^2$.'
      },
      {
        id: 'q3',
        question: 'If the radius of a circle is doubled, what happens to its area?',
        options: ['It quadruples (4x)', 'It doubles (2x)', 'It triples (3x)', 'It stays the same'],
        answer: 'It quadruples (4x)',
        explanation: 'Since $A = \\pi r^2$, doubling $r$ gives $\\pi (2r)^2 = 4\\pi r^2$, which is $4$ times the original area.'
      }
    ]
  },

  'Geometry:Volume': {
    id: 'Geometry:Volume',
    topic: 'Geometry',
    subjectNum: 2,
    chapterNum: 4,
    title: 'Volume',
    subtitle: '3D Space, Solid Prisms, Cylinders, Pyramids, and Spheres',
    readTime: '7 min read',
    difficulty: 'Core',
    overview: 'Volume measures the amount of three-dimensional space enclosed inside a solid object, expressed in cubic units (e.g., $m^3, cm^3, liters$).',
    theory: `### 1. Prisms and Cylinders (Uniform Cross-Sections)
For any solid with a uniform cross-sectional area $B$ along height $h$:
$$V = \\text{Base Area } (B) \\times \\text{Height } (h)$$

- **Rectangular Prism**: $V = l \\times w \\times h$
- **Cube**: $V = s^3$
- **Cylinder**: $V = \\pi r^2 h$

### 2. Pointed Solids (Pyramids and Cones)
Any solid that tapers to a single apex contains exactly **$\\frac{1}{3}$** the volume of the enclosing prism/cylinder:
$$V = \\frac{1}{3} B h$$

- **Square Pyramid**: $V = \\frac{1}{3} s^2 h$
- **Right Circular Cone**: $V = \\frac{1}{3} \\pi r^2 h$

### 3. Spheres
A sphere with radius $r$:
$$V = \\frac{4}{3} \\pi r^3, \\quad \\text{Surface Area } A = 4\\pi r^2$$`,
    definitions: [
      {
        term: 'Volume',
        symbol: 'V',
        meaning: 'The measure of the amount of space occupied by a 3-dimensional solid.',
        example: 'Capacity of a water tank.'
      },
      {
        term: 'Cross-Section',
        symbol: 'B',
        meaning: 'The surface or shape exposed by making a straight cut through a solid.',
        example: 'A cylindrical pipe has circular cross-sections.'
      }
    ],
    keyFormulas: [
      {
        name: 'Volume of a Cylinder',
        formula: 'V = \\pi r^2 h',
        note: 'Circular base area times height.'
      },
      {
        name: 'Volume of a Cone',
        formula: 'V = \\frac{1}{3} \\pi r^2 h',
        note: 'Exactly one-third the volume of a cylinder with matching radius and height.'
      },
      {
        name: 'Volume of a Sphere',
        formula: 'V = \\frac{4}{3} \\pi r^3',
        note: 'Derived via Archimedes\' geometric equilibrium.'
      }
    ],
    workedExamples: [
      {
        problem: 'A cylinder has a radius of $3$ cm and a height of $10$ cm. What is its exact volume in terms of $\\pi$?',
        difficulty: 'Beginner',
        steps: [
          'Base Area $B = \\pi r^2 = \\pi (3)^2 = 9\\pi\\text{ cm}^2$.',
          'Volume $V = B \\times h = 9\\pi \\times 10 = 90\\pi\\text{ cm}^3$.'
        ],
        finalAnswer: '90\\pi \\text{ cm}^3 \\approx 282.74 \\text{ cm}^3',
        proTip: 'In science and math exams, leaving your answer in terms of $\\pi$ is often preferred for 100% exact precision.'
      }
    ],
    pitfalls: [
      'Mixing up units: Volume is cubic ($cm^3$), surface area is square ($cm^2$).',
      'Forgetting the $1/3$ factor for cones and pyramids.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the volume of a cube with edge length 4 cm?',
        options: ['64 cm³', '16 cm³', '48 cm³', '96 cm³'],
        answer: '64 cm³',
        explanation: 'Volume $= s^3 = 4^3 = 64\\text{ cm}^3$.'
      },
      {
        id: 'q2',
        question: 'What is the volume of a cone with radius 3 cm and height 9 cm?',
        options: ['27π cm³', '81π cm³', '9π cm³', '54π cm³'],
        answer: '27π cm³',
        explanation: '$V = \\frac{1}{3}\\pi (3)^2 (9) = \\frac{1}{3} \\times 9 \\times 9 \\times \\pi = 27\\pi\\text{ cm}^3$.'
      },
      {
        id: 'q3',
        question: 'A spherical ball has radius 3 cm. What is its volume?',
        options: ['36π cm³', '12π cm³', '108π cm³', '27π cm³'],
        answer: '36π cm³',
        explanation: '$V = \\frac{4}{3} \\pi (3)^3 = \\frac{4}{3} \\times 27 \\times \\pi = 36\\pi\\text{ cm}^3$.'
      }
    ]
  },

  'Geometry:Trigonometry': {
    id: 'Geometry:Trigonometry',
    topic: 'Geometry',
    subjectNum: 2,
    chapterNum: 5,
    title: 'Trigonometry',
    subtitle: 'Right Triangles, SOH CAH TOA Ratios, and The Pythagorean Identity',
    readTime: '9 min read',
    difficulty: 'Advanced',
    overview: 'Trigonometry ("triangle measurement") connects angles to side lengths. It is the mathematical bridge powering satellite GPS, 3D computer graphics, sound engineering, and architecture.',
    theory: `### 1. The Right-Triangle Trigonometric Ratios
For an acute angle $\\theta$ in a right-angled triangle:
- **Hypotenuse ($H$)**: The longest side, opposite the $90^\\circ$ right angle.
- **Opposite ($O$)**: The side across from the angle of interest $\\theta$.
- **Adjacent ($A$)**: The side next to $\\theta$ (between $\\theta$ and the $90^\\circ$ angle).

$$\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}} \\quad (\\text{SOH})$$
$$\\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}} \\quad (\\text{CAH})$$
$$\\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\frac{\\sin(\\theta)}{\\cos(\\theta)} \\quad (\\text{TOA})$$

### 2. The Fundamental Pythagorean Identity
From Pythagoras\' Theorem $a^2 + b^2 = c^2$, dividing by $c^2$ gives:
$$\\left(\\frac{a}{c}\\right)^2 + \\left(\\frac{b}{c}\\right)^2 = 1 \\implies \\sin^2(\\theta) + \\cos^2(\\theta) = 1$$

### 3. Special Right Triangles ($30^\\circ-60^\\circ-90^\\circ$ and $45^\\circ-45^\\circ-90^\\circ$)
- $\\sin(30^\\circ) = \\frac{1}{2}, \\quad \\cos(30^\\circ) = \\frac{\\sqrt{3}}{2}, \\quad \\tan(30^\\circ) = \\frac{1}{\\sqrt{3}}$
- $\\sin(45^\\circ) = \\frac{\\sqrt{2}}{2}, \\quad \\cos(45^\\circ) = \\frac{\\sqrt{2}}{2}, \\quad \\tan(45^\\circ) = 1$
- $\\sin(60^\\circ) = \\frac{\\sqrt{3}}{2}, \\quad \\cos(60^\\circ) = \\frac{1}{2}, \\quad \\tan(60^\\circ) = \\sqrt{3}$`,
    definitions: [
      {
        term: 'Hypotenuse',
        symbol: 'H',
        meaning: 'The longest side of a right-angled triangle, directly opposite the right angle.',
        example: 'In a 3-4-5 triangle, the hypotenuse is 5.'
      },
      {
        term: 'Tangent',
        symbol: '\\tan(\\theta)',
        meaning: 'The ratio of the opposite side to the adjacent side; geometrically represents the slope of a line.',
        example: '$\\tan(45^\\circ) = 1$, representing a $1:1$ rise-to-run slope.'
      }
    ],
    keyFormulas: [
      {
        name: 'SOH CAH TOA',
        formula: '\\sin = \\frac{O}{H}, \\quad \\cos = \\frac{A}{H}, \\quad \\tan = \\frac{O}{A}',
        note: 'Mnemonic for remembering the three primary trigonometric ratios.'
      },
      {
        name: 'Pythagorean Identity',
        formula: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1',
        note: 'True for every real angle $\\theta$.'
      }
    ],
    workedExamples: [
      {
        problem: 'In a right triangle with acute angle $\\theta$, the hypotenuse is $10$ meters and $\\theta = 30^\\circ$. Find the length of the opposite side.',
        difficulty: 'Intermediate',
        steps: [
          'Choose the trigonometric ratio containing Opposite and Hypotenuse: $\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}$.',
          'Substitute known values: $\\sin(30^\\circ) = \\frac{O}{10}$.',
          'Recall $\\sin(30^\\circ) = 0.5$: $0.5 = \\frac{O}{10}$.',
          'Multiply by $10$: $O = 10 \\times 0.5 = 5$ meters.'
        ],
        finalAnswer: '5 \\text{ meters}',
        proTip: 'In a $30^\\circ-60^\\circ-90^\\circ$ triangle, the side opposite the $30^\\circ$ angle is ALWAYS exactly half the hypotenuse.'
      }
    ],
    pitfalls: [
      'Calculator in Radian mode instead of Degree mode (or vice-versa).',
      'Confusing Opposite and Adjacent when viewing the other acute angle.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'In a right triangle, which ratio defines cosine (cos θ)?',
        options: ['Adjacent / Hypotenuse', 'Opposite / Hypotenuse', 'Opposite / Adjacent', 'Hypotenuse / Opposite'],
        answer: 'Adjacent / Hypotenuse',
        explanation: 'CAH: $\\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}$.'
      },
      {
        id: 'q2',
        question: 'What is sin²(37°) + cos²(37°)?',
        options: ['1', '0.74', '0.5', 'Cannot be determined without a calculator'],
        answer: '1',
        explanation: 'By the fundamental Pythagorean identity $\\sin^2(\\theta) + \\cos^2(\\theta) = 1$ for all angles $\\theta$.'
      },
      {
        id: 'q3',
        question: 'If tan(θ) = 1 in a right triangle, what is the measure of angle θ?',
        options: ['45°', '30°', '60°', '90°'],
        answer: '45°',
        explanation: 'When $\\tan(\\theta) = 1$, the opposite and adjacent sides are equal ($O = A$), which occurs in a $45^\\circ-45^\\circ-90^\\circ$ triangle.'
      }
    ]
  },

  // ===========================================================================
  // CALCULUS
  // ===========================================================================
  'Calculus:Limits': {
    id: 'Calculus:Limits',
    topic: 'Calculus',
    subjectNum: 3,
    chapterNum: 1,
    title: 'Limits',
    subtitle: 'Approaching Values, Continuity, Indeterminate Forms, and Asymptotes',
    readTime: '8 min read',
    difficulty: 'Core',
    overview: 'Calculus begins with the concept of a limit: understanding what value a function gets closer and closer to as the input approaches a specific point, even if the function is undefined at that exact point.',
    theory: `### 1. Intuitive Concept of a Limit
Consider the rational function:
$$f(x) = \\frac{x^2 - 1}{x - 1}$$
If you plug in $x = 1$, you get $\\frac{0}{0}$, which is **indeterminate**.

However, if you plug in numbers very close to $1$:
- $x = 0.99 \\implies f(0.99) = 1.99$
- $x = 1.01 \\implies f(1.01) = 2.01$

As $x$ approaches $1$, $f(x)$ clearly approaches **$2$**. We write:
$$\\lim_{x \\to 1} \\frac{x^2 - 1}{x - 1} = 2$$

### 2. Left-Hand and Right-Hand Limits
- **Left-hand limit**: $\\lim_{x \\to a^-} f(x)$ (approaching from values smaller than $a$)
- **Right-hand limit**: $\\lim_{x \\to a^+} f(x)$ (approaching from values greater than $a$)

A two-sided limit exists if and only if both one-sided limits are equal:
$$\\lim_{x \\to a} f(x) = L \\iff \\lim_{x \\to a^-} f(x) = \\lim_{x \\to a^+} f(x) = L$$

### 3. Algebraic Limit Techniques
1. **Direct Substitution**: If $f(a)$ is defined and continuous, $\\lim_{x \\to a} f(x) = f(a)$.
2. **Factoring & Canceling**: For $\\frac{0}{0}$, factor out $(x - a)$ and cancel.
3. **Conjugate Multiplication**: For radical expressions $\\frac{\\sqrt{x} - 2}{x - 4}$, multiply numerator and denominator by the conjugate $\\sqrt{x} + 2$.`,
    definitions: [
      {
        term: 'Limit',
        symbol: '\\lim_{x \\to a} f(x) = L',
        meaning: 'As $x$ gets arbitrarily close to $a$, $f(x)$ gets arbitrarily close to the finite value $L$.',
        example: '$\\lim_{x \\to 3} (2x + 1) = 7$.'
      },
      {
        term: 'Indeterminate Form',
        symbol: '\\frac{0}{0}, \\; \\frac{\\infty}{\\infty}',
        meaning: 'An algebraic expression whose limit cannot be determined solely from the individual limits of its parts without further algebraic simplification.',
        example: '$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Fundamental Trigonometric Limit',
        formula: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1',
        note: 'Where $x$ is measured strictly in radians.'
      },
      {
        name: 'Limits at Infinity for Polynomial Ratios',
        formula: '\\lim_{x \\to \\infty} \\frac{ax^n + \\dots}{bx^n + \\dots} = \\frac{a}{b}',
        note: 'When degrees match, the limit is the ratio of the leading coefficients.'
      }
    ],
    workedExamples: [
      {
        problem: 'Evaluate the limit: $\\lim_{x \\to 2} \\frac{x^2 + x - 6}{x - 2}$',
        difficulty: 'Intermediate',
        steps: [
          'Direct substitution gives $\\frac{2^2 + 2 - 6}{2 - 2} = \\frac{0}{0}$ (indeterminate form).',
          'Factor the numerator: $x^2 + x - 6 = (x - 2)(x + 3)$.',
          'Rewrite the limit: $\\lim_{x \\to 2} \\frac{(x - 2)(x + 3)}{x - 2}$.',
          'Cancel the common factor $(x - 2)$ (valid because $x \\to 2$ means $x \\neq 2$): $\\lim_{x \\to 2} (x + 3)$.',
          'Substitute $x = 2$: $2 + 3 = 5$.'
        ],
        finalAnswer: '5',
        proTip: 'Whenever direct substitution gives $0/0$, it guarantees that $(x - a)$ is a factor of both the numerator and the denominator!'
      }
    ],
    pitfalls: [
      'Assuming $0/0$ equals $0$ or $1$: $0/0$ is undefined and requires algebraic factoring.',
      'Assuming a limit does not exist because $f(a)$ has a hole/hole-discontinuity.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is lim_{x -> 3} (x² - 9) / (x - 3)?',
        options: ['6', '0', 'Undefined', '3'],
        answer: '6',
        explanation: 'Factor $(x-3)(x+3)/(x-3) = x+3$. As $x \\to 3$, $3 + 3 = 6$.'
      },
      {
        id: 'q2',
        question: 'If lim_{x -> 4⁻} f(x) = 5 and lim_{x -> 4⁺} f(x) = 7, does lim_{x -> 4} f(x) exist?',
        options: ['No, the two-sided limit does not exist', 'Yes, it equals 6', 'Yes, it equals 5', 'Yes, it equals 7'],
        answer: 'No, the two-sided limit does not exist',
        explanation: 'For a two-sided limit to exist, the left-hand and right-hand limits must be strictly equal.'
      },
      {
        id: 'q3',
        question: 'Evaluate lim_{x -> ∞} (3x² + 5) / (6x² - 2x)',
        options: ['1/2', '3', '0', '∞'],
        answer: '1/2',
        explanation: 'The degrees of numerator and denominator are both 2. The limit is the ratio of leading coefficients: $3/6 = 1/2$.'
      }
    ]
  },

  'Calculus:Derivatives': {
    id: 'Calculus:Derivatives',
    topic: 'Calculus',
    subjectNum: 3,
    chapterNum: 2,
    title: 'Derivatives',
    subtitle: 'Instantaneous Rate of Change, Tangent Slopes, and Differentiation Rules',
    readTime: '9 min read',
    difficulty: 'Advanced',
    overview: 'A derivative measures the instantaneous rate of change of a quantity: how quickly $y$ changes with respect to $x$ at an exact single instant. Geometrically, it is the slope of the tangent line to a curve.',
    theory: `### 1. The Limit Definition of the Derivative
Average speed over a time interval $h$ is $\\frac{\\Delta y}{\\Delta x} = \\frac{f(x+h) - f(x)}{h}$.
To find the **instantaneous rate of change**, we take the limit as $h \\to 0$:
$$f'(x) = \\frac{df}{dx} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

### 2. Core Differentiation Rules
Instead of using the limit definition every time, we use proven rules:

1. **Power Rule**:
   $$\\frac{d}{dx}[x^n] = n x^{n-1}$$
2. **Constant Multiple Rule**:
   $$\\frac{d}{dx}[c \\cdot f(x)] = c \\cdot f'(x)$$
3. **Sum & Difference Rule**:
   $$\\frac{d}{dx}[f(x) \\pm g(x)] = f'(x) \\pm g'(x)$$
4. **Product Rule**:
   $$\\frac{d}{dx}[u \\cdot v] = u'v + uv'$$
5. **Quotient Rule**:
   $$\\frac{d}{dx}\\left[\\frac{u}{v}\\right] = \\frac{u'v - uv'}{v^2}$$
6. **Chain Rule** (for composite functions $f(g(x))$):
   $$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$`,
    definitions: [
      {
        term: 'Derivative',
        symbol: "f'(x), \\; \\frac{dy}{dx}",
        meaning: 'The instantaneous rate of change of a function with respect to its variable; the slope of the tangent line.',
        example: 'If position $s(t) = t^2$, velocity is the derivative $v(t) = s\'(t) = 2t$.'
      },
      {
        term: 'Tangent Line',
        symbol: 'y - y_0 = m(x - x_0)',
        meaning: 'A straight line that touches a curve at a single point, having the exact same slope as the curve at that point ($m = f\'(x_0)$).',
        example: 'At $x=2$ on $y=x^2$, the slope of the tangent is $f\'(2) = 4$.'
      }
    ],
    keyFormulas: [
      {
        name: 'The Power Rule',
        formula: '\\frac{d}{dx}[x^n] = n x^{n-1}',
        note: 'Multiply by the power, then reduce the power by 1.'
      },
      {
        name: 'The Chain Rule',
        formula: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)',
        note: 'Derivative of the outside evaluated at the inside, times the derivative of the inside.'
      }
    ],
    workedExamples: [
      {
        problem: 'Find the derivative of $f(x) = 4x^3 - 5x^2 + 7x - 9$.',
        difficulty: 'Beginner',
        steps: [
          'Differentiate $4x^3$: $4 \\cdot (3x^2) = 12x^2$.',
          'Differentiate $-5x^2$: $-5 \\cdot (2x) = -10x$.',
          'Differentiate $7x$: $7 \\cdot (1) = 7$.',
          'Differentiate constant $-9$: $0$.',
          'Combine terms: $f\'(x) = 12x^2 - 10x + 7$.'
        ],
        finalAnswer: 'f\'(x) = 12x^2 - 10x + 7',
        proTip: 'The derivative of any constant is always zero because a constant horizontal line has a slope of zero.'
      },
      {
        problem: 'Find the derivative of $g(x) = (3x^2 + 1)^4$ using the Chain Rule.',
        difficulty: 'Advanced',
        steps: [
          'Identify outside function: $u^4$, whose derivative is $4u^3$.',
          'Identify inside function: $u = 3x^2 + 1$, whose derivative is $u\' = 6x$.',
          'Apply Chain Rule: $g\'(x) = 4(3x^2 + 1)^3 \\cdot (6x)$.',
          'Simplify: $g\'(x) = 24x(3x^2 + 1)^3$.'
        ],
        finalAnswer: '24x(3x^2 + 1)^3',
        proTip: 'Do not forget the inner derivative $g\'(x)$! Forgetting to multiply by $6x$ is the classic Chain Rule mistake.'
      }
    ],
    pitfalls: [
      'Applying the Power Rule to exponential functions: $\\frac{d}{dx}[2^x] \\neq x 2^{x-1}$. It is $2^x \\ln 2$.',
      'Thinking the derivative of a product is the product of derivatives: $\\frac{d}{dx}[uv] \\neq u\' v\'$. Always use $u\'v + uv\'.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the derivative of f(x) = 5x⁴?',
        options: ['20x³', '20x⁵', '5x³', '4x³'],
        answer: '20x³',
        explanation: 'Using power rule: $5 \\times 4x^{4-1} = 20x^3$.'
      },
      {
        id: 'q2',
        question: 'What is the slope of the tangent line to y = x² at x = 3?',
        options: ['6', '9', '3', '12'],
        answer: '6',
        explanation: '$y\' = 2x$. At $x=3$, the slope is $y\'(3) = 2(3) = 6$.'
      },
      {
        id: 'q3',
        question: 'What is the derivative of a constant number C (like f(x) = 42)?',
        options: ['0', '1', '42', 'Undefined'],
        answer: '0',
        explanation: 'A constant value does not change, so its rate of change (derivative) is always 0.'
      }
    ]
  },

  'Calculus:Integrals': {
    id: 'Calculus:Integrals',
    topic: 'Calculus',
    subjectNum: 3,
    chapterNum: 3,
    title: 'Integrals',
    subtitle: 'Accumulation, Riemann Sums, and The Fundamental Theorem of Calculus',
    readTime: '9 min read',
    difficulty: 'Advanced',
    overview: 'While differentiation breaks quantities down into instantaneous rates of change, integration adds up countless infinitely small pieces to calculate total accumulation, such as the exact area under a curved graph.',
    theory: `### 1. Integration as Accumulation
Imagine calculating the area under a curve $y = f(x)$ from $x = a$ to $x = b$. We can approximate it by drawing $n$ narrow rectangles of width $\\Delta x$ and adding their areas:
$$\\text{Area} \\approx \\sum_{i=1}^n f(x_i) \\Delta x$$
Taking the limit as the number of rectangles approaches infinity gives the **definite integral**:
$$\\int_a^b f(x) \\, dx = \\lim_{n \\to \\infty} \\sum_{i=1}^n f(x_i) \\Delta x$$

### 2. The Fundamental Theorem of Calculus (FTC)
The FTC connects differentiation and integration as inverse operations:
$$\\int_a^b f(x) \\, dx = F(b) - F(a)$$
where $F'(x) = f(x)$ ($F$ is the antiderivative of $f$).

### 3. Basic Antiderivative Rules
1. **Power Rule for Integration**:
   $$\\int x^n \\, dx = \\frac{x^{n+1}}{n + 1} + C \\quad (n \\neq -1)$$
2. **Exponential**:
   $$\\int e^x \\, dx = e^x + C$$
3. **Logarithmic**:
   $$\\int \\frac{1}{x} \\, dx = \\ln|x| + C$$`,
    definitions: [
      {
        term: 'Definite Integral',
        symbol: '\\int_a^b f(x) \\, dx',
        meaning: 'A numerical value representing the net signed area between the curve $f(x)$ and the $x$-axis from $x=a$ to $x=b$.',
        example: '$\\int_0^2 x \\, dx = \\left[ \\frac{x^2}{2} \\right]_0^2 = 2 - 0 = 2$.'
      },
      {
        term: 'Indefinite Integral',
        symbol: '\\int f(x) \\, dx = F(x) + C',
        meaning: 'The family of all antiderivatives of $f(x)$, containing the constant of integration $+C$.',
        example: '$\\int 2x \\, dx = x^2 + C$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Power Rule for Integration',
        formula: '\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)',
        note: 'Add 1 to the exponent, then divide by the new exponent.'
      },
      {
        name: 'Fundamental Theorem of Calculus',
        formula: '\\int_a^b f(x) \\, dx = F(b) - F(a)',
        note: 'Evaluate the antiderivative at the upper bound and subtract the value at the lower bound.'
      }
    ],
    workedExamples: [
      {
        problem: 'Evaluate the definite integral: $\\int_1^3 (3x^2 - 2x + 4) \\, dx$',
        difficulty: 'Intermediate',
        steps: [
          'Find the antiderivative term-by-term: $F(x) = 3\\left(\\frac{x^3}{3}\\right) - 2\\left(\\frac{x^2}{2}\\right) + 4x = x^3 - x^2 + 4x$.',
          'Evaluate at upper bound $x = 3$: $F(3) = 3^3 - 3^2 + 4(3) = 27 - 9 + 12 = 30$.',
          'Evaluate at lower bound $x = 1$: $F(1) = 1^3 - 1^2 + 4(1) = 1 - 1 + 4 = 4$.',
          'Subtract $F(3) - F(1) = 30 - 4 = 26$.'
        ],
        finalAnswer: '26',
        proTip: 'For definite integrals with bounds $\\int_a^b$, the constant $+C$ cancels out during subtraction ($C - C = 0$).'
      }
    ],
    pitfalls: [
      'Forgetting the $+C$ on indefinite integrals.',
      'Applying the power rule to $1/x$: $\\int x^{-1} dx = \\ln|x| + C$, NOT $\\frac{x^0}{0}$.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the indefinite integral ∫ 6x² dx?',
        options: ['2x³ + C', '12x + C', '3x³ + C', '6x³ + C'],
        answer: '2x³ + C',
        explanation: '$\\int 6x^2 dx = 6 \\left(\\frac{x^3}{3}\\right) + C = 2x^3 + C$.'
      },
      {
        id: 'q2',
        question: 'Evaluate the definite integral ∫₀³ 2x dx',
        options: ['9', '6', '18', '3'],
        answer: '9',
        explanation: 'Antiderivative is $x^2$. Evaluating $[x^2]_0^3 = 3^2 - 0^2 = 9$.'
      },
      {
        id: 'q3',
        question: 'What geometric quantity does the definite integral ∫_a^b f(x) dx represent for f(x) ≥ 0?',
        options: ['The area under the curve between a and b', 'The slope of the tangent line', 'The perimeter of the shape', 'The maximum value of the function'],
        answer: 'The area under the curve between a and b',
        explanation: 'Integration computes the continuous accumulated area between the curve and the $x$-axis.'
      }
    ]
  },

  'Calculus:Differential equations': {
    id: 'Calculus:Differential equations',
    topic: 'Calculus',
    subjectNum: 3,
    chapterNum: 4,
    title: 'Differential equations',
    subtitle: 'Mathematical Modeling, Rates of Change Relationships, and Separation of Variables',
    readTime: '8 min read',
    difficulty: 'Advanced',
    overview: 'A differential equation is an equation relating an unknown function to its own derivatives. They model population growth, viral epidemics, orbital mechanics, circuits, and cooling laws.',
    theory: `### 1. What is a Differential Equation?
In regular algebra, we solve for an unknown number $x$. In differential equations, we solve for an **unknown function $y = f(t)$**.

Example: Radioactive decay states that the rate of decay $\\frac{dy}{dt}$ is proportional to the remaining amount $y$:
$$\\frac{dy}{dt} = -k y$$

### 2. Separation of Variables
For first-order separable equations $\\frac{dy}{dx} = g(x) h(y)$:
1. Move all $y$ and $dy$ terms to the left side: $\\frac{1}{h(y)} \\, dy$.
2. Move all $x$ and $dx$ terms to the right side: $g(x) \\, dx$.
3. Integrate both sides:
   $$\\int \\frac{1}{h(y)} \\, dy = \\int g(x) \\, dx$$
4. Solve explicitly for $y$.`,
    definitions: [
      {
        term: 'Differential Equation',
        symbol: '\\frac{dy}{dx} = f(x, y)',
        meaning: 'An equation containing derivatives of an unknown function.',
        example: '$\\frac{dy}{dt} = ky$ (exponential growth model).'
      }
    ],
    keyFormulas: [
      {
        name: 'Exponential Growth / Decay Solution',
        formula: '\\frac{dy}{dt} = ky \\implies y(t) = y_0 e^{kt}',
        note: 'Where $y_0$ is the initial value at $t = 0$.'
      }
    ],
    workedExamples: [
      {
        problem: 'Solve the differential equation $\\frac{dy}{dx} = 3x^2 y$ with initial condition $y(0) = 5$.',
        difficulty: 'Advanced',
        steps: [
          'Separate variables: divide by $y$ and multiply by $dx$: $\\frac{1}{y} \\, dy = 3x^2 \\, dx$.',
          'Integrate both sides: $\\int \\frac{1}{y} \\, dy = \\int 3x^2 \\, dx \\implies \\ln|y| = x^3 + C$.',
          'Exponentiate: $y = e^{x^3 + C} = e^C \\cdot e^{x^3} = A e^{x^3}$.',
          'Apply initial condition $y(0) = 5$: $5 = A e^{0} \\implies A = 5$.',
          'Final solution: $y = 5e^{x^3}$.'
        ],
        finalAnswer: 'y = 5e^{x^3}',
        proTip: 'Always apply initial conditions to solve for the specific constant $C$ or $A$.'
      }
    ],
    pitfalls: [
      'Integrating without separating variables completely.',
      'Treating $dy/dx$ purely as a single inseparable symbol rather than a differential ratio in separable equations.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'If dy/dt = 0.05y with initial value y(0) = 100, what is the function y(t)?',
        options: ['y(t) = 100 e^(0.05t)', 'y(t) = 0.05t + 100', 'y(t) = 100e^(-0.05t)', 'y(t) = 50e^(t)'],
        answer: 'y(t) = 100 e^(0.05t)',
        explanation: 'Standard exponential growth model: $y(t) = y_0 e^{kt} = 100 e^{0.05t}$.'
      },
      {
        id: 'q2',
        question: 'What is the order of the differential equation d²y/dx² + 4(dy/dx) + 3y = 0?',
        options: ['Second order (2)', 'First order (1)', 'Third order (3)', 'Fourth order (4)'],
        answer: 'Second order (2)',
        explanation: 'The order is determined by the highest derivative present ($d^2y/dx^2$, which is order 2).'
      },
      {
        id: 'q3',
        question: 'What is the general solution to dy/dx = 2x?',
        options: ['y = x² + C', 'y = 2x² + C', 'y = 2 + C', 'y = x + C'],
        answer: 'y = x² + C',
        explanation: 'Integrate both sides: $y = \\int 2x dx = x^2 + C$.'
      }
    ]
  },

  // ===========================================================================
  // STATISTICS
  // ===========================================================================
  'Statistics:Mean, median, and mode': {
    id: 'Statistics:Mean, median, and mode',
    topic: 'Statistics',
    subjectNum: 4,
    chapterNum: 1,
    title: 'Mean, median, and mode',
    subtitle: 'Measures of Central Tendency, Data Outliers, and Skewness',
    readTime: '6 min read',
    difficulty: 'Foundational',
    overview: 'Measures of central tendency summarize an entire collection of data into a single representative number that captures the "center" or typical value of the distribution.',
    theory: `### 1. The Three Primary Measures
1. **Mean (Arithmetic Average)**: Sum of all values divided by the total count $n$:
   $$\\bar{x} = \\frac{\\sum x_i}{n} = \\frac{x_1 + x_2 + \\dots + x_n}{n}$$
2. **Median (Middle Value)**: The midpoint of the ordered dataset.
   - If $n$ is odd: exact middle element at position $\\frac{n+1}{2}$.
   - If $n$ is even: mean of the two middle elements.
3. **Mode (Most Frequent)**: The value that appears with the highest frequency. A dataset can have one mode, multiple modes (bimodal), or no mode.

### 2. Outliers & Robustness
- The **Mean is sensitive to outliers**: If nine people earn $\\$50,000$ and one billionaire joins them, the mean jumps to $\\$100,000,000$, which is misleading.
- The **Median is robust (resistant)**: The billionaire only shifts the median by one spot, keeping it around $\\$50,000$. This is why median is used for salaries and home prices.`,
    definitions: [
      {
        term: 'Mean',
        symbol: '\\bar{x}, \\; \\mu',
        meaning: 'The arithmetic average calculated by dividing the sum of values by the sample size.',
        example: 'Mean of $2, 4, 6$ is $(2+4+6)/3 = 4$.'
      },
      {
        term: 'Median',
        symbol: 'M, \\; \\tilde{x}',
        meaning: 'The middle score in an ordered list that splits the data into two equal halves.',
        example: 'In $1, 3, 7, 9, 12$, the median is $7$.'
      },
      {
        term: 'Outlier',
        symbol: 'x_{outlier}',
        meaning: 'An extreme observation that lies an abnormal distance from other values in the sample.',
        example: 'In $10, 11, 12, 10, 95$, $95$ is an extreme outlier.'
      }
    ],
    keyFormulas: [
      {
        name: 'Sample Mean Formula',
        formula: '\\bar{x} = \\frac{1}{n} \\sum_{i=1}^n x_i',
        note: 'Sum of all observations divided by sample size $n$.'
      }
    ],
    workedExamples: [
      {
        problem: 'Find the mean, median, and mode of the dataset: $[4, 8, 3, 8, 11, 8, 2]$.',
        difficulty: 'Beginner',
        steps: [
          'Sort dataset in ascending order: $[2, 3, 4, 8, 8, 8, 11]$ ($n = 7$).',
          'Calculate Mean: $\\frac{2 + 3 + 4 + 8 + 8 + 8 + 11}{7} = \\frac{44}{7} \\approx 6.29$.',
          'Find Median: The 4th element in the sorted list is $8$.',
          'Find Mode: $8$ appears three times (more than any other number).'
        ],
        finalAnswer: 'Mean \\approx 6.29, \\; Median = 8, \\; Mode = 8',
        proTip: 'Always sort the data first! Finding the median from an unsorted list is the number one student mistake.'
      }
    ],
    pitfalls: [
      'Forgetting to sort the numbers before finding the median.',
      'Using the mean for heavily skewed data (like real estate prices) instead of the median.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the median of the dataset: 3, 7, 9, 15, 21, 25?',
        options: ['12', '15', '9', '14'],
        answer: '12',
        explanation: 'Since $n=6$ (even), average the two middle values (9 and 15): $(9 + 15)/2 = 24/2 = 12$.'
      },
      {
        id: 'q2',
        question: 'Which measure of central tendency is least affected by extreme outliers?',
        options: ['Median', 'Mean', 'Range', 'Variance'],
        answer: 'Median',
        explanation: 'The median depends only on rank order and is resistant to extreme high or low values.'
      },
      {
        id: 'q3',
        question: 'A student scores 80, 85, and 95 on three tests. What score is needed on the 4th test to average exactly 90?',
        options: ['100', '95', '90', '92'],
        answer: '100',
        explanation: 'Total needed $= 4 \\times 90 = 360$. Current sum $= 80 + 85 + 95 = 260$. Needed $= 360 - 260 = 100$.'
      }
    ]
  },

  'Statistics:Probability': {
    id: 'Statistics:Probability',
    topic: 'Statistics',
    subjectNum: 4,
    chapterNum: 2,
    title: 'Probability',
    subtitle: 'Sample Spaces, Events, Independent Outcomes, and Conditional Probability',
    readTime: '7 min read',
    difficulty: 'Core',
    overview: 'Probability is the mathematical framework for quantifying uncertainty and chance, assigning a real number between $0$ (impossible) and $1$ (certain) to events.',
    theory: `### 1. Theoretical Probability
For equally likely outcomes in a sample space $S$:
$$P(E) = \\frac{\\text{Number of favorable outcomes } n(E)}{\\text{Total number of possible outcomes } n(S)}$$

- $P(E) = 0$: Impossible event.
- $P(E) = 1$: Guaranteed certainty.
- **Complement Rule**: $P(\\text{not } E) = 1 - P(E)$.

### 2. Independent vs Dependent Events
- **Independent Events**: One outcome does NOT affect the other ($P(A \\text{ and } B) = P(A) \\times P(B)$). E.g. rolling two dice.
- **Dependent Events**: One outcome changes the pool of remaining possibilities ($P(A \\text{ and } B) = P(A) \\times P(B|A)$). E.g. drawing cards without replacement.`,
    definitions: [
      {
        term: 'Sample Space',
        symbol: 'S',
        meaning: 'The set of all possible outcomes of a random experiment.',
        example: 'Rolling a 6-sided die: $S = \\{1, 2, 3, 4, 5, 6\\}$.'
      },
      {
        term: 'Independent Events',
        symbol: 'P(A \\cap B) = P(A)P(B)',
        meaning: 'Events whose occurrence provides no information about the probability of the other.',
        example: 'Flipping Heads on a coin and rolling a 6 on a die.'
      }
    ],
    keyFormulas: [
      {
        name: 'Addition Rule (Union)',
        formula: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)',
        note: 'Subtract intersection to prevent double-counting shared outcomes.'
      },
      {
        name: 'Multiplication Rule for Independent Events',
        formula: 'P(A \\text{ and } B) = P(A) \\times P(B)',
        note: 'Multiply individual probabilities.'
      }
    ],
    workedExamples: [
      {
        problem: 'A standard deck has $52$ cards. What is the probability of drawing either a King or a Heart?',
        difficulty: 'Intermediate',
        steps: [
          'Probability of a King: $P(K) = \\frac{4}{52}$.',
          'Probability of a Heart: $P(H) = \\frac{13}{52}$.',
          'Intersection (King of Hearts): $P(K \\cap H) = \\frac{1}{52}$.',
          'Apply Addition Rule: $P(K \\cup H) = \\frac{4}{52} + \\frac{13}{52} - \\frac{1}{52} = \\frac{16}{52} = \\frac{4}{13}$.'
        ],
        finalAnswer: '\\frac{4}{13} \\approx 30.77\\%',
        proTip: 'Always check for overlap! The King of Hearts belongs to both groups and must not be counted twice.'
      }
    ],
    pitfalls: [
      'The Gambler\'s Fallacy: Thinking that after 5 coin tosses of Heads, Tails is "due". Each fair toss remains strictly 50/50 independent.',
      'Forgetting to reduce total count when sampling without replacement.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the probability of rolling a sum of 7 with two standard 6-sided dice?',
        options: ['1/6 (6/36)', '1/12', '7/36', '1/7'],
        answer: '1/6 (6/36)',
        explanation: 'Favorable pairs: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 pairs out of 36 total. $6/36 = 1/6$.'
      },
      {
        id: 'q2',
        question: 'If P(Rain) = 0.35, what is the probability that it will NOT rain?',
        options: ['0.65', '0.35', '0.75', '0.00'],
        answer: '0.65',
        explanation: 'Complement Rule: $P(\\text{no rain}) = 1 - P(\\text{rain}) = 1 - 0.35 = 0.65$.'
      },
      {
        id: 'q3',
        question: 'Two coins are tossed. What is the probability of getting at least one Head?',
        options: ['3/4 (75%)', '1/2 (50%)', '1/4 (25%)', '1/3 (33%)'],
        answer: '3/4 (75%)',
        explanation: 'Sample space: {HH, HT, TH, TT}. 3 out of 4 outcomes have at least one Head ($3/4$).'
      }
    ]
  },

  'Statistics:Data distributions': {
    id: 'Statistics:Data distributions',
    topic: 'Statistics',
    subjectNum: 4,
    chapterNum: 3,
    title: 'Data distributions',
    subtitle: 'Spread, Standard Deviation, Z-Scores, and The Normal Bell Curve',
    readTime: '8 min read',
    difficulty: 'Core',
    overview: 'Data distributions show how values are spread out across a dataset. The normal bell curve distribution explains natural variations in heights, test scores, manufacturing tolerances, and physics measurements.',
    theory: `### 1. Variance & Standard Deviation
While mean describes the center, **Standard Deviation ($\\sigma$ or $s$)** measures the average spread/dispersion around the mean:
$$\\sigma = \\sqrt{\\frac{\\sum (x_i - \\mu)^2}{N}}$$

### 2. The Normal Distribution (68-95-99.7 Empirical Rule)
For a bell-shaped symmetrical normal distribution $N(\\mu, \\sigma)$:
- **$68\\%$** of data falls within $\\pm 1\\sigma$ of the mean $(\\mu \\pm \\sigma)$.
- **$95\\%$** of data falls within $\\pm 2\\sigma$ of the mean $(\\mu \\pm 2\\sigma)$.
- **$99.7\\%$** of data falls within $\\pm 3\\sigma$ of the mean $(\\mu \\pm 3\\sigma)$.

### 3. Z-Scores (Standardization)
A **z-score** measures how many standard deviations an individual score $x$ is from the mean:
$$z = \\frac{x - \\mu}{\\sigma}$$`,
    definitions: [
      {
        term: 'Standard Deviation',
        symbol: '\\sigma, \\; s',
        meaning: 'A quantity expressing by how much the members of a group differ from the mean value.',
        example: 'A small $\\sigma$ means data points are tightly clustered near the average.'
      },
      {
        term: 'Z-Score',
        symbol: 'z',
        meaning: 'The number of standard deviations a data point lies above or below the mean.',
        example: '$z = +2.0$ means the value is 2 standard deviations above average (top 2.5%).'
      }
    ],
    keyFormulas: [
      {
        name: 'Standard Normal Z-Score',
        formula: 'z = \\frac{x - \\mu}{\\sigma}',
        note: 'Allows direct comparison between completely different scales and tests.'
      }
    ],
    workedExamples: [
      {
        problem: 'Exam scores are normally distributed with mean $\\mu = 75$ and standard deviation $\\sigma = 8$. What percentage of students scored between $67$ and $83$?',
        difficulty: 'Beginner',
        steps: [
          'Calculate lower boundary z-score: $z_1 = \\frac{67 - 75}{8} = \\frac{-8}{8} = -1$.',
          'Calculate upper boundary z-score: $z_2 = \\frac{83 - 75}{8} = \\frac{8}{8} = +1$.',
          'By the 68-95-99.7 empirical rule, exactly $\\approx 68\\%$ of observations lie within $\\pm 1\\sigma$.'
        ],
        finalAnswer: '\\approx 68\\%',
        proTip: 'Memorize 68-95-99.7 for $1\\sigma, 2\\sigma, 3\\sigma$ — it solves 90% of distribution questions instantly.'
      }
    ],
    pitfalls: [
      'Confusing variance $\\sigma^2$ with standard deviation $\\sigma$. Standard deviation is in the original units because it takes the square root.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'In a normal distribution, approximately what percentage of data falls within 2 standard deviations of the mean?',
        options: ['95%', '68%', '99.7%', '50%'],
        answer: '95%',
        explanation: 'Empirical Rule: $1\\sigma = 68\\%, 2\\sigma = 95\\%, 3\\sigma = 99.7\\%$.'
      },
      {
        id: 'q2',
        question: 'If a student has a z-score of 0 on an exam, what does this indicate?',
        options: ['They scored exactly equal to the class mean', 'They got zero questions correct', 'They got the lowest score', 'They scored 100%'],
        answer: 'They scored exactly equal to the class mean',
        explanation: '$z = 0 \\implies x - \\mu = 0 \\implies x = \\mu$.'
      },
      {
        id: 'q3',
        question: 'If heights have mean 170 cm and standard deviation 10 cm, what is the z-score of someone 190 cm tall?',
        options: ['+2.0', '+1.0', '+3.0', '-2.0'],
        answer: '+2.0',
        explanation: '$z = (190 - 170)/10 = 20/10 = +2.0$.'
      }
    ]
  },

  'Statistics:Hypothesis testing': {
    id: 'Statistics:Hypothesis testing',
    topic: 'Statistics',
    subjectNum: 4,
    chapterNum: 4,
    title: 'Hypothesis testing',
    subtitle: 'Null Hypotheses, P-Values, Significance Levels, and Decision Making',
    readTime: '8 min read',
    difficulty: 'Advanced',
    overview: 'Hypothesis testing is the scientific method of statistical decision-making: testing whether an observed experimental effect is real or just random chance coincidence.',
    theory: `### 1. Stating the Hypotheses
- **Null Hypothesis ($H_0$)**: The baseline claim of "no effect", "no difference", or "status quo".
- **Alternative Hypothesis ($H_a$ or $H_1$)**: The research claim of a real difference or effect.

### 2. The P-Value and Significance Level ($\\alpha$)
- **Significance Level ($\\alpha$)**: The threshold for rejecting the null (commonly $\\alpha = 0.05$ or $5\\%$).
- **P-Value**: The probability of observing results at least as extreme as the sample data, assuming the null hypothesis is true.

> **Decision Rule**:
> - If $p \\le \\alpha$: **Reject $H_0$** (Statistically significant evidence supporting $H_a$).
> - If $p > \\alpha$: **Fail to reject $H_0$** (Insufficient evidence).`,
    definitions: [
      {
        term: 'Null Hypothesis',
        symbol: 'H_0',
        meaning: 'A statement that there is no statistical relationship or significant difference.',
        example: '$H_0: \\mu = 50$ (a drug has no effect on blood pressure).'
      },
      {
        term: 'P-Value',
        symbol: 'p',
        meaning: 'The probability of obtaining test results at least as extreme as observed, assuming $H_0$ is true.',
        example: 'A p-value of $0.01$ means there is only a $1\\%$ chance the data occurred by random luck alone.'
      }
    ],
    keyFormulas: [
      {
        name: 'Decision Criterion',
        formula: 'p \\le \\alpha \\implies \\text{Reject } H_0',
        note: '"When the p is low, the null must go!"'
      }
    ],
    workedExamples: [
      {
        problem: 'A clinical trial tests a new medicine at significance level $\\alpha = 0.05$. The statistical test returns a p-value of $p = 0.018$. What is the scientific conclusion?',
        difficulty: 'Intermediate',
        steps: [
          'Compare p-value with $\\alpha$: $0.018 < 0.05$.',
          'Since $p < \\alpha$, we reject the null hypothesis $H_0$.',
          'Conclusion: There is statistically significant evidence that the new medicine is effective.'
        ],
        finalAnswer: 'Reject H_0; The medicine shows statistically significant efficacy.',
        proTip: '"Failing to reject $H_0$" does NOT prove $H_0$ is true — it only means the data lacked sufficient evidence to disprove it.'
      }
    ],
    pitfalls: [
      'Saying we "accept" or "prove" the null hypothesis. We only ever "fail to reject" it.',
      'Confusing p-value with the probability that the hypothesis itself is true.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'If a test with significance level α = 0.05 yields a p-value of p = 0.003, what decision should be made?',
        options: ['Reject the null hypothesis (H₀)', 'Fail to reject the null hypothesis (H₀)', 'Accept the null hypothesis as proven', 'Increase the sample size'],
        answer: 'Reject the null hypothesis (H₀)',
        explanation: 'Since $p = 0.003 < 0.05$, we reject $H_0$.'
      },
      {
        id: 'q2',
        question: 'What is the standard significance level (α) most commonly used in scientific research?',
        options: ['0.05 (5%)', '0.50 (50%)', '0.001 (0.1%)', '0.20 (20%)'],
        answer: '0.05 (5%)',
        explanation: '$\\alpha = 0.05$ (a 5% false positive threshold) is the widely accepted benchmark in scientific literature.'
      },
      {
        id: 'q3',
        question: 'A coin is tested for fairness. What is the null hypothesis H₀?',
        options: ['The coin is fair (P(Heads) = 0.5)', 'The coin is biased towards Heads', 'The coin is biased towards Tails', 'The coin will always land on Heads'],
        answer: 'The coin is fair (P(Heads) = 0.5)',
        explanation: 'The null hypothesis always represents the default neutral claim of no bias or difference ($P = 0.5$).'
      }
    ]
  },

  // ===========================================================================
  // ARITHMETIC
  // ===========================================================================
  'Arithmetic:Basic operations': {
    id: 'Arithmetic:Basic operations',
    topic: 'Arithmetic',
    subjectNum: 5,
    chapterNum: 1,
    title: 'Basic operations',
    subtitle: 'Properties of Numbers, Prime Factorization, Factors, and Fluency',
    readTime: '6 min read',
    difficulty: 'Foundational',
    overview: 'Arithmetic is the foundational bedrock of all mathematical sciences: mastering addition, subtraction, multiplication, division, and number properties.',
    theory: `### 1. Fundamental Arithmetic Properties
1. **Commutative Property**: Order does not matter for addition & multiplication:
   $$a + b = b + a, \\quad a \\times b = b \\times a$$
2. **Associative Property**: Grouping does not matter:
   $$(a + b) + c = a + (b + c), \\quad (a \\times b) \\times c = a \\times (b \\times c)$$
3. **Identity Property**:
   $$a + 0 = a, \\quad a \\times 1 = a$$

### 2. Primes and Factors
- **Prime Number**: A natural number $> 1$ whose only positive divisors are $1$ and itself ($2, 3, 5, 7, 11, 13, \\dots$). Note that **$2$ is the only even prime**.
- **Greatest Common Divisor (GCD)**: The largest integer that divides both numbers without a remainder.
- **Least Common Multiple (LCM)**: The smallest positive integer that is divisible by both numbers.`,
    definitions: [
      {
        term: 'Prime Number',
        symbol: 'p \\in \\{2, 3, 5, 7, \\dots\\}',
        meaning: 'An integer greater than 1 having exactly two distinct positive divisors: 1 and itself.',
        example: '13 is prime; 15 is composite ($3 \\times 5$).'
      },
      {
        term: 'GCD & LCM',
        symbol: '\\gcd(a,b), \\; \\text{lcm}(a,b)',
        meaning: 'Greatest Common Divisor and Least Common Multiple.',
        example: '$\\gcd(12, 18) = 6$, $\\text{lcm}(12, 18) = 36$.'
      }
    ],
    keyFormulas: [
      {
        name: 'GCD-LCM Product Relation',
        formula: '\\gcd(a, b) \\times \\text{lcm}(a, b) = a \\times b',
        note: 'The product of two numbers always equals the product of their GCD and LCM.'
      }
    ],
    workedExamples: [
      {
        problem: 'Find the GCD and LCM of $24$ and $36$.',
        difficulty: 'Beginner',
        steps: [
          'Prime factorization of $24$: $2^3 \\times 3^1$.',
          'Prime factorization of $36$: $2^2 \\times 3^2$.',
          'GCD takes lowest powers: $2^2 \\times 3^1 = 4 \\times 3 = 12$.',
          'LCM takes highest powers: $2^3 \\times 3^2 = 8 \\times 9 = 72$.'
        ],
        finalAnswer: 'GCD = 12, \\; LCM = 72',
        proTip: 'Quick check: $12 \\times 72 = 864$, and $24 \\times 36 = 864$ ✓.'
      }
    ],
    pitfalls: [
      'Thinking 1 is a prime number: 1 is neither prime nor composite.',
      'Dividing by zero: Division by zero is strictly undefined.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the only even prime number?',
        options: ['2', '0', '4', 'There are no even primes'],
        answer: '2',
        explanation: '2 is prime because its only divisors are 1 and 2. All larger even numbers are divisible by 2 and therefore composite.'
      },
      {
        id: 'q2',
        question: 'What is the Least Common Multiple (LCM) of 6 and 8?',
        options: ['24', '48', '12', '14'],
        answer: '24',
        explanation: 'Multiples of 6: 6, 12, 18, 24... Multiples of 8: 8, 16, 24... Smallest shared is 24.'
      },
      {
        id: 'q3',
        question: 'Evaluate: 18 - 3 × 4 + 2',
        options: ['8', '62', '2', '24'],
        answer: '8',
        explanation: 'By order of operations, multiply first: $3 \\times 4 = 12$. Then $18 - 12 + 2 = 6 + 2 = 8$.'
      }
    ]
  },

  'Arithmetic:Fractions': {
    id: 'Arithmetic:Fractions',
    topic: 'Arithmetic',
    subjectNum: 5,
    chapterNum: 2,
    title: 'Fractions',
    subtitle: 'Equal Parts, Equivalent Fractions, Mixed Numbers, and Fraction Arithmetic',
    readTime: '7 min read',
    difficulty: 'Foundational',
    overview: 'A fraction represents a part of a whole. Understanding how to add, subtract, multiply, and divide fractions builds the bridge to rational functions and algebra.',
    theory: `### 1. Anatomy of a Fraction
$$\\frac{a}{b} = \\frac{\\text{Numerator (Parts you have)}}{\\text{Denominator (Total equal parts in whole)}} \\quad (b \\neq 0)$$

### 2. Four Operations with Fractions
1. **Addition & Subtraction (Requires Common Denominator)**:
   $$\\frac{a}{c} + \\frac{b}{c} = \\frac{a + b}{c}, \\quad \\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$$
2. **Multiplication (Straight Across)**:
   $$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$$
3. **Division ("Keep, Change, Flip")**:
   $$\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c} = \\frac{ad}{bc}$$`,
    definitions: [
      {
        term: 'Reciprocal',
        symbol: '\\frac{b}{a}',
        meaning: 'The multiplicative inverse of a fraction obtained by flipping numerator and denominator.',
        example: 'The reciprocal of $\\frac{3}{5}$ is $\\frac{5}{3}$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Fraction Division Rule',
        formula: '\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}',
        note: 'Multiply by the reciprocal of the second fraction.'
      }
    ],
    workedExamples: [
      {
        problem: 'Calculate and simplify: $\\frac{3}{4} + \\frac{2}{5}$',
        difficulty: 'Beginner',
        steps: [
          'Find the LCD of $4$ and $5$: $\\text{LCD} = 20$.',
          'Convert $\\frac{3}{4} = \\frac{3 \\times 5}{4 \\times 5} = \\frac{15}{20}$.',
          'Convert $\\frac{2}{5} = \\frac{2 \\times 4}{5 \\times 4} = \\frac{8}{20}$.',
          'Add numerators: $\\frac{15 + 8}{20} = \\frac{23}{20} = 1\\frac{3}{20}$.'
        ],
        finalAnswer: '\\frac{23}{20} \\text{ or } 1\\frac{3}{20}',
        proTip: 'Never add denominators! $\\frac{1}{2} + \\frac{1}{2} = \\frac{2}{2} = 1$, NOT $\\frac{2}{4}$.'
      }
    ],
    pitfalls: [
      'Adding denominators together: $\\frac{a}{b} + \\frac{c}{d} \\neq \\frac{a+c}{b+d}$.',
      'Forgetting to invert the second fraction when dividing.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is 3/5 × 10/9 in simplest form?',
        options: ['2/3', '30/45', '6/9', '1/3'],
        answer: '2/3',
        explanation: 'Multiply straight across: $30/45$. Divide both numerator and denominator by 15 to get $2/3$.'
      },
      {
        id: 'q2',
        question: 'What is 2/3 ÷ 4/5?',
        options: ['5/6', '8/15', '6/5', '10/12'],
        answer: '5/6',
        explanation: 'Keep, change, flip: $\\frac{2}{3} \\times \\frac{5}{4} = \\frac{10}{12} = \\frac{5}{6}$.'
      },
      {
        id: 'q3',
        question: 'Which fraction is equivalent to 0.75?',
        options: ['3/4', '7/5', '75/10', '2/3'],
        answer: '3/4',
        explanation: '$0.75 = 75/100 = 3/4$.'
      }
    ]
  },

  'Arithmetic:Decimals': {
    id: 'Arithmetic:Decimals',
    topic: 'Arithmetic',
    subjectNum: 5,
    chapterNum: 3,
    title: 'Decimals',
    subtitle: 'Place Value, Decimal Arithmetic, Repeating Decimals, and Precision',
    readTime: '6 min read',
    difficulty: 'Foundational',
    overview: 'Decimals use the base-10 positional system to represent numbers smaller than 1 (tenths, hundredths, thousandths) seamlessly alongside whole numbers.',
    theory: `### 1. Place Value System
To the right of the decimal point:
- $0.1 = \\frac{1}{10}$ (Tenths)
- $0.01 = \\frac{1}{100}$ (Hundredths)
- $0.001 = \\frac{1}{1000}$ (Thousandths)

### 2. Operations with Decimals
- **Addition & Subtraction**: **Align the decimal points vertically** before adding or subtracting. Pad with trailing zeroes if needed.
- **Multiplication**: Multiply as if whole numbers, then place the decimal point so the total decimal places in the answer equals the sum of decimal places in the factors.
  $$0.3 \\text{ (1 place)} \\times 0.04 \\text{ (2 places)} = 0.012 \\text{ (3 places)}$$
- **Division**: Shift the decimal point of the divisor to make it a whole number, and shift the dividend by the same number of places.`,
    definitions: [
      {
        term: 'Place Value',
        symbol: '10^{-k}',
        meaning: 'The value of a digit depending on its position relative to the decimal point.',
        example: 'In $4.582$, the digit $8$ represents $8$ hundredths ($0.08$).'
      }
    ],
    keyFormulas: [
      {
        name: 'Decimal Multiplication Rule',
        formula: '\\text{Total Decimal Places} = \\text{Places}_1 + \\text{Places}_2',
        note: 'Count decimal places in both factors and sum them.'
      }
    ],
    workedExamples: [
      {
        problem: 'Evaluate: $3.25 \\times 0.4$',
        difficulty: 'Beginner',
        steps: [
          'Multiply as whole numbers: $325 \\times 4 = 1300$.',
          'Count total decimal places: $3.25$ has 2 places, $0.4$ has 1 place $\\implies 2 + 1 = 3$ places.',
          'Place the decimal point 3 spots from the right: $1.300 = 1.3$.'
        ],
        finalAnswer: '1.3',
        proTip: 'Dropping trailing zeroes after the decimal point ($1.300 = 1.3$) keeps numbers clean.'
      }
    ],
    pitfalls: [
      'Not aligning decimal points during addition or subtraction.',
      'Miscounting zeroes when multiplying small decimals.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is 0.7 + 0.25?',
        options: ['0.95', '0.32', '0.9', '0.725'],
        answer: '0.95',
        explanation: 'Align decimal points: $0.70 + 0.25 = 0.95$.'
      },
      {
        id: 'q2',
        question: 'What is 0.06 × 0.5?',
        options: ['0.03', '0.3', '0.003', '0.030'],
        answer: '0.03',
        explanation: '$6 \\times 5 = 30$. Total 3 decimal places: $0.030 = 0.03$.'
      },
      {
        id: 'q3',
        question: 'What is 12.6 ÷ 3?',
        options: ['4.2', '4.6', '0.42', '42'],
        answer: '4.2',
        explanation: '$12.6 / 3 = 4.2$.'
      }
    ]
  },

  'Arithmetic:Percentages': {
    id: 'Arithmetic:Percentages',
    topic: 'Arithmetic',
    subjectNum: 5,
    chapterNum: 4,
    title: 'Percentages',
    subtitle: 'Per Hundred, Percentage Change, Discounts, and Real-World Proportions',
    readTime: '6 min read',
    difficulty: 'Foundational',
    overview: 'Percent means "per one hundred" (from Latin *per centum*). It standardizes fractions onto a universal scale of 100.',
    theory: `### 1. Converting Percentages
- **Percent to Decimal**: Divide by $100$ (move decimal 2 spots left): $45\\% = 0.45$.
- **Percent to Fraction**: Place over $100$ and simplify: $25\\% = \\frac{25}{100} = \\frac{1}{4}$.

### 2. Key Percentage Formulas
1. **Finding a Percent of a Number**:
   $$\\text{Part} = \\text{Percent} \\times \\text{Whole}$$
2. **Percentage Change (Increase / Decrease)**:
   $$\\% \\text{ Change} = \\frac{|\\text{New Value} - \\text{Old Value}|}{\\text{Old Value}} \\times 100\\%$$`,
    definitions: [
      {
        term: 'Percentage',
        symbol: '\\%',
        meaning: 'A rate, number, or amount in each hundred.',
        example: '$15\\%$ means $15$ parts out of every $100$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Percentage Change Formula',
        formula: '\\% \\Delta = \\frac{\\text{Final} - \\text{Initial}}{\\text{Initial}} \\times 100\\%',
        note: 'Always divide by the original (initial) baseline value.'
      }
    ],
    workedExamples: [
      {
        problem: 'A coat originally priced at $\\$80$ is on sale with a $25\\%$ discount. What is the final sale price?',
        difficulty: 'Beginner',
        steps: [
          'Method 1: Find discount amount: $0.25 \\times 80 = \\$20$. Final price $= 80 - 20 = \\$60$.',
          'Method 2: If $25\\%$ is discounted, you pay $75\\%$: $0.75 \\times 80 = \\$60$.'
        ],
        finalAnswer: '\\$60',
        proTip: 'Using the multiplier method ($1 - 0.25 = 0.75$) solves discounts in a single multiplication step.'
      }
    ],
    pitfalls: [
      'Dividing percentage change by the new value instead of the original value.',
      'Thinking a $50\\%$ increase followed by a $50\\%$ decrease returns to the original price (it results in a $25\\%$ net loss!).'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is 15% of 80?',
        options: ['12', '15', '8', '16'],
        answer: '12',
        explanation: '$0.15 \\times 80 = 12$.'
      },
      {
        id: 'q2',
        question: 'A stock price increases from $50 to $65. What is the percentage increase?',
        options: ['30%', '15%', '25%', '35%'],
        answer: '30%',
        explanation: 'Change $= 65 - 50 = 15$. $\\% \\text{ increase} = (15 / 50) \\times 100\\% = 30\\%$.'
      },
      {
        id: 'q3',
        question: 'What is 3/5 expressed as a percentage?',
        options: ['60%', '35%', '75%', '30%'],
        answer: '60%',
        explanation: '$3/5 = 0.60 = 60\\%$.'
      }
    ]
  },

  'Arithmetic:Word problems': {
    id: 'Arithmetic:Word problems',
    topic: 'Arithmetic',
    subjectNum: 5,
    chapterNum: 5,
    title: 'Word problems',
    subtitle: 'Translating Real-World Contexts into Solvable Mathematical Plans',
    readTime: '7 min read',
    difficulty: 'Core',
    overview: 'Word problems test your ability to read natural English descriptions, extract the key quantities and constraints, and translate them into clean mathematical equations.',
    theory: `### 1. The English-to-Math Dictionary
- **Addition**: sum, total, increased by, more than, combined ($+$)
- **Subtraction**: difference, decreased by, less than, remaining ($-$)
- **Multiplication**: product, times, of, each, per ($\\times$)
- **Division**: quotient, per, divided equally among, ratio ($\\div$)
- **Equals**: is, was, equals, results in, is equal to ($=$)

### 2. Polya’s 4-Step Problem-Solving Method
1. **Understand the problem**: What is asked? What are the givens?
2. **Devise a plan**: Assign variables and set up an equation.
3. **Carry out the plan**: Solve the equation systematically.
4. **Look back**: Does the answer make sense in the real-world context?`,
    definitions: [
      {
        term: 'Mathematical Modeling',
        symbol: '\\text{Context} \\to \\text{Equation}',
        meaning: 'The process of converting a real-world scenario into mathematical symbols to reach a verifiable solution.',
        example: 'Translating speed and distance into $d = rt$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Distance Formula',
        formula: 'd = r \\cdot t \\quad (\\text{Distance} = \\text{Rate} \\times \\text{Time})',
        note: 'Fundamental equation for all motion and speed problems.'
      }
    ],
    workedExamples: [
      {
        problem: 'Maya has $\\$120$. She buys 3 books at $\\$18$ each and a backpack for $\\$35$. How much money does she have left?',
        difficulty: 'Beginner',
        steps: [
          'Calculate total spent on books: $3 \\times 18 = \\$54$.',
          'Calculate total expenditure: $54 + 35 = \\$89$.',
          'Subtract from initial amount: $120 - 89 = \\$31$.'
        ],
        finalAnswer: '\\$31 \\text{ remaining}',
        proTip: 'Always check if units match before adding or multiplying quantities.'
      }
    ],
    pitfalls: [
      'Answering with the variable value when the question asked for something else (e.g. finding $x$ when asked for the perimeter).',
      'Ignoring unit conversions (e.g. mixing hours and minutes).'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A train travels at a constant speed of 65 mph for 4 hours. How far does it travel?',
        options: ['260 miles', '240 miles', '130 miles', '270 miles'],
        answer: '260 miles',
        explanation: '$d = r \\times t = 65 \\times 4 = 260$ miles.'
      },
      {
        id: 'q2',
        question: 'Three consecutive integers sum to 72. What is the smallest integer?',
        options: ['23', '24', '22', '25'],
        answer: '23',
        explanation: 'Let integers be $x, x+1, x+2$. Sum $= 3x + 3 = 72 \\implies 3x = 69 \\implies x = 23$.'
      },
      {
        id: 'q3',
        question: 'A pizza is cut into 8 equal slices. If Leo eats 3 slices and Mia eats 2 slices, what fraction remains?',
        options: ['3/8', '5/8', '1/2', '1/4'],
        answer: '3/8',
        explanation: 'Eaten $= 3 + 2 = 5$ slices. Remaining $= 8 - 5 = 3$ slices, which is $3/8$ of the pizza.'
      }
    ]
  },
  ...physicsData,
  ...csData,
  ...chemistryData
};

// =============================================================================
// MATHEMATICS CURRICULUM UNIFICATION (Units 1 - 5, 23 Sequential Chapters)
// =============================================================================
export const MATH_CHAPTER_ORDER = [
  // Unit 1: Arithmetic & Number Foundations
  { key: 'Arithmetic:Basic operations', unit: 'Arithmetic', unitNum: 1, chapterNum: 1 },
  { key: 'Arithmetic:Fractions', unit: 'Arithmetic', unitNum: 1, chapterNum: 2 },
  { key: 'Arithmetic:Decimals', unit: 'Arithmetic', unitNum: 1, chapterNum: 3 },
  { key: 'Arithmetic:Percentages', unit: 'Arithmetic', unitNum: 1, chapterNum: 4 },
  { key: 'Arithmetic:Word problems', unit: 'Arithmetic', unitNum: 1, chapterNum: 5 },
  // Unit 2: Algebra & Algebraic Reasoning
  { key: 'Algebra:Foundations of variables', unit: 'Algebra', unitNum: 2, chapterNum: 6 },
  { key: 'Algebra:Expressions and simplification', unit: 'Algebra', unitNum: 2, chapterNum: 7 },
  { key: 'Algebra:Linear equations', unit: 'Algebra', unitNum: 2, chapterNum: 8 },
  { key: 'Algebra:Quadratic equations', unit: 'Algebra', unitNum: 2, chapterNum: 9 },
  { key: 'Algebra:Inequalities', unit: 'Algebra', unitNum: 2, chapterNum: 10 },
  // Unit 3: Geometry & Measurement
  { key: 'Geometry:Shapes and their properties', unit: 'Geometry', unitNum: 3, chapterNum: 11 },
  { key: 'Geometry:Angles', unit: 'Geometry', unitNum: 3, chapterNum: 12 },
  { key: 'Geometry:Area and perimeter', unit: 'Geometry', unitNum: 3, chapterNum: 13 },
  { key: 'Geometry:Volume', unit: 'Geometry', unitNum: 3, chapterNum: 14 },
  { key: 'Geometry:Trigonometry', unit: 'Geometry', unitNum: 3, chapterNum: 15 },
  // Unit 4: Calculus & Functions
  { key: 'Calculus:Limits', unit: 'Calculus', unitNum: 4, chapterNum: 16 },
  { key: 'Calculus:Derivatives', unit: 'Calculus', unitNum: 4, chapterNum: 17 },
  { key: 'Calculus:Integrals', unit: 'Calculus', unitNum: 4, chapterNum: 18 },
  { key: 'Calculus:Differential equations', unit: 'Calculus', unitNum: 4, chapterNum: 19 },
  // Unit 5: Statistics & Probability
  { key: 'Statistics:Mean, median, and mode', unit: 'Statistics', unitNum: 5, chapterNum: 20 },
  { key: 'Statistics:Probability', unit: 'Statistics', unitNum: 5, chapterNum: 21 },
  { key: 'Statistics:Data distributions', unit: 'Statistics', unitNum: 5, chapterNum: 22 },
  { key: 'Statistics:Hypothesis testing', unit: 'Statistics', unitNum: 5, chapterNum: 23 }
];

// Enrich all math chapters with unit tags and register Mathematics:* aliases
MATH_CHAPTER_ORDER.forEach((item) => {
  const orig = textbookData[item.key];
  if (orig) {
    orig.subject = 'Mathematics';
    orig.unit = item.unit;
    orig.unitNum = item.unitNum;
    orig.mathChapterNum = item.chapterNum;
    // Register alias under Mathematics namespace
    const mathKey = `Mathematics:${orig.title}`;
    if (!textbookData[mathKey]) {
      textbookData[mathKey] = {
        ...orig,
        id: mathKey,
        topic: 'Mathematics',
        subject: 'Mathematics',
        chapterNum: item.chapterNum,
        unit: item.unit,
        unitNum: item.unitNum
      };
    }
  }
});

export const SUBJECT_ORDER = [
  'Mathematics',
  'Physics',
  'Computer Science',
  'Chemistry'
];

export const SUBJECT_THEMES = {
  Mathematics: { color: '#ec735e', lightBg: '#fae8e2', icon: '📐', bookNum: 1, totalChapters: 23 },
  Physics: { color: '#4f46e5', lightBg: '#eef2ff', icon: '⚛️', bookNum: 2, totalChapters: 4 },
  'Computer Science': { color: '#0d9488', lightBg: '#f0fdfa', icon: '💻', bookNum: 3, totalChapters: 4 },
  Chemistry: { color: '#e11d48', lightBg: '#fff1f2', icon: '🧪', bookNum: 4, totalChapters: 4 },
  // Fallbacks for legacy branches:
  Algebra: { color: '#ec735e', lightBg: '#fae8e2', icon: '📐', bookNum: 1, totalChapters: 5 },
  Geometry: { color: '#f6c857', lightBg: '#fef7e7', icon: '🔷', bookNum: 1, totalChapters: 5 },
  Calculus: { color: '#c7b9e9', lightBg: '#f4f1fa', icon: '∫', bookNum: 1, totalChapters: 4 },
  Statistics: { color: '#84b98a', lightBg: '#eef6ef', icon: '📊', bookNum: 1, totalChapters: 4 },
  Arithmetic: { color: '#d8a47f', lightBg: '#f8f1eb', icon: '🔢', bookNum: 1, totalChapters: 5 }
};

export function getTextbookChapter(topic, title) {
  if (!topic || !title) return null;
  const key = `${topic}:${title}`;
  if (textbookData[key]) return textbookData[key];
  if (textbookData[`Mathematics:${title}`]) return textbookData[`Mathematics:${title}`];

  // Case-insensitive lookup fallback
  const foundKey = Object.keys(textbookData).find(
    (k) => k.toLowerCase() === key.toLowerCase() || k.toLowerCase().endsWith(`:${title.toLowerCase()}`)
  );
  return foundKey ? textbookData[foundKey] : null;
}

export function getTextbookChapterById(id) {
  if (!id) return null;
  if (textbookData[id]) return textbookData[id];
  const lower = id.toLowerCase().trim();
  const foundKey = Object.keys(textbookData).find((k) => k.toLowerCase() === lower);
  if (foundKey) return textbookData[foundKey];

  // Try matching by title
  const foundByTitle = Object.keys(textbookData).find(
    (k) => k.toLowerCase().endsWith(`:${lower}`) || textbookData[k].title?.toLowerCase() === lower
  );
  if (foundByTitle) return textbookData[foundByTitle];

  // Try matching partial
  const partial = Object.keys(textbookData).find((k) => k.toLowerCase().includes(lower));
  return partial ? textbookData[partial] : null;
}

export function getChaptersForSubject(subject) {
  if (!subject) return [];
  const s = subject.toLowerCase().trim();
  if (s === 'mathematics' || s === 'math') {
    return MATH_CHAPTER_ORDER.map((item) => {
      const orig = textbookData[item.key] || textbookData[`Mathematics:${item.key.split(':')[1]}`];
      return {
        ...orig,
        id: `Mathematics:${orig.title}`,
        legacyId: item.key,
        topic: 'Mathematics',
        subject: 'Mathematics',
        unit: item.unit,
        unitNum: item.unitNum,
        chapterNum: item.chapterNum
      };
    });
  }

  // Check STEM subjects (Physics, Computer Science, Chemistry)
  const isSTEM = ['physics', 'computer science', 'chemistry'].includes(s);
  if (isSTEM) {
    return Object.values(textbookData).filter(
      (ch, idx, arr) =>
        ch.topic?.toLowerCase() === s &&
        arr.findIndex((x) => x.id === ch.id) === idx
    );
  }

  // Legacy individual math branch support (e.g. 'Algebra', 'Geometry')
  return Object.values(textbookData).filter(
    (ch, idx, arr) =>
      (ch.topic?.toLowerCase() === s || ch.unit?.toLowerCase() === s) &&
      arr.findIndex((x) => x.title === ch.title) === idx
  );
}

export function getAdjacentChapters(currentChapterId) {
  const allOrderedChapters = [
    ...getChaptersForSubject('Mathematics'),
    ...getChaptersForSubject('Physics'),
    ...getChaptersForSubject('Computer Science'),
    ...getChaptersForSubject('Chemistry')
  ];

  const lower = (currentChapterId || '').toLowerCase().trim();
  const currentIndex = allOrderedChapters.findIndex(
    (ch) =>
      ch.id.toLowerCase() === lower ||
      (ch.legacyId && ch.legacyId.toLowerCase() === lower) ||
      ch.title.toLowerCase() === lower ||
      lower.endsWith(`:${ch.title.toLowerCase()}`)
  );

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: currentIndex > 0 ? allOrderedChapters[currentIndex - 1] : null,
    next: currentIndex < allOrderedChapters.length - 1 ? allOrderedChapters[currentIndex + 1] : null
  };
}

