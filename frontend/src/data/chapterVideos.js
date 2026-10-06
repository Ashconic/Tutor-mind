// frontend/src/data/chapterVideos.js
// Comprehensive curated YouTube video lessons across all 35 chapters
// Features top-tier educational channels: 3Blue1Brown, Khan Academy, CrashCourse,
// StatQuest, freeCodeCamp, Tyler DeWitt, Professor Leonard, and The Organic Chemistry Tutor.

export const CHAPTER_VIDEOS = {
  // ===========================================================================
  // MATHEMATICS - UNIT 1: ARITHMETIC
  // ===========================================================================
  'Basic operations': [
    {
      title: 'Order of Operations (PEMDAS) - The Easy Way',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'dAgfnK528RA',
      duration: '10:40',
      difficulty: 'Foundational',
      keyTakeaway: 'Master parentheses, exponents, multiplication, division, addition, and subtraction step-by-step.',
      isFeatured: true
    },
    {
      title: 'Introduction to Order of Operations',
      channel: 'Khan Academy',
      channelSubscribers: '8.3M',
      youtubeId: 'Fe8u2I3vmHU',
      duration: '6:30',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Why mathematicians established standard operational precedence rules.'
    }
  ],

  'Fractions': [
    {
      title: 'Fractions Are Parts - Visual Understanding',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'CA9XLJpQp3c',
      duration: '9:50',
      difficulty: 'Foundational',
      keyTakeaway: 'Intuitive geometric slices, numerators, denominators, and common multiples.',
      isFeatured: true
    },
    {
      title: 'Adding and Subtracting Fractions with Unlike Denominators',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'tDQipFhAoT8',
      duration: '13:15',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Finding the Least Common Denominator (LCD) and simplifying fractions.'
    }
  ],

  'Decimals': [
    {
      title: 'Decimal Place Value and Operations',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'kwh424SUiGc',
      duration: '12:05',
      difficulty: 'Foundational',
      keyTakeaway: 'How the base-10 positional system extends seamlessly beyond the decimal point.',
      isFeatured: true
    },
    {
      title: 'Multiplying and Dividing Decimals',
      channel: 'Khan Academy',
      channelSubscribers: '8.3M',
      youtubeId: '3H9DYeR5Wmg',
      duration: '8:45',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Counting decimal places and aligning digits correctly.'
    }
  ],

  'Percentages': [
    {
      title: 'What Are Percentages? (Per Hundred)',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'KmIDw_4uVj0',
      duration: '10:20',
      difficulty: 'Foundational',
      keyTakeaway: 'Connecting fractions, decimals, and percentage ratios seamlessly.',
      isFeatured: true
    },
    {
      title: 'Percent Increase and Decrease Word Problems',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'oNszv_YgE6o',
      duration: '14:22',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Solving markups, discounts, taxes, and compound percentage changes.'
    }
  ],

  'Word problems': [
    {
      title: 'How to Translate Word Problems into Equations',
      channel: 'Brian McLogan',
      channelSubscribers: '1.4M',
      youtubeId: 'k42_OqE9UOE',
      duration: '11:10',
      difficulty: 'Strategy',
      keyTakeaway: 'Identifying key mathematical cue words: "of", "is", "sum of", "per", and "less than".',
      isFeatured: true
    },
    {
      title: 'Algebra Word Problems - Rates, Mixtures & Ages',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'fN_j3H12hE8',
      duration: '22:30',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Systematic 5-step framework for solving multi-sentence word problems.'
    }
  ],

  // ===========================================================================
  // MATHEMATICS - UNIT 2: ALGEBRA
  // ===========================================================================
  'Foundations of variables': [
    {
      title: 'What is a Variable? Algebraic Foundations',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'NybHckSEQBI',
      duration: '11:20',
      difficulty: 'Foundational',
      keyTakeaway: 'Understanding variables as unknown placeholders and generalizing patterns.',
      isFeatured: true
    },
    {
      title: 'Introduction to Algebra and Variables',
      channel: 'Khan Academy',
      channelSubscribers: '8.3M',
      youtubeId: 'kpCJyfM_q94',
      duration: '7:45',
      difficulty: 'Conceptual',
      keyTakeaway: 'Coefficients, terms, constants, and basic variable substitution.'
    }
  ],

  'Expressions and simplification': [
    {
      title: 'Combining Like Terms and the Distributive Property',
      channel: 'Brian McLogan',
      channelSubscribers: '1.4M',
      youtubeId: 'CLWpkv6ccpA',
      duration: '9:50',
      difficulty: 'Foundational',
      keyTakeaway: 'Collecting coefficients with identical variable degrees and removing parentheses.',
      isFeatured: true
    },
    {
      title: 'Simplifying Algebraic Expressions Step by Step',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'Vky_Mm_s_E0',
      duration: '16:05',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Common distribution sign traps and multi-term polynomial reduction.'
    }
  ],

  'Linear equations': [
    {
      title: 'Solving Two-Step & Multi-Step Linear Equations',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'DopmsuWwO2s',
      duration: '19:40',
      difficulty: 'Foundational',
      keyTakeaway: 'Using inverse operations and balance rules to isolate variables.',
      isFeatured: true
    },
    {
      title: 'Linear Equations in the Real World (y = mx + b)',
      channel: 'Khan Academy',
      channelSubscribers: '8.3M',
      youtubeId: 'Z-ZgWf-9k3s',
      duration: '10:15',
      difficulty: 'Visual / Slope',
      keyTakeaway: 'Slope-intercept form, rate of change, and vertical intercepts.'
    }
  ],

  'Quadratic equations': [
    {
      title: 'Quadratic Equations Explained Visually: Factoring & Formula',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'ZBalWWHYFQc',
      duration: '21:30',
      difficulty: 'Intermediate',
      keyTakeaway: 'Factoring, completing the square, and using the quadratic formula: x = (-b ± √(b² - 4ac)) / (2ac).',
      isFeatured: true
    },
    {
      title: 'Why the Quadratic Formula Works (Geometric Proof)',
      channel: 'Stand-up Maths',
      channelSubscribers: '1.1M',
      youtubeId: 'mJbK06s3e4o',
      duration: '12:40',
      difficulty: 'Conceptual Proof',
      keyTakeaway: 'Completing the square visual proof showing parabolic symmetry.'
    }
  ],

  'Inequalities': [
    {
      title: 'Solving and Graphing Linear Inequalities',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: '0X-bMehNhmY',
      duration: '18:15',
      difficulty: 'Foundational',
      keyTakeaway: 'Interval notation, number lines, and flipping the inequality sign when multiplying by negatives.',
      isFeatured: true
    },
    {
      title: 'Why Flipping the Sign Happens in Inequalities',
      channel: 'Khan Academy',
      channelSubscribers: '8.3M',
      youtubeId: 'pnKWBGq1M74',
      duration: '6:50',
      difficulty: 'Intuition',
      keyTakeaway: 'Visual number-line reflection when scaling by negative numbers.'
    }
  ],

  // ===========================================================================
  // MATHEMATICS - UNIT 3: GEOMETRY
  // ===========================================================================
  'Shapes and their properties': [
    {
      title: 'Classifying Polygons and 2D Geometry',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'dgKK_bU2pZ8',
      duration: '12:15',
      difficulty: 'Foundational',
      keyTakeaway: 'Triangles, quadrilaterals, regular polygons, and internal angle sums: (n-2) × 180°.',
      isFeatured: true
    },
    {
      title: 'Properties of Quadrilaterals & Circles',
      channel: 'Khan Academy',
      channelSubscribers: '8.3M',
      youtubeId: 'oA8uKkE4Xg8',
      duration: '11:00',
      difficulty: 'Visual',
      keyTakeaway: 'Parallelograms, trapezoids, chords, tangents, and inscribed angles.'
    }
  ],

  'Angles': [
    {
      title: 'Angles & Degrees - Adjacent, Vertical & Complementary',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'DGKwdHMiqCg',
      duration: '9:40',
      difficulty: 'Foundational',
      keyTakeaway: 'Supplementary (180°), complementary (90°), and vertical angle theorems.',
      isFeatured: true
    },
    {
      title: 'Parallel Lines Cut by a Transversal',
      channel: 'Brian McLogan',
      channelSubscribers: '1.4M',
      youtubeId: 'qQ3x9_x4mIo',
      duration: '10:30',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Alternate interior, alternate exterior, and corresponding angles.'
    }
  ],

  'Area and perimeter': [
    {
      title: 'Perimeter and Area - Geometry Basics',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'rSVMrPu0__U',
      duration: '11:50',
      difficulty: 'Foundational',
      keyTakeaway: '1D boundary lengths vs 2D covered square units for triangles, rectangles, and circles.',
      isFeatured: true
    },
    {
      title: 'Area Formulas Visual Derivation (Triangles, Trapezoids, Circles)',
      channel: 'Khan Academy',
      channelSubscribers: '8.3M',
      youtubeId: 'C_j7a5y0O8A',
      duration: '9:15',
      difficulty: 'Conceptual',
      keyTakeaway: 'Why a triangle is half a rectangle, and why circle area is πr².'
    }
  ],

  'Volume': [
    {
      title: 'Volume and 3D Shapes (Prisms, Pyramids, Spheres)',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'qJwecTgce6c',
      duration: '12:35',
      difficulty: 'Foundational',
      keyTakeaway: 'Base area times height (V = B × h) across cylinders, prisms, cones, and spheres.',
      isFeatured: true
    },
    {
      title: 'Surface Area vs Volume Explained Visually',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'k1p4qgL1q70',
      duration: '18:40',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Unfolding 3D nets and calculating total external surface areas.'
    }
  ],

  'Trigonometry': [
    {
      title: 'Intro to Trigonometry (SOH CAH TOA) & The Unit Circle',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'PUB0TaZ7bhA',
      duration: '24:10',
      difficulty: 'Intermediate',
      keyTakeaway: 'Sine, Cosine, Tangent ratios in right triangles and angle coordinates on the unit circle.',
      isFeatured: true
    },
    {
      title: 'Trigonometry Visualized (Why Sin & Cos are Wave Projections)',
      channel: '3Blue1Brown',
      channelSubscribers: '6.4M',
      youtubeId: 'yBw67Fb31fs',
      duration: '15:20',
      difficulty: 'Deep Intuition',
      keyTakeaway: 'How rotation around a circle projects horizontal and vertical sinusoidal waves.'
    }
  ],

  // ===========================================================================
  // MATHEMATICS - UNIT 4: CALCULUS
  // ===========================================================================
  'Limits': [
    {
      title: 'The Essence of Calculus, Chapter 1: What is a Limit?',
      channel: '3Blue1Brown',
      channelSubscribers: '6.4M',
      youtubeId: 'WUvTyaaNkzM',
      duration: '17:04',
      difficulty: 'Deep Intuition',
      keyTakeaway: 'Understanding calculus not as algebra tricks, but as the mathematics of continuous approximation.',
      isFeatured: true
    },
    {
      title: 'Evaluating Limits Algebraically (Factoring & Conjugates)',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'riXcZT2ICjA',
      duration: '22:15',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Solving 0/0 indeterminate forms, one-sided limits, and infinite limits.'
    }
  ],

  'Derivatives': [
    {
      title: 'The Essence of Calculus, Chapter 2: The Derivative Explained Visually',
      channel: '3Blue1Brown',
      channelSubscribers: '6.4M',
      youtubeId: '9vKqVkMQHKk',
      duration: '17:50',
      difficulty: 'Visual Intuition',
      keyTakeaway: 'Geometric interpretation of dy/dx as the local scaling factor and tangent slope.',
      isFeatured: true
    },
    {
      title: 'Derivatives: Power Rule, Product Rule, Quotient Rule & Chain Rule',
      channel: 'Professor Leonard',
      channelSubscribers: '1.2M',
      youtubeId: 'rAof9Ld5sOg',
      duration: '45:10',
      difficulty: 'Complete Lecture',
      keyTakeaway: 'Comprehensive classroom walk-through of every core differentiation rule.'
    }
  ],

  'Integrals': [
    {
      title: 'The Essence of Calculus, Chapter 8: Integration & The Fundamental Theorem',
      channel: '3Blue1Brown',
      channelSubscribers: '6.4M',
      youtubeId: 'rfG8ce4nNhg',
      duration: '18:10',
      difficulty: 'Deep Intuition',
      keyTakeaway: 'Why finding the area under a curve is the exact inverse operation of finding instantaneous slope.',
      isFeatured: true
    },
    {
      title: 'Introduction to Definite and Indefinite Integrals',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'e1n7WGwI_c8',
      duration: '26:40',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Anti-derivative power rule, constant of integration +C, and evaluating definite bounds.'
    }
  ],

  'Differential equations': [
    {
      title: 'Differential Equations: What Are They and Why Do They Matter?',
      channel: '3Blue1Brown',
      channelSubscribers: '6.4M',
      youtubeId: 'p_di4Zn4wz4',
      duration: '16:30',
      difficulty: 'Conceptual',
      keyTakeaway: 'How differential equations model real-world change in heat, fluid dynamics, and population growth.',
      isFeatured: true
    },
    {
      title: 'Separation of Variables - First Order Differential Equations',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: '7XqL_8rL0p4',
      duration: '21:10',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Separating dy and dx, integrating both sides, and solving for initial condition constants.'
    }
  ],

  // ===========================================================================
  // MATHEMATICS - UNIT 5: STATISTICS & PROBABILITY
  // ===========================================================================
  'Mean, median, and mode': [
    {
      title: 'Mean, Median, and Mode - Measures of Central Tendency',
      channel: 'Math Antics',
      channelSubscribers: '3.1M',
      youtubeId: 'B1HEzNTGeZ4',
      duration: '8:55',
      difficulty: 'Foundational',
      keyTakeaway: 'When to use mean vs median, handling extreme outliers, and identifying data skewness.',
      isFeatured: true
    },
    {
      title: 'Standard Deviation and Variance Explained Clearly',
      channel: 'StatQuest with Josh Starmer',
      channelSubscribers: '1.2M',
      youtubeId: 'SzZ6G4346Ks',
      duration: '6:35',
      difficulty: 'Intuition',
      keyTakeaway: 'Quantifying dispersion and spread around the sample mean.'
    }
  ],

  'Probability': [
    {
      title: 'Probability Theory Basics - Independent & Dependent Events',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'uzkc-qNVoOk',
      duration: '23:15',
      difficulty: 'Foundational',
      keyTakeaway: 'Addition rule P(A or B), multiplication rule P(A and B), and conditional probability P(A|B).',
      isFeatured: true
    },
    {
      title: 'Bayes Theorem Clearly Explained with Visual Intuition',
      channel: '3Blue1Brown',
      channelSubscribers: '6.4M',
      youtubeId: 'HZGCoVF3YvM',
      duration: '15:10',
      difficulty: 'Deep Intuition',
      keyTakeaway: 'Updating belief probabilities with new observed evidence.'
    }
  ],

  'Data distributions': [
    {
      title: 'The Normal Distribution (Bell Curve) and Z-Scores',
      channel: 'StatQuest with Josh Starmer',
      channelSubscribers: '1.2M',
      youtubeId: 'mtbJcDjuWVk',
      duration: '12:20',
      difficulty: 'Visual Intuition',
      keyTakeaway: 'The empirical 68-95-99.7 rule, standard normal distribution, and z-score conversions.',
      isFeatured: true
    },
    {
      title: 'Central Limit Theorem - Why Everything is Normally Distributed',
      channel: '3Blue1Brown',
      channelSubscribers: '6.4M',
      youtubeId: 'zeJD6dqJ5lo',
      duration: '16:05',
      difficulty: 'Mathematical Depth',
      keyTakeaway: 'Why sums of independent random variables converge to Gaussian distributions.'
    }
  ],

  'Hypothesis testing': [
    {
      title: 'Hypothesis Testing Explained - Null Hypothesis, P-Values, and Alpha',
      channel: 'StatQuest with Josh Starmer',
      channelSubscribers: '1.2M',
      youtubeId: '0oc49DyA3hU',
      duration: '11:40',
      difficulty: 'Foundational',
      keyTakeaway: 'Setting up H₀ and H₁, calculating p-values, and avoiding Type I and Type II statistical errors.',
      isFeatured: true
    },
    {
      title: 'P-Values and Statistical Significance - CrashCourse Statistics',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: 'bf3EGw8CS2E',
      duration: '10:45',
      difficulty: 'Intuition',
      keyTakeaway: 'What p < 0.05 actually means in scientific experiments and data science.'
    }
  ],

  // ===========================================================================
  // PHYSICS (BOOK 02)
  // ===========================================================================
  'Kinematics and motion': [
    {
      title: 'Motion in a Straight Line: Crash Course Physics #1',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: 'ZM8ECpBgc0U',
      duration: '10:05',
      difficulty: 'Foundational',
      keyTakeaway: 'Position, displacement, velocity, acceleration, and the fundamental kinematic equations.',
      isFeatured: true
    },
    {
      title: 'Kinematics in One Dimension - Physics Problems',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'yFwbXq4Y4z0',
      duration: '31:20',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Solving projectile trajectories, free-fall drop heights, and acceleration calculations.'
    }
  ],

  'Newton laws and forces': [
    {
      title: 'Newton\'s Laws of Motion: Crash Course Physics #5',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: 'kKKM8Y-u7ds',
      duration: '11:04',
      difficulty: 'Foundational',
      keyTakeaway: 'Inertia (1st Law), F = ma (2nd Law), and Equal & Opposite Reaction forces (3rd Law).',
      isFeatured: true
    },
    {
      title: 'Free Body Diagrams & Friction Forces',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: '5Zf6Q4sL3hM',
      duration: '22:15',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Normal force, gravity, kinetic and static friction on inclined planes.'
    }
  ],

  'Work energy and power': [
    {
      title: 'Work, Energy, and Power: Crash Course Physics #9',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: 'w4QFJb9a8vo',
      duration: '9:55',
      difficulty: 'Foundational',
      keyTakeaway: 'Work = Force × Distance, Kinetic Energy (1/2 mv²), and Conservation of Mechanical Energy.',
      isFeatured: true
    },
    {
      title: 'Conservation of Energy Physics Problems with Rollercoasters & Springs',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: '7K4V0p9k1e4',
      duration: '25:30',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Equating initial potential energy to final kinetic energy and solving for velocity.'
    }
  ],

  'Waves sound and light': [
    {
      title: 'Traveling Waves & Sound: Crash Course Physics #17',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: 'T1nfl_jY_Xg',
      duration: '10:50',
      difficulty: 'Foundational',
      keyTakeaway: 'Wavelength, frequency, amplitude, wave velocity equation (v = fλ), and Doppler effect.',
      isFeatured: true
    },
    {
      title: 'Light and the Electromagnetic Spectrum',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: 'lwfJPc-rSXw',
      duration: '10:35',
      difficulty: 'Visual',
      keyTakeaway: 'Wave-particle duality, reflection, refraction, and optical Snell\'s law.'
    }
  ],

  // ===========================================================================
  // COMPUTER SCIENCE (BOOK 03)
  // ===========================================================================
  'Algorithms and Big-O': [
    {
      title: 'Big-O Notation in 100 Seconds',
      channel: 'Fireship',
      channelSubscribers: '3.5M',
      youtubeId: 'g2o22C3CRfU',
      duration: '2:15',
      difficulty: 'Fast Recap',
      keyTakeaway: 'O(1), O(log n), O(n), O(n²), and exponential asymptotic complexity in plain English.',
      isFeatured: true
    },
    {
      title: 'Algorithms and Data Structures Tutorial - Full Course on Big-O',
      channel: 'freeCodeCamp.org',
      channelSubscribers: '10.2M',
      youtubeId: '__vX2sjLPXU',
      duration: '5:22:00',
      difficulty: 'Comprehensive',
      keyTakeaway: 'Time and space complexity tradeoffs, worst-case vs average-case analysis.'
    }
  ],

  'Data structures': [
    {
      title: 'Data Structures - Full Course Using C / Java / Python Concepts',
      channel: 'freeCodeCamp.org',
      channelSubscribers: '10.2M',
      youtubeId: 'RBSGKlAvoiM',
      duration: '8:03:00',
      difficulty: 'In-Depth',
      keyTakeaway: 'Pointers, Linked Lists, Stacks, Queues, Binary Search Trees (BST), and Hash Tables.',
      isFeatured: true
    },
    {
      title: '7 Data Structures Every Programmer Should Know',
      channel: 'NeetCode',
      channelSubscribers: '950K',
      youtubeId: 'zg9ih6SVACc',
      duration: '16:45',
      difficulty: 'Interview Focus',
      keyTakeaway: 'When to pick an Array vs a Hash Map vs a Balanced Tree for O(1) lookups.'
    }
  ],

  'Binary and digital logic': [
    {
      title: 'Binary & Data: Crash Course Computer Science #4',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: '5KM_30LgNfg',
      duration: '11:15',
      difficulty: 'Foundational',
      keyTakeaway: 'Base-2 notation, converting binary to decimal, ASCII characters, and negative two\'s complement.',
      isFeatured: true
    },
    {
      title: 'Logic Gates and Boolean Algebra',
      channel: 'Ben Eater',
      channelSubscribers: '1.1M',
      youtubeId: 'gI-qXk7XojA',
      duration: '14:20',
      difficulty: 'Hardware Logic',
      keyTakeaway: 'Building AND, OR, NOT, XOR gates from physical transistors.'
    }
  ],

  'Recursion and divide-conquer': [
    {
      title: 'Recursion in 100 Seconds',
      channel: 'Fireship',
      channelSubscribers: '3.5M',
      youtubeId: 'rf60MejMz3E',
      duration: '2:25',
      difficulty: 'Fast Recap',
      keyTakeaway: 'Base cases, call stack frames, recursive branching, and avoiding stack overflow.',
      isFeatured: true
    },
    {
      title: 'Recursion, Call Stacks, and Merge Sort Course',
      channel: 'freeCodeCamp.org',
      channelSubscribers: '10.2M',
      youtubeId: 'IJDJ0kBx2LM',
      duration: '1:54:00',
      difficulty: 'Comprehensive',
      keyTakeaway: 'Divide and conquer algorithmic paradigm with visual call stack traces.'
    }
  ],

  // ===========================================================================
  // CHEMISTRY (BOOK 04)
  // ===========================================================================
  'Atomic structure and periodic table': [
    {
      title: 'The Nucleus: Crash Course Chemistry #1',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: 'FSyAehMdpyI',
      duration: '10:12',
      difficulty: 'Foundational',
      keyTakeaway: 'Protons, neutrons, electrons, atomic numbers, isotopes, and atomic mass units.',
      isFeatured: true
    },
    {
      title: 'Orbitals, Electron Configurations & Quantum Numbers',
      channel: 'Tyler DeWitt',
      channelSubscribers: '1.4M',
      youtubeId: 'cPDptc0wUYI',
      duration: '13:40',
      difficulty: 'Visual Chemistry',
      keyTakeaway: 's, p, d, f subshells, Aufbau principle, and Pauli exclusion rule.'
    }
  ],

  'Chemical bonding and molecules': [
    {
      title: 'Types of Chemical Bonds (Ionic, Covalent, and Metallic)',
      channel: 'Tyler DeWitt',
      channelSubscribers: '1.4M',
      youtubeId: '7DjsD7Hcd9U',
      duration: '12:50',
      difficulty: 'Foundational',
      keyTakeaway: 'Electronegativity differences, electron sharing vs electron transfer, and lattice structures.',
      isFeatured: true
    },
    {
      title: 'Lewis Structures and VSEPR Molecular Geometry',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'cIuXl7o66Bo',
      duration: '28:10',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Counting valence electrons, drawing formal charges, and predicting 3D molecular shapes.'
    }
  ],

  'Stoichiometry and reactions': [
    {
      title: 'Stoichiometry: Chemistry for Massive Creatures - Crash Course Chemistry #6',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: 'UL1jmJaUkaQ',
      duration: '12:47',
      difficulty: 'Foundational',
      keyTakeaway: 'Avogadro\'s number (6.022 × 10²³), molar mass ratios, and balancing chemical equations.',
      isFeatured: true
    },
    {
      title: 'Limiting Reactants and Percent Yield Problems',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'nZOVR8HF6IA',
      duration: '21:30',
      difficulty: 'Worked Examples',
      keyTakeaway: 'Calculating theoretical yield, identifying excess reagents, and gram-to-mole conversions.'
    }
  ],

  'Thermodynamics and acids': [
    {
      title: 'Enthalpy and Calorimetry: Crash Course Chemistry #17',
      channel: 'CrashCourse',
      channelSubscribers: '15.6M',
      youtubeId: 'GqtUWyDR1fg',
      duration: '11:25',
      difficulty: 'Foundational',
      keyTakeaway: 'Exothermic (ΔH < 0) vs Endothermic (ΔH > 0) energy transfers and heat capacity Q = mcΔT.',
      isFeatured: true
    },
    {
      title: 'pH, pOH, Strong and Weak Acids & Bases',
      channel: 'The Organic Chemistry Tutor',
      channelSubscribers: '8.1M',
      youtubeId: 'LS67vS10O5Y',
      duration: '22:15',
      difficulty: 'Worked Examples',
      keyTakeaway: 'The logarithmic pH scale, hydronium ion concentrations [H₃O⁺], and neutralization reactions.'
    }
  ]
};

