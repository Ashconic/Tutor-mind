// =============================================================================
// TutorMind - Chemistry Curriculum (Book 08)
// =============================================================================

export const chemistryData = {
  'Chemistry:Atomic structure and periodic table': {
    id: 'Chemistry:Atomic structure and periodic table',
    topic: 'Chemistry',
    subjectNum: 8,
    chapterNum: 1,
    title: 'Atomic structure and periodic table',
    subtitle: 'Subatomic Particles, Isotopes, Electron Orbitals, and Periodic Trends',
    readTime: '7 min read',
    difficulty: 'Foundational',
    overview: 'Everything in the universe—from water and mountains to human cells—is constructed from atoms. Understanding atomic structure and the organization of the periodic table is the foundational key to all of chemistry.',
    theory: `### 1. Anatomy of an Atom
Atoms are composed of three primary subatomic particles:
- **Protons ($p^+$)**: Positively charged ($+1$), located in the dense central nucleus. Mass $\\approx 1 \\text{ amu}$.
- **Neutrons ($n^0$)**: Electrically neutral ($0$), located in the nucleus. Mass $\\approx 1 \\text{ amu}$.
- **Electrons ($e^-$)**: Negatively charged ($-1$), orbiting in shells outside the nucleus. Mass $\\approx \\frac{1}{1836} \\text{ amu}$ (negligible).

### 2. Atomic Number ($Z$) and Mass Number ($A$)
- **Atomic Number ($Z$)**: The number of protons. **Defines the element identity**.
- **Mass Number ($A$)**: Total count of nucleons:
  $$A = \\text{Protons } (Z) + \\text{Neutrons } (N)$$
- **Isotopes**: Atoms of the same element with identical proton counts but different numbers of neutrons (e.g. Carbon-12 vs. Carbon-14).

### 3. Electron Shells and Orbitals
Electrons reside in quantum energy levels:
- Maximum electrons per principal energy level $n$:
  $$\\text{Max Electrons} = 2n^2$$
  - $n = 1$: 2 electrons
  - $n = 2$: 8 electrons
  - $n = 3$: 18 electrons
- **Valence Electrons**: Electrons in the outermost shell that participate in chemical reactions.

### 4. Periodic Table Trends
Elements are arranged in rows (**periods**) and columns (**groups** or **families**) by increasing atomic number:
- **Electronegativity**: Tendency of an atom to attract shared electrons in a bond. Increases **up and to the right** (Fluorine is highest).
- **Atomic Radius**: Physical size of the electron cloud. Increases **down and to the left**.
- **Ionization Energy**: Energy required to remove an electron. Increases **up and to the right**.`,
    definitions: [
      {
        term: 'Atomic Number',
        symbol: 'Z',
        meaning: 'The number of protons in an atom nucleus, identifying the chemical element.',
        example: 'Carbon always has $Z = 6$; Gold always has $Z = 79$.'
      },
      {
        term: 'Isotope',
        symbol: '^{A}_{Z}\\text{X}',
        meaning: 'Variants of a chemical element with identical proton count but different neutron counts.',
        example: 'Carbon-14 ($6p^+, 8n^0$) used in radiocarbon archaeological dating.'
      },
      {
        term: 'Electronegativity',
        symbol: '\\chi',
        meaning: 'A measure of the ability of an atom in a chemical compound to attract electrons.',
        example: 'Fluorine ($4.0$) is the most electronegative element on the Pauling scale.'
      }
    ],
    keyFormulas: [
      {
        name: 'Mass Number Equation',
        formula: 'A = Z + N',
        note: 'Mass number equals protons ($Z$) plus neutrons ($N$).'
      },
      {
        name: 'Shell Electron Capacity',
        formula: '2n^2',
        note: 'Maximum capacity of principal energy level $n$.'
      }
    ],
    workedExamples: [
      {
        problem: 'An isotope of Uranium is written as $^{238}_{92}\\text{U}$. Determine its number of protons, neutrons, and electrons (assuming a neutral atom).',
        difficulty: 'Beginner',
        steps: [
          'Identify atomic number $Z$: the subscript is 92, so there are 92 protons.',
          'Identify mass number $A$: the superscript is 238.',
          'Calculate neutrons: $N = A - Z = 238 - 92 = 146$ neutrons.',
          'Calculate electrons: in a neutral atom, electrons equal protons = 92 electrons.'
        ],
        finalAnswer: '92 Protons, 146 Neutrons, 92 Electrons',
        proTip: 'Remember: the atomic number ($Z$) determines what element it is. If you change $Z$, you create a different element entirely!'
      }
    ],
    pitfalls: [
      'Confusing mass number ($A$, an integer count of $p + n$) with atomic weight (a weighted decimal average of isotopes found in nature).',
      'Thinking electrons orbit like planets: In modern quantum mechanics, electrons exist as probabilistic orbital clouds (s, p, d, f), not circular orbits.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which subatomic particle determines the chemical identity of an element?',
        options: ['Proton', 'Neutron', 'Electron', 'Positron'],
        answer: 'Proton',
        explanation: 'The number of protons (atomic number $Z$) uniquely identifies an element. Changing the number of protons changes the element itself.'
      },
      {
        id: 'q2',
        question: 'How many neutrons are in an atom of Carbon-14 ($^{14}_6\\text{C}$)?',
        options: ['8', '6', '14', '12'],
        answer: '8',
        explanation: 'Neutrons = Mass Number ($A$) - Protons ($Z$) = $14 - 6 = 8$ neutrons.'
      },
      {
        id: 'q3',
        question: 'Which periodic trend increases as you move from left to right across a period and from bottom to top up a group?',
        options: ['Electronegativity', 'Atomic Radius', 'Metallic Character', 'Nuclear Mass'],
        answer: 'Electronegativity',
        explanation: 'Electronegativity and ionization energy both increase toward the top-right of the periodic table (toward Fluorine).'
      }
    ]
  },

  'Chemistry:Chemical bonding and molecules': {
    id: 'Chemistry:Chemical bonding and molecules',
    topic: 'Chemistry',
    subjectNum: 8,
    chapterNum: 2,
    title: 'Chemical bonding and molecules',
    subtitle: 'Ionic, Covalent, and Metallic Bonds, Lewis Structures, and VSEPR Theory',
    readTime: '8 min read',
    difficulty: 'Intermediate',
    overview: 'Atoms bond together to achieve energetic stability, usually by obtaining a full outer valence shell of electrons (the Octet Rule). Chemical bonds determine whether a substance is a crystal salt, a conductive metal, or life-giving water.',
    theory: `### 1. The Octet Rule
Atoms tend to gain, lose, or share electrons until they are surrounded by **eight valence electrons**, achieving the stable electronic configuration of noble gases.

### 2. The Three Primary Types of Chemical Bonds
1. **Ionic Bonding (Metal + Nonmetal)**:
   - Complete transfer of valence electrons from an electropositive metal to an electronegative nonmetal.
   - Forms charged ions ($Na^+ + Cl^- \\to NaCl$) held together by strong electrostatic lattice attraction.
   - High melting points, soluble in water, conducts electricity when molten or dissolved.

2. **Covalent Bonding (Nonmetal + Nonmetal)**:
   - Mutual sharing of electron pairs between atoms.
   - **Nonpolar Covalent**: Equal sharing ($\\Delta EN < 0.5$, e.g. $O_2, CH_4$).
   - **Polar Covalent**: Unequal sharing due to electronegativity difference ($0.5 \\leq \\Delta EN \\leq 1.7$, e.g. $H_2O$).

3. **Metallic Bonding (Metal + Metal)**:
   - "Sea of delocalized valence electrons" surrounding fixed positive metal cations.
   - Explains high electrical conductivity, thermal conductivity, malleability, and ductility.

### 3. Lewis Structures
Diagrams showing how valence electrons are arranged among atoms in a molecule:
- Dots represent non-bonding lone pairs.
- Lines represent shared electron pairs (single bond = 2 $e^-$, double bond = 4 $e^-$, triple bond = 6 $e^-$).

### 4. VSEPR Theory (Molecular Geometry)
**Valence Shell Electron Pair Repulsion (VSEPR)** theory states that electron pairs around a central atom repel each other and position themselves as far apart as possible in 3D space:
- **Linear**: 2 electron domains ($180^\\circ$, e.g. $CO_2$)
- **Trigonal Planar**: 3 domains ($120^\\circ$, e.g. $BF_3$)
- **Tetrahedral**: 4 bonding domains ($109.5^\\circ$, e.g. $CH_4$)
- **Bent**: 2 bonds + 2 lone pairs ($104.5^\\circ$, e.g. $H_2O$)`,
    definitions: [
      {
        term: 'Ionic Bond',
        symbol: 'M^+ X^-',
        meaning: 'Chemical bond formed through electrostatic attraction between oppositely charged ions.',
        example: 'Table salt ($NaCl$), Magnesium oxide ($MgO$).'
      },
      {
        term: 'Covalent Bond',
        symbol: 'A:B \\text{ or } A-B',
        meaning: 'Chemical bond involving the sharing of electron pairs between atoms.',
        example: 'Water ($H_2O$), Carbon dioxide ($CO_2$).'
      },
      {
        term: 'VSEPR Theory',
        symbol: '\\text{Geometry}',
        meaning: 'Model predicting 3D molecular geometry based on minimizing valence electron electrostatic repulsion.',
        example: 'Explains why $H_2O$ is bent ($104.5^\\circ$) rather than linear.'
      }
    ],
    keyFormulas: [
      {
        name: 'Formal Charge Formula',
        formula: 'FC = V - N - \\frac{B}{2}',
        note: 'Valence electrons minus non-bonding electrons minus half of bonding electrons.'
      }
    ],
    workedExamples: [
      {
        problem: 'Determine whether the bond in Hydrogen Fluoride ($H-F$) is nonpolar covalent, polar covalent, or ionic. (Electronegativity: $H = 2.1$, $F = 4.0$)',
        difficulty: 'Beginner',
        steps: [
          'Calculate electronegativity difference: $\\Delta EN = |4.0 - 2.1| = 1.9$.',
          'Evaluate bonding continuum: $\\Delta EN \\geq 1.7$ typically borders on highly polar covalent to ionic.',
          'Since both H and F are nonmetals, they share electrons unequally with significant partial charges ($\\delta^+ H - F \\delta^-$).'
        ],
        finalAnswer: 'Extremely Polar Covalent bond',
        proTip: 'Fluorine pulls electron density so strongly that HF forms exceptionally strong hydrogen bonds in liquid form.'
      }
    ],
    pitfalls: [
      'Assuming all molecules with polar bonds are polar molecules: Carbon dioxide ($O=C=O$) has two polar $C=O$ bonds, but because it is linear and symmetric, the two dipoles cancel out completely, making $CO_2$ a nonpolar molecule!',
      'Ignoring lone pairs in molecular geometry: Lone pairs take up more space than bonding pairs, compressing bond angles (e.g. $CH_4$ is $109.5^\\circ$, while $H_2O$ is compressed to $104.5^\\circ$).'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which type of bonding occurs when electrons are transferred completely from one atom to another?',
        options: ['Ionic bonding', 'Covalent bonding', 'Metallic bonding', 'Hydrogen bonding'],
        answer: 'Ionic bonding',
        explanation: 'Ionic bonding involves the complete transfer of electrons from an electropositive atom (metal) to an electronegative atom (nonmetal), creating oppositely charged ions.'
      },
      {
        id: 'q2',
        question: 'What is the molecular geometry and approximate bond angle of a methane molecule (CH₄)?',
        options: ['Tetrahedral, 109.5°', 'Linear, 180°', 'Trigonal planar, 120°', 'Bent, 104.5°'],
        answer: 'Tetrahedral, 109.5°',
        explanation: 'Methane has four bonding electron pairs and zero lone pairs, forming a symmetric tetrahedral geometry with $109.5^\\circ$ bond angles.'
      },
      {
        id: 'q3',
        question: 'Why do metals conduct electricity effectively in their solid state?',
        options: [
          'They possess a sea of delocalized electrons that move freely through the crystal lattice',
          'Their electrons are tightly locked in rigid ionic bonds',
          'They are composed of neutral gaseous molecules',
          'Their protons freely migrate through the material'
        ],
        answer: 'They possess a sea of delocalized electrons that move freely through the crystal lattice',
        explanation: 'In metallic bonding, valence electrons are delocalized across all metal cations, allowing electrical current to flow with minimal resistance.'
      }
    ]
  },

  'Chemistry:Stoichiometry and reactions': {
    id: 'Chemistry:Stoichiometry and reactions',
    topic: 'Chemistry',
    subjectNum: 8,
    chapterNum: 3,
    title: 'Stoichiometry and reactions',
    subtitle: 'The Mole, Molar Mass, Balancing Reactions, and Limiting Reactants',
    readTime: '8 min read',
    difficulty: 'Intermediate',
    overview: 'Stoichiometry is the mathematical bridge of chemistry. It connects microscopic chemical formulas involving atoms and molecules to macroscopic quantities we can weigh on a scale in grams and kilograms.',
    theory: `### 1. The Mole and Avogadro Number
Because individual atoms are impossibly tiny, chemists group them into a convenient counting unit: the **mole ($mol$)**.
$$1 \\text{ mole} = 6.02214076 \\times 10^{23} \\text{ particles } (N_A)$$

### 2. Molar Mass ($M$)
The mass in grams of one mole of a chemical substance ($g/mol$):
- Carbon-12: $12.01 \\text{ g/mol}$
- Water ($H_2O$): $2(1.008) + 16.00 = 18.02 \\text{ g/mol}$

Conversion relationship:
$$\\text{Moles } (n) = \\frac{\\text{Mass in grams } (m)}{\\text{Molar Mass } (M)}$$

### 3. Conservation of Mass and Balancing Reactions
Chemical reactions rearrange atoms into new combinations, but never create or destroy matter:
$$\\text{Total Mass of Reactants} = \\text{Total Mass of Products}$$

Unbalanced:
$$H_2 + O_2 \\to H_2O \\quad (\\text{Incorrect: 2 oxygens on left, 1 on right})$$
Balanced:
$$2H_2 + O_2 \\to 2H_2O \\quad (\\text{4 H and 2 O on both sides!})$$

### 4. Stoichiometric Calculations (Mole Bridge)
To convert between substances in a balanced equation:
$$\\text{Grams of A} \\xrightarrow{\\div M_A} \\text{Moles of A} \\xrightarrow{\\times \\text{Mole Ratio}} \\text{Moles of B} \\xrightarrow{\\times M_B} \\text{Grams of B}$$

### 5. Limiting Reactants and Percent Yield
- **Limiting Reactant**: The reactant that runs out first, capping the maximum product that can form.
- **Percent Yield**:
  $$\\text{Percent Yield} = \\left(\\frac{\\text{Actual Experimental Yield}}{\\text{Theoretical Calculated Yield}}\\right) \\times 100\\%$$`,
    definitions: [
      {
        term: 'Mole',
        symbol: 'mol',
        meaning: 'SI base unit for amount of substance, equal to $6.022 \\times 10^{23}$ elementary entities.',
        example: '$1 \\text{ mol of carbon atoms} = 12.01 \\text{ grams}$.'
      },
      {
        term: 'Limiting Reactant',
        symbol: '\\text{LR}',
        meaning: 'The substance in a chemical reaction that is completely consumed first, limiting reaction extent.',
        example: 'If you have 10 slices of bread and 2 slices of cheese, cheese is the limiting reactant for making grilled cheese sandwiches.'
      }
    ],
    keyFormulas: [
      {
        name: 'Mole-Mass Relationship',
        formula: 'n = \\frac{m}{M}',
        note: 'Moles ($mol$) equals mass ($g$) divided by molar mass ($g/mol$).'
      },
      {
        name: 'Percent Yield',
        formula: '\\text{Yield} = \\frac{\\text{Actual}}{\\text{Theoretical}} \\times 100\\%',
        note: 'Measures reaction efficiency in laboratory practice.'
      }
    ],
    workedExamples: [
      {
        problem: 'How many moles of water ($H_2O$) are formed by the complete reaction of 4.0 moles of hydrogen gas ($H_2$) with excess oxygen gas?\nEquation: $2H_2 + O_2 \\to 2H_2O$',
        difficulty: 'Beginner',
        steps: [
          'Inspect the mole ratio from the balanced equation: $2 \\text{ mol } H_2 \\iff 2 \\text{ mol } H_2O$ (a 1:1 ratio).',
          'Calculate: $4.0 \\text{ mol } H_2 \\times \\left(\\frac{2 \\text{ mol } H_2O}{2 \\text{ mol } H_2}\\right) = 4.0 \\text{ mol } H_2O$.'
        ],
        finalAnswer: '$4.0 \\text{ moles of } H_2O$',
        proTip: 'Always start stoichiometry problems by checking that the equation is properly balanced!'
      }
    ],
    pitfalls: [
      'Changing chemical subscripts to balance equations: Changing $H_2 + O_2 \\to H_2O_2$ creates hydrogen peroxide (bleach), not water! Only change coefficients in front of formulas.',
      'Comparing grams directly instead of moles: 10 grams of hydrogen has vastly more atoms than 10 grams of lead ($Pb$). Always convert to moles first.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is Avogadro number of particles in one mole of any substance?',
        options: ['6.022 × 10²³', '3.00 × 10⁸', '9.81 × 10¹²', '1.602 × 10⁻¹⁹'],
        answer: '6.022 × 10²³',
        explanation: 'One mole is defined as exactly $6.02214076 \\times 10^{23}$ elementary entities.'
      },
      {
        id: 'q2',
        question: 'What is the molar mass of carbon dioxide (CO₂)? (C = 12.01 g/mol, O = 16.00 g/mol)',
        options: ['44.01 g/mol', '28.01 g/mol', '32.00 g/mol', '16.01 g/mol'],
        answer: '44.01 g/mol',
        explanation: '$1(12.01) + 2(16.00) = 12.01 + 32.00 = 44.01 \\text{ g/mol}$.'
      },
      {
        id: 'q3',
        question: 'In the balanced reaction N₂ + 3H₂ → 2NH₃, how many moles of ammonia (NH₃) are produced from 6 moles of H₂?',
        options: ['4 moles', '2 moles', '6 moles', '18 moles'],
        answer: '4 moles',
        explanation: 'The mole ratio is 3 mol H₂ to 2 mol NH₃: $6 \\text{ mol } H_2 \\times \\frac{2 \\text{ mol } NH_3}{3 \\text{ mol } H_2} = 4 \\text{ mol } NH_3$.'
      }
    ]
  },

  'Chemistry:Thermodynamics and acids': {
    id: 'Chemistry:Thermodynamics and acids',
    topic: 'Chemistry',
    subjectNum: 8,
    chapterNum: 4,
    title: 'Thermodynamics and acids',
    subtitle: 'Enthalpy, Exothermic vs Endothermic, pH Scale, and Neutralization',
    readTime: '8 min read',
    difficulty: 'Advanced',
    overview: 'Chemical processes are powered by the transfer of heat and energy. From fireworks releasing energetic bursts to acidic vinegar neutralizing alkaline baking soda, chemical thermodynamics and acid-base equilibrium govern our world.',
    theory: `### 1. Thermochemistry & Enthalpy
**Enthalpy ($H$)** represents the total heat content of a chemical system at constant pressure. The heat exchanged in a reaction is $\\Delta H$:
$$\\Delta H = H_{\\text{products}} - H_{\\text{reactants}}$$

- **Exothermic Reactions ($\\Delta H < 0$, Negative)**:
  - System releases thermal energy to surroundings (feels warm/hot).
  - Example: Combustion of wood, hand warmers, acid dilution.
- **Endothermic Reactions ($\\Delta H > 0$, Positive)**:
  - System absorbs thermal energy from surroundings (feels cold).
  - Example: Photosynthesis, chemical instant cold packs.

### 2. Calorimetry
The amount of heat $q$ absorbed or released by a substance with specific heat capacity $c$:
$$q = m c \\Delta T$$
*(Where $m$ is mass in grams and $\\Delta T = T_f - T_i$ is temperature change in $^\\circ\\text{C}$ or $K$)*

### 3. The Bronsted-Lowry Acid-Base Model
- **Acid**: A chemical species that **donates a proton ($H^+$)**.
- **Base**: A chemical species that **accepts a proton ($H^+$)**.

### 4. The pH Scale and Autoionization of Water
In pure water at $25^\\circ\\text{C}$, water auto-dissociates:
$$H_2O + H_2O \\rightleftharpoons H_3O^+ + OH^-$$
$$K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}$$

The logarithmic **pH scale** measures hydronium ion concentration:
$$\\text{pH} = -\\log_{10}[H^+]$$
- **Acidic**: $\\text{pH} < 7$ ($[H^+] > 10^{-7} \\text{ M}$)
- **Neutral**: $\\text{pH} = 7$ (pure water, $[H^+] = 10^{-7} \\text{ M}$)
- **Basic (Alkaline)**: $\\text{pH} > 7$ ($[H^+] < 10^{-7} \\text{ M}$)

Because the scale is logarithmic, a solution of pH 3 is **$10$ times** more acidic than pH 4 and **$100$ times** more acidic than pH 5!

### 5. Neutralization Reactions
$$\\text{Acid} + \\text{Base} \\to \\text{Salt} + \\text{Water}$$
$$HCl + NaOH \\to NaCl + H_2O$$`,
    definitions: [
      {
        term: 'Enthalpy Change (ΔH)',
        symbol: '\\Delta H',
        meaning: 'Heat absorbed or released by a reaction at constant atmospheric pressure.',
        example: '$\\Delta H = -890 \\text{ kJ/mol}$ for methane combustion.'
      },
      {
        term: 'pH Scale',
        symbol: '\\text{pH} = -\\log[H^+]',
        meaning: 'Logarithmic scale indicating the degree of acidity or alkalinity of an aqueous solution.',
        example: 'Stomach acid has $\\text{pH} \\approx 1.5$; bleach has $\\text{pH} \\approx 12.5$.'
      }
    ],
    keyFormulas: [
      {
        name: 'Specific Heat Formula',
        formula: 'q = m c \\Delta T',
        note: 'Heat transferred equals mass times specific heat capacity times temperature change.'
      },
      {
        name: 'pH Definition',
        formula: '\\text{pH} = -\\log_{10}[H^+], \\quad \\text{pH} + \\text{pOH} = 14',
        note: 'Valid for all aqueous solutions at $25^\\circ\\text{C}$.'
      }
    ],
    workedExamples: [
      {
        problem: 'Calculate the pH of a solution with a hydrogen ion concentration of $[H^+] = 1.0 \\times 10^{-4} \\text{ M}$.',
        difficulty: 'Beginner',
        steps: [
          'State the pH formula: $\\text{pH} = -\\log_{10}[H^+]$.',
          'Substitute $[H^+] = 1.0 \\times 10^{-4}$: $\\text{pH} = -\\log_{10}(10^{-4})$.',
          'Evaluate the logarithm: $-\\log_{10}(10^{-4}) = -(-4) = 4.0$.'
        ],
        finalAnswer: 'pH = 4.0 (Acidic)',
        proTip: 'When $[H^+] = 1.0 \\times 10^{-x}$, the pH is simply $x$!'
      }
    ],
    pitfalls: [
      'Thinking a reaction with $\\Delta H < 0$ absorbs heat: Negative $\\Delta H$ indicates an EXOTHERMIC reaction that releases heat to the environment.',
      'Assuming pH can only range from 0 to 14: Extremely concentrated strong acids can have negative pH (e.g. 12 M HCl has $\\text{pH} \\approx -1.1$).'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A chemical reaction releases 250 kJ of heat to the surroundings. What is its enthalpy change (ΔH)?',
        options: ['-250 kJ (Exothermic)', '+250 kJ (Endothermic)', '0 kJ', '+500 kJ'],
        answer: '-250 kJ (Exothermic)',
        explanation: 'Heat released to the surroundings indicates an exothermic reaction, which has a negative enthalpy change ($\\Delta H = -250 \\text{ kJ}$).'
      },
      {
        id: 'q2',
        question: 'How many times more acidic is a solution of pH 3 compared to a solution of pH 5?',
        options: ['100 times', '2 times', '20 times', '1,000 times'],
        answer: '100 times',
        explanation: 'The pH scale is logarithmic (base 10). A difference of 2 pH units corresponds to $10^2 = 100$ times greater concentration of $H^+$ ions.'
      },
      {
        id: 'q3',
        question: 'What are the products of an Arrhenius neutralization reaction between hydrochloric acid (HCl) and sodium hydroxide (NaOH)?',
        options: ['NaCl and H₂O', 'NaH and Cl₂O', 'Na₂O and HCl', 'H₂ and NaClO'],
        answer: 'NaCl and H₂O',
        explanation: 'Acid + Base produces a salt and water: $HCl + NaOH \\to NaCl + H_2O$.'
      }
    ]
  }
};
