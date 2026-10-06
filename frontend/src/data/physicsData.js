// =============================================================================
// TutorMind - Physics Curriculum (Book 06)
// =============================================================================

export const physicsData = {
  'Physics:Kinematics and motion': {
    id: 'Physics:Kinematics and motion',
    topic: 'Physics',
    subjectNum: 6,
    chapterNum: 1,
    title: 'Kinematics and motion',
    subtitle: 'Displacement, Velocity, Acceleration, and Free Fall',
    readTime: '7 min read',
    difficulty: 'Foundational',
    overview: 'Kinematics describes how objects move without worrying about the forces causing that motion. Using position, velocity, and acceleration, we can predict trajectories of cars, rockets, and falling bodies.',
    theory: `### 1. Motion in One Dimension
In classical physics, motion is the change of an object's position relative to a reference frame over time.

#### Position, Displacement, and Distance
- **Position ($x$)**: The location of an object at a specific point in time relative to a defined origin.
- **Displacement ($\\Delta x$ or $s$)**: A **vector quantity** representing the straight-line change in position:
  $$\\Delta x = x_f - x_i$$
- **Distance ($d$)**: A **scalar quantity** representing the total path length traveled, always positive ($d \\geq |\\Delta x|$).

### 2. Velocity vs. Speed
- **Average Velocity ($v_{avg}$)**: The rate of change of displacement with respect to time (vector):
  $$v_{avg} = \\frac{\\Delta x}{\\Delta t}$$
- **Instantaneous Velocity ($v$)**: The derivative of position with respect to time:
  $$v = \\frac{dx}{dt}$$
- **Average Speed**: The total distance traveled divided by total elapsed time:
  $$\\text{Speed}_{avg} = \\frac{\\text{Total Distance}}{\\Delta t}$$

### 3. Acceleration
When an object's velocity changes (either speeding up, slowing down, or changing direction), it experiences **acceleration ($a$)**:
$$a = \\frac{dv}{dt} = \\frac{d^2 x}{dt^2}$$

### 4. The Kinematic Equations (Constant Acceleration)
When acceleration $a$ is constant, four fundamental equations govern all 1D motion:
1. Velocity-Time:
   $$v = u + at$$
2. Position-Time:
   $$s = ut + \\frac{1}{2}at^2$$
3. Velocity-Displacement (Torricelli's formula):
   $$v^2 = u^2 + 2as$$
4. Average Velocity Form:
   $$s = \\left(\\frac{u + v}{2}\\right)t$$

*(Where $u$ = initial velocity, $v$ = final velocity, $a$ = acceleration, $t$ = time, and $s$ = displacement)*

### 5. Free Fall Under Gravity
In a vacuum near Earth's surface, all falling bodies accelerate downward at the constant rate:
$$g \\approx 9.8 \\text{ m/s}^2 \\quad (\\text{or } 32.2 \\text{ ft/s}^2)$$
Mass has zero effect on free-fall acceleration (as demonstrated by Galileo's experiment at Pisa).`,
    definitions: [
      {
        term: 'Displacement',
        symbol: '\\Delta x \\text{ or } s',
        meaning: 'The vector difference between an object final position and initial position.',
        example: 'If you walk 10 m East and 4 m West, your displacement is 6 m East, though distance traveled is 14 m.'
      },
      {
        term: 'Instantaneous Velocity',
        symbol: 'v = \\frac{dx}{dt}',
        meaning: 'The rate of change of position at an infinitesimal instant in time.',
        example: 'The reading on your car speedometer with your direction of travel: 65 mph North.'
      },
      {
        term: 'Acceleration',
        symbol: 'a = \\frac{dv}{dt}',
        meaning: 'The rate at which an object velocity changes per unit time.',
        example: 'A sports car accelerating from 0 to 60 mph in 3.0 seconds has an average acceleration of 8.94 m/s².'
      },
      {
        term: 'Gravitational Acceleration',
        symbol: 'g',
        meaning: 'The uniform downward acceleration experienced by objects in free fall near a celestial body.',
        example: 'On Earth, $g = 9.8 \\text{ m/s}^2$. On the Moon, $g \\approx 1.62 \\text{ m/s}^2$.'
      }
    ],
    keyFormulas: [
      {
        name: 'First Kinematic Equation',
        formula: 'v = u + at',
        note: 'Links initial velocity ($u$), final velocity ($v$), acceleration ($a$), and time ($t$).'
      },
      {
        name: 'Second Kinematic Equation',
        formula: 's = ut + \\frac{1}{2}at^2',
        note: 'Calculates displacement when time and initial speed are known.'
      },
      {
        name: 'Third Kinematic Equation',
        formula: 'v^2 = u^2 + 2as',
        note: 'Crucial when time ($t$) is unknown or not given in the problem.'
      }
    ],
    workedExamples: [
      {
        problem: 'A train traveling at 20 m/s brakes uniformly to a complete stop over a distance of 80 m. Find its acceleration and the time taken to stop.',
        difficulty: 'Intermediate',
        steps: [
          'Identify the known variables: initial velocity $u = 20 \\text{ m/s}$, final velocity $v = 0 \\text{ m/s}$, displacement $s = 80 \\text{ m}$.',
          'Select the equation without time $t$: use $v^2 = u^2 + 2as$.',
          'Substitute: $0^2 = 20^2 + 2a(80) \\implies 0 = 400 + 160a$.',
          'Solve for $a$: $160a = -400 \\implies a = -2.5 \\text{ m/s}^2$ (the negative sign confirms deceleration).',
          'Find time using $v = u + at$: $0 = 20 + (-2.5)t \\implies 2.5t = 20 \\implies t = 8.0 \\text{ seconds}$.'
        ],
        finalAnswer: 'Acceleration: $-2.5 \\text{ m/s}^2$ | Time to stop: $8.0 \\text{ s}$',
        proTip: 'Always check the sign of acceleration! If an object is slowing down in the positive direction, acceleration must be negative.'
      }
    ],
    pitfalls: [
      'Confusing distance and displacement: A round trip from home to school and back has positive distance but zero net displacement.',
      'Assuming deceleration always means negative acceleration: If an object is moving in the negative direction and speeding up, its acceleration is negative.',
      'Forgetting that velocity is zero at peak projectile height: When thrown vertically upward, $v = 0$ at maximum altitude, but $a = -9.8 \\text{ m/s}^2$ throughout the entire flight.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A ball is dropped from rest ($u = 0$) from a bridge. What is its downward velocity after falling for 3 seconds? (Take $g = 9.8 \\text{ m/s}^2$)',
        options: ['29.4 m/s', '19.6 m/s', '44.1 m/s', '9.8 m/s'],
        answer: '29.4 m/s',
        explanation: 'Using $v = u + gt$: $v = 0 + (9.8 \\times 3) = 29.4 \\text{ m/s}$.'
      },
      {
        id: 'q2',
        question: 'An athlete runs once around a 400 m circular track in 50 seconds, finishing at the exact starting point. What was the athlete average velocity?',
        options: ['0 m/s', '8 m/s', '4 m/s', '16 m/s'],
        answer: '0 m/s',
        explanation: 'Average velocity is displacement divided by time. Since the start and end points coincide, displacement is 0 m, making average velocity 0 m/s (average speed was 8 m/s).'
      },
      {
        id: 'q3',
        question: 'A car accelerates uniformly from rest at $4.0 \\text{ m/s}^2$. How far does it travel in the first 5 seconds?',
        options: ['50 m', '100 m', '20 m', '25 m'],
        answer: '50 m',
        explanation: 'Using $s = ut + \\frac{1}{2}at^2$: $s = 0(5) + \\frac{1}{2}(4.0)(5^2) = 2.0 \\times 25 = 50 \\text{ m}$.'
      }
    ]
  },

  'Physics:Newton laws and forces': {
    id: 'Physics:Newton laws and forces',
    topic: 'Physics',
    subjectNum: 6,
    chapterNum: 2,
    title: 'Newton laws and forces',
    subtitle: 'Inertia, Force, Mass, Acceleration, and Action-Reaction',
    readTime: '8 min read',
    difficulty: 'Intermediate',
    overview: 'Dynamics connects motion to the forces causing it. Sir Isaac Newton three laws of motion published in 1687 remain the bedrock of modern classical physics and mechanical engineering.',
    theory: `### 1. The Concept of Force
A **force** is a push or pull resulting from an interaction between two objects. It is a vector quantity measured in **Newtons ($N$)**, where:
$$1 \\text{ N} = 1 \\text{ kg} \\cdot \\text{m/s}^2$$

### 2. Newton First Law (Law of Inertia)
> *An object at rest stays at rest, and an object in uniform motion stays in motion at a constant velocity, unless acted upon by a non-zero net external force.*

- **Inertia**: The natural tendency of any object to resist changes to its state of motion.
- Inertia is directly proportional to **mass**: a massive bowling ball has vastly more inertia than a tennis ball.

### 3. Newton Second Law ($F_{net} = ma$)
When a net external force acts on an object of mass $m$, it produces an acceleration $a$ directly proportional to the force and inversely proportional to the mass:
$$\\mathbf{F}_{net} = \\sum \\mathbf{F} = m\\mathbf{a}$$

In component form:
$$F_{net, x} = m a_x, \\quad F_{net, y} = m a_y$$

### 4. Newton Third Law (Action & Reaction)
> *For every action force, there is an equal and opposite reaction force.*

$$\\mathbf{F}_{A \\text{ on } B} = -\\mathbf{F}_{B \\text{ on } A}$$

Key Insight: Action and reaction forces act on **different** bodies, so they never cancel each other out!

### 5. Types of Everyday Forces
- **Weight ($W$)**: Gravitational pull toward Earth center: $W = mg$.
- **Normal Force ($N$ or $F_N$)**: The perpendicular contact force exerted by a supporting surface.
- **Friction ($f$)**: The resistive force parallel to contact surfaces:
  - Static friction: $f_s \\leq \\mu_s N$ (prevents sliding)
  - Kinetic friction: $f_k = \\mu_k N$ (opposes ongoing sliding)`,
    definitions: [
      {
        term: 'Inertia',
        symbol: 'm \\text{ (mass)}',
        meaning: 'The resistance of an object to any change in its velocity.',
        example: 'Passengers lurching forward when a bus slams on the brakes.'
      },
      {
        term: 'Newton (Unit)',
        symbol: '1 \\text{ N} = 1 \\text{ kg}\\cdot\\text{m/s}^2',
        meaning: 'The force required to accelerate a 1 kilogram mass at a rate of 1 meter per second squared.',
        example: 'The weight of a small apple (approx. 100 grams) is roughly 1 Newton.'
      },
      {
        term: 'Normal Force',
        symbol: 'F_N \\text{ or } N',
        meaning: 'The perpendicular contact force exerted by a surface on an object pressing against it.',
        example: 'The table pushing upward against your laptop with a force equal to the laptop weight.'
      }
    ],
    keyFormulas: [
      {
        name: 'Newton Second Law',
        formula: 'F_{net} = ma',
        note: 'Net force equals mass times acceleration. If $F_{net} = 0$, velocity is constant.'
      },
      {
        name: 'Weight Equation',
        formula: 'W = mg',
        note: 'Weight is a force ($N$); mass is an intrinsic quantity of matter ($kg$).'
      },
      {
        name: 'Kinetic Friction',
        formula: 'f_k = \\mu_k N',
        note: '$\\mu_k$ is the dimensionless coefficient of kinetic friction.'
      }
    ],
    workedExamples: [
      {
        problem: 'A crate of mass 50 kg rests on a floor with coefficient of kinetic friction $\\mu_k = 0.3$. What horizontal pulling force is required to accelerate the crate at $2.0 \\text{ m/s}^2$?',
        difficulty: 'Intermediate',
        steps: [
          'Calculate normal force: on a flat surface, $N = mg = 50 \\times 9.8 = 490 \\text{ N}$.',
          'Calculate friction force: $f_k = \\mu_k N = 0.3 \\times 490 = 147 \\text{ N}$.',
          'Set up Newton Second Law: $F_{pull} - f_k = ma$.',
          'Substitute: $F_{pull} - 147 = 50 \\times 2.0 = 100$.',
          'Solve for $F_{pull}$: $F_{pull} = 100 + 147 = 247 \\text{ N}$.'
        ],
        finalAnswer: '$247 \\text{ N}$',
        proTip: 'Always draw a Free Body Diagram (FBD) before writing equations!'
      }
    ],
    pitfalls: [
      'Believing motion requires a force: An object drifting through deep space needs no force to keep moving at 10,000 km/h.',
      'Confusing mass and weight: Mass is in kg and does not change on Mars; weight is in Newtons and drops by 62% on Mars.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What is the net force acting on a 1,200 kg car cruising down a highway at a constant velocity of 100 km/h?',
        options: ['0 N', '12,000 N', '1,200 N', '120,000 N'],
        answer: '0 N',
        explanation: 'Constant velocity means acceleration is zero ($a = 0$). By $F_{net} = ma$, the net force must be exactly 0 N.'
      },
      {
        id: 'q2',
        question: 'A 5 kg block is accelerated by a net force of 20 N. What is its acceleration?',
        options: ['4 m/s²', '100 m/s²', '0.25 m/s²', '15 m/s²'],
        answer: '4 m/s²',
        explanation: 'Rearranging $F = ma \\implies a = \\frac{F}{m} = \\frac{20}{5} = 4 \\text{ m/s}^2$.'
      },
      {
        id: 'q3',
        question: 'According to Newton Third Law, what is the reaction force to the gravitational pull of the Earth on a falling apple?',
        options: [
          'The gravitational pull of the apple upward on the Earth',
          'Air resistance pushing up on the apple',
          'The normal force from the ground',
          'The weight of the apple'
        ],
        answer: 'The gravitational pull of the apple upward on the Earth',
        explanation: 'Newton third law pairs always act between the same two interacting bodies: Earth pulls apple down, so apple pulls Earth up with equal magnitude.'
      }
    ]
  },

  'Physics:Work energy and power': {
    id: 'Physics:Work energy and power',
    topic: 'Physics',
    subjectNum: 6,
    chapterNum: 3,
    title: 'Work energy and power',
    subtitle: 'Kinetic Energy, Potential Energy, Conservation of Energy, and Power',
    readTime: '8 min read',
    difficulty: 'Intermediate',
    overview: 'Energy is the universal currency of the cosmos. Whether running an engine, launching a satellite, or sliding down a ramp, the Law of Conservation of Energy allows us to solve complex physical problems with simple scalar equations.',
    theory: `### 1. Mechanical Work
In physics, **work ($W$)** is done on an object when a force causes a displacement along the direction of that force:
$$W = \\mathbf{F} \\cdot \\mathbf{d} = F d \\cos\\theta$$

Where:
- $F$ is the magnitude of the force ($N$)
- $d$ is displacement ($m$)
- $\\theta$ is the angle between force vector and displacement vector

Unit: **Joule ($J$)**: $1 \\text{ J} = 1 \\text{ N} \\cdot \\text{m} = 1 \\text{ kg}\\cdot\\text{m}^2/\\text{s}^2$.

### 2. Kinetic Energy ($KE$)
**Kinetic energy** is the energy possessed by an object due to its motion:
$$KE = \\frac{1}{2}mv^2$$

#### The Work-Energy Theorem
The net work done on an object equals its change in kinetic energy:
$$W_{net} = \\Delta KE = \\frac{1}{2}mv_f^2 - \\frac{1}{2}mv_i^2$$

### 3. Potential Energy ($PE$)
Potential energy is stored energy resulting from relative position or configuration.
- **Gravitational Potential Energy ($PE_g$)**:
  $$PE_g = mgh$$
  *(Where $h$ is vertical height above an arbitrary zero reference line)*
- **Elastic (Spring) Potential Energy ($PE_s$)**:
  $$PE_s = \\frac{1}{2}kx^2$$

### 4. Conservation of Mechanical Energy
In an isolated system where only conservative forces (like gravity and ideal springs) do work, total mechanical energy ($E = KE + PE$) remains strictly constant:
$$KE_i + PE_i = KE_f + PE_f$$
$$\\frac{1}{2}mv_i^2 + mgh_i = \\frac{1}{2}mv_f^2 + mgh_f$$

### 5. Power
**Power ($P$)** is the rate at which work is done or energy is transferred:
$$P = \\frac{W}{\\Delta t} = \\frac{\\Delta E}{\\Delta t} = F v$$

Unit: **Watt ($W$)**: $1 \\text{ W} = 1 \\text{ J/s}$. (1 Horsepower $\\approx 746 \\text{ W}$).`,
    definitions: [
      {
        term: 'Joule (J)',
        symbol: '1 \\text{ J} = 1 \\text{ N}\\cdot\\text{m}',
        meaning: 'The SI unit of work and energy.',
        example: 'Lifting a 100 g apple vertically by 1 meter requires approximately 1 Joule of work.'
      },
      {
        term: 'Kinetic Energy',
        symbol: 'KE = \\frac{1}{2}mv^2',
        meaning: 'Energy an object has by virtue of its speed and mass.',
        example: 'Doubling your car speed quadruples its kinetic energy ($2^2 = 4$).'
      },
      {
        term: 'Power',
        symbol: 'P = \\frac{W}{t}',
        meaning: 'The rate at which work is performed or energy converted per second.',
        example: 'A 60 Watt light bulb transforms 60 Joules of electrical energy into light and heat every second.'
      }
    ],
    keyFormulas: [
      {
        name: 'Work Done by Constant Force',
        formula: 'W = F d \\cos\\theta',
        note: 'Work is zero if force is perpendicular to displacement ($\\cos 90^\\circ = 0$).'
      },
      {
        name: 'Conservation of Mechanical Energy',
        formula: 'E_{total} = KE + PE = \\text{constant}',
        note: 'Valid in the absence of non-conservative forces like friction and drag.'
      },
      {
        name: 'Electric / Mechanical Power',
        formula: 'P = \\frac{\\Delta W}{\\Delta t} = F v',
        note: 'Useful for vehicles moving at constant speed against resistive drag.'
      }
    ],
    workedExamples: [
      {
        problem: 'A 600 kg roller coaster cart starts from rest at the top of a 45 m high hill. Neglecting friction, what is its speed at the bottom of the hill?',
        difficulty: 'Intermediate',
        steps: [
          'Choose the bottom of the hill as zero height: $h_f = 0$, $h_i = 45 \\text{ m}$.',
          'Identify initial energy: cart starts from rest, so $KE_i = 0$, $PE_i = mgh_i$.',
          'Identify final energy: at bottom, $PE_f = 0$, $KE_f = \\frac{1}{2}mv_f^2$.',
          'Apply conservation of energy: $mgh_i = \\frac{1}{2}mv_f^2$.',
          'Notice mass $m$ cancels out: $v_f = \\sqrt{2gh_i} = \\sqrt{2(9.8)(45)} = \\sqrt{882} \\approx 29.7 \\text{ m/s}$ (over 106 km/h!).'
        ],
        finalAnswer: '$29.7 \\text{ m/s}$ (approx. $107 \\text{ km/h}$)',
        proTip: 'Notice that the mass of the cart canceled out entirely! All coaster carts reach the same speed regardless of passenger weight.'
      }
    ],
    pitfalls: [
      'Carrying a heavy backpack while walking horizontally does NO work on the backpack: because gravity/support force is upward ($90^\\circ$ to horizontal displacement), $\\cos 90^\\circ = 0$.',
      'Thinking doubling speed doubles stopping distance: since $KE \\propto v^2$, doubling speed quadruples braking distance!'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'If a runner speed triples from 2 m/s to 6 m/s, by what factor does her kinetic energy increase?',
        options: ['9 times', '3 times', '6 times', '27 times'],
        answer: '9 times',
        explanation: 'Kinetic energy depends on velocity squared ($v^2$). Tripling velocity yields $(3)^2 = 9$ times the kinetic energy.'
      },
      {
        id: 'q2',
        question: 'An electric motor lifts a 200 kg load vertically by 15 meters in 10 seconds. What average power was delivered? (Take $g = 9.8 \\text{ m/s}^2$)',
        options: ['2,940 W', '29,400 W', '294 W', '1,500 W'],
        answer: '2,940 W',
        explanation: 'Work done $W = mgh = 200 \\times 9.8 \\times 15 = 29,400 \\text{ J}$. Power $P = \\frac{W}{t} = \\frac{29,400}{10} = 2,940 \\text{ W}$.'
      },
      {
        id: 'q3',
        question: 'A student pushes against a stationary brick wall with a force of 150 N for 10 minutes. How much mechanical work was done on the wall?',
        options: ['0 Joules', '1,500 Joules', '15,000 Joules', '90,000 Joules'],
        answer: '0 Joules',
        explanation: 'Since the wall did not move ($d = 0$), $W = F \\times d = 150 \\times 0 = 0 \\text{ J}$. No mechanical work was performed.'
      }
    ]
  },

  'Physics:Waves sound and light': {
    id: 'Physics:Waves sound and light',
    topic: 'Physics',
    subjectNum: 6,
    chapterNum: 4,
    title: 'Waves sound and light',
    subtitle: 'Wave Properties, Speed of Sound, Doppler Effect, and Optics',
    readTime: '8 min read',
    difficulty: 'Advanced',
    overview: 'From the music in our headphones to the light from distant galaxies, waves are nature mechanism for transmitting energy without transporting matter across space.',
    theory: `### 1. Anatomy of a Wave
A **wave** is a rhythmic disturbance that propagates through space or a medium, carrying energy from one point to another.

#### Fundamental Wave Parameters
- **Wavelength ($\\lambda$)**: The spatial distance between consecutive crests (meters).
- **Frequency ($f$)**: Number of complete cycles passing a point per second, measured in **Hertz ($Hz$)**: $1 \\text{ Hz} = 1 \\text{ s}^{-1}$.
- **Period ($T$)**: The time taken for one full cycle: $T = \\frac{1}{f}$.
- **Amplitude ($A$)**: The maximum displacement from equilibrium (relates to wave energy and loudness/brightness).

### 2. The Universal Wave Equation
For all periodic waves:
$$v = f \\lambda$$

### 3. Wave Classifications
- **Transverse Waves**: Particle displacement is perpendicular to wave propagation (e.g. electromagnetic waves, light, guitar strings).
- **Longitudinal Waves**: Particle displacement is parallel to wave propagation (e.g. sound waves, seismic P-waves).

### 4. The Doppler Effect
When a wave source moves relative to an observer, the observed frequency shifts:
- Moving closer: observed frequency increases (higher musical pitch, blue-shift in astronomy).
- Moving away: observed frequency decreases (lower pitch, red-shift).

### 5. Optics: Reflection and Refraction
When light travels across the boundary between two transparent media with different refractive indices ($n_1$ and $n_2$):
- **Law of Reflection**: Angle of incidence equals angle of reflection: $\\theta_i = \\theta_r$.
- **Snell Law of Refraction**:
  $$n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2$$
  *(Where refractive index $n = \\frac{c}{v}$ compares light speed in vacuum to the medium)*`,
    definitions: [
      {
        term: 'Wavelength',
        symbol: '\\lambda \\text{ (lambda)}',
        meaning: 'The spatial length of one complete wave cycle measured between two identical points.',
        example: 'Visible red light has a wavelength of approx. 700 nanometers ($700 \\times 10^{-9}$ m).'
      },
      {
        term: 'Index of Refraction',
        symbol: 'n = \\frac{c}{v}',
        meaning: 'Ratio of the speed of light in vacuum ($c \\approx 3 \\times 10^8$ m/s) to its speed in a given medium.',
        example: 'For water $n \\approx 1.33$; for diamond $n \\approx 2.42$, which causes its brilliant sparkle.'
      }
    ],
    keyFormulas: [
      {
        name: 'The Wave Equation',
        formula: 'v = f \\lambda',
        note: 'Wave speed equals frequency multiplied by wavelength.'
      },
      {
        name: 'Snell Law',
        formula: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2',
        note: 'Predicts the bending of light rays as they enter a new optical medium.'
      }
    ],
    workedExamples: [
      {
        problem: 'A yellow light beam of frequency $5.0 \\times 10^{14} \\text{ Hz}$ travels in vacuum at $c = 3.0 \\times 10^8 \\text{ m/s}$. Find its wavelength in vacuum.',
        difficulty: 'Beginner',
        steps: [
          'State the wave equation: $v = f\\lambda \\implies \\lambda = \\frac{v}{f}$.',
          'Substitute: $\\lambda = \\frac{3.0 \\times 10^8}{5.0 \\times 10^{14}} = 0.6 \\times 10^{-6} \\text{ m} = 600 \\text{ nm}$.'
        ],
        finalAnswer: '$600 \\text{ nm}$ ($6.0 \\times 10^{-7} \\text{ m}$)',
        proTip: 'Light frequencies stay constant when transitioning between media; only wavelength and speed change!'
      }
    ],
    pitfalls: [
      'Assuming sound can travel through outer space: Sound requires a mechanical medium (air, liquid, or solid). In a space vacuum, sound cannot propagate.',
      'Thinking waves move particles permanently: A buoy bobbing in the ocean moves up and down as waves pass, but is not transported forward with the wave.'
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A sound wave has a frequency of 440 Hz (concert pitch A) and travels in air at 330 m/s. What is its wavelength?',
        options: ['0.75 m', '1.33 m', '145,200 m', '7.5 m'],
        answer: '0.75 m',
        explanation: 'Using $\\lambda = \\frac{v}{f} = \\frac{330}{440} = \\frac{3}{4} = 0.75 \\text{ m}$.'
      },
      {
        id: 'q2',
        question: 'Why does an ambulance siren sound higher in pitch as it speeds toward you?',
        options: [
          'The sound waves are compressed, increasing their observed frequency (Doppler effect)',
          'The siren speakers become louder as they approach',
          'The speed of sound increases due to vehicle speed',
          'The wavelength expands in front of the vehicle'
        ],
        answer: 'The sound waves are compressed, increasing their observed frequency (Doppler effect)',
        explanation: 'The forward motion of the ambulance compresses successive wave crests closer together, shortening the wavelength and raising the observed frequency/pitch.'
      },
      {
        id: 'q3',
        question: 'Which of the following is an example of a transverse wave?',
        options: ['Visible light wave', 'Sound wave in air', 'Ultrasound medical pulse', 'Seismic compression P-wave'],
        answer: 'Visible light wave',
        explanation: 'Light is an electromagnetic wave where electric and magnetic fields oscillate perpendicular to the propagation vector, characteristic of transverse waves.'
      }
    ]
  }
};