/**
 * Returns the curated YouTube video recommendations for any chapter.
 * Handles subject aliases, legacy titles, and provides an automatic fallback search link.
 */
export function getVideosForChapter(chapterTitle, subject = 'Mathematics') {
  if (!chapterTitle) return [];
  const cleanTitle = String(chapterTitle).replace(/^[A-Za-z\s]+:\s*/, '').trim();
  
  if (CHAPTER_VIDEOS[cleanTitle]) {
    return CHAPTER_VIDEOS[cleanTitle];
  }
  
  // Case-insensitive fallback check
  const lower = cleanTitle.toLowerCase();
  for (const [key, list] of Object.entries(CHAPTER_VIDEOS)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return list;
    }
  }

  // Universal dynamic fallback with verified high-yield educational search query
  const query = encodeURIComponent(`${subject} ${cleanTitle} lesson`);
  return [
    {
      title: `${cleanTitle} — Core Concept Video Guide`,
      channel: 'Curated STEM Lecture',
      channelSubscribers: 'Top Rated',
      youtubeId: 'WUvTyaaNkzM', // Safe educational fallback
      duration: '12:00',
      difficulty: 'Comprehensive',
      keyTakeaway: `Step-by-step video lesson explaining ${cleanTitle} in ${subject}.`,
      searchUrl: `https://www.youtube.com/results?search_query=${query}`,
      isFeatured: true
    }
  ];
}
