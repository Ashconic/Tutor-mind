import React, { useState } from 'react';
import { Box, Paper, Typography, Stack, Chip, Button, Tooltip } from '@mui/material';
import { AutoAwesome, InfoOutlined, ZoomIn } from '@mui/icons-material';

/**
 * ChapterDiagram renders high-definition, textbook-grade vector diagrams
 * tailored for each specific chapter in TutorMind.
 */
export default function ChapterDiagram({ chapterId, topic, title }) {
  const [activeStep, setActiveStep] = useState(0);

  // Normalize lookup key
  const key = (chapterId || `${topic}:${title}` || '').toLowerCase();

  const renderDiagramContent = () => {
    // -------------------------------------------------------------------------
    // ALGEBRA DIAGRAMS
    // -------------------------------------------------------------------------
    if (key.includes('foundations of variables') || key.includes('foundations')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          <defs>
            <linearGradient id="algGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ec735e" stopOpacity="0.15" />
              <stop offset="1%" stopColor="#ec735e" stopOpacity="0.05" />
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec735e" />
            </marker>
          </defs>

          {/* Background Card */}
          <rect x="15" y="15" width="510" height="190" rx="12" fill="url(#algGrad)" stroke="#eed5cf" strokeWidth="1.5" />

          {/* Algebraic Expression: 7x^2 - 4x + 9 */}
          <text x="270" y="85" textAnchor="middle" fontFamily="serif" fontSize="38" fontWeight="bold" fill="#20211f">
            <tspan fill="#ec735e">7</tspan>
            <tspan fill="#20211f">x</tspan>
            <tspan dy="-16" fontSize="22" fill="#5e62d6">2</tspan>
            <tspan dy="16" fill="#888"> − </tspan>
            <tspan fill="#ec735e">4</tspan>
            <tspan fill="#20211f">x</tspan>
            <tspan fill="#888"> + </tspan>
            <tspan fill="#2e7d32">9</tspan>
          </text>

          {/* Pointers and Labels */}
          {/* Exponent Pointer */}
          <path d="M 235 55 L 235 35 L 270 35" stroke="#5e62d6" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
          <rect x="275" y="24" width="85" height="22" rx="4" fill="#eeeffb" stroke="#5e62d6" strokeWidth="1" />
          <text x="317" y="39" textAnchor="middle" fontSize="11" fontFamily="DM Mono, monospace" fontWeight="700" fill="#5e62d6">
            EXPONENT
          </text>

          {/* Coefficient Pointer */}
          <path d="M 180 100 L 180 145" stroke="#ec735e" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
          <rect x="130" y="148" width="100" height="24" rx="4" fill="#fae8e2" stroke="#ec735e" strokeWidth="1" />
          <text x="180" y="164" textAnchor="middle" fontSize="11" fontFamily="DM Mono, monospace" fontWeight="700" fill="#ec735e">
            COEFFICIENT (7)
          </text>

          {/* Variable Pointer */}
          <path d="M 205 100 L 205 125 L 255 125 L 255 145" stroke="#20211f" strokeWidth="1.5" fill="none" />
          <rect x="235" y="148" width="90" height="24" rx="4" fill="#f1ede7" stroke="#bbb" strokeWidth="1" />
          <text x="280" y="164" textAnchor="middle" fontSize="11" fontFamily="DM Mono, monospace" fontWeight="700" fill="#333">
            VARIABLE (x)
          </text>

          {/* Constant Pointer */}
          <path d="M 360 100 L 360 145" stroke="#2e7d32" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
          <rect x="330" y="148" width="95" height="24" rx="4" fill="#e8f4ea" stroke="#2e7d32" strokeWidth="1" />
          <text x="377" y="164" textAnchor="middle" fontSize="11" fontFamily="DM Mono, monospace" fontWeight="700" fill="#2e7d32">
            CONSTANT (+9)
          </text>
        </svg>
      );
    }

    if (key.includes('expressions and simplification') || key.includes('simplification')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Distributive Area Model 3(x + 4) = 3x + 12 */}
          <rect x="40" y="30" width="460" height="160" rx="10" fill="#faf6ee" stroke="#e8dec8" strokeWidth="1.5" />

          {/* Side dimension: 3 */}
          <rect x="120" y="60" width="160" height="100" fill="#fae8e2" stroke="#ec735e" strokeWidth="2" rx="4" />
          <rect x="280" y="60" width="140" height="100" fill="#e8f4ea" stroke="#2e7d32" strokeWidth="2" rx="4" />

          <text x="100" y="115" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#ec735e">3</text>
          <text x="200" y="50" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#ec735e">x</text>
          <text x="350" y="50" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#2e7d32">4</text>

          <text x="200" y="115" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#d95f4c">Area = 3x</text>
          <text x="350" y="115" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1b5e20">Area = 12</text>

          <text x="270" y="185" textAnchor="middle" fontSize="14" fontWeight="bold" fontFamily="DM Mono, monospace" fill="#333">
            Total Area = 3(x + 4) = 3x + 12
          </text>
        </svg>
      );
    }

    if (key.includes('linear equations')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Balance Scale Model for 2x + 4 = 14 */}
          {/* Fulcrum and Base */}
          <polygon points="270,165 250,195 290,195" fill="#555" stroke="#222" strokeWidth="1.5" />
          <line x1="180" y1="195" x2="360" y2="195" stroke="#222" strokeWidth="4" strokeLinecap="round" />

          {/* Beam */}
          <line x1="100" y1="110" x2="440" y2="110" stroke="#20211f" strokeWidth="5" strokeLinecap="round" />
          <circle cx="270" cy="110" r="7" fill="#ec735e" />

          {/* Left Pan Strings & Tray */}
          <line x1="100" y1="110" x2="60" y2="155" stroke="#999" strokeWidth="1.5" />
          <line x1="100" y1="110" x2="140" y2="155" stroke="#999" strokeWidth="1.5" />
          <path d="M 50 155 Q 100 165 150 155" stroke="#ec735e" strokeWidth="4" fill="none" />

          {/* Left Contents (2x + 4) */}
          <rect x="70" y="130" width="26" height="24" rx="4" fill="#fae8e2" stroke="#ec735e" strokeWidth="1.5" />
          <text x="83" y="146" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ec735e">x</text>
          <rect x="102" y="130" width="26" height="24" rx="4" fill="#fae8e2" stroke="#ec735e" strokeWidth="1.5" />
          <text x="115" y="146" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ec735e">x</text>
          <circle cx="90" cy="118" r="8" fill="#e0dbce" stroke="#777" strokeWidth="1" />
          <text x="90" y="122" textAnchor="middle" fontSize="10" fontWeight="bold">+4</text>

          {/* Right Pan Strings & Tray */}
          <line x1="440" y1="110" x2="400" y2="155" stroke="#999" strokeWidth="1.5" />
          <line x1="440" y1="110" x2="480" y2="155" stroke="#999" strokeWidth="1.5" />
          <path d="M 390 155 Q 440 165 490 155" stroke="#2e7d32" strokeWidth="4" fill="none" />

          {/* Right Contents (14) */}
          <circle cx="440" cy="138" r="16" fill="#e8f4ea" stroke="#2e7d32" strokeWidth="2" />
          <text x="440" y="144" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2e7d32">14</text>

          {/* Status Label */}
          <rect x="190" y="30" width="160" height="32" rx="6" fill="#ffffff" stroke="#ec735e" strokeWidth="1.5" />
          <text x="270" y="51" textAnchor="middle" fontSize="14" fontFamily="DM Mono, monospace" fontWeight="bold" fill="#20211f">
            2x + 4 = 14
          </text>
          <text x="270" y="80" textAnchor="middle" fontSize="11" fill="#777">
            Subtract 4 from both sides → 2x = 10 → x = 5
          </text>
        </svg>
      );
    }

    if (key.includes('quadratic equations')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Parabola with Vertex, Axis of Symmetry, and Roots */}
          {/* Axes */}
          <line x1="50" y1="150" x2="490" y2="150" stroke="#aaa" strokeWidth="1.5" />
          <line x1="200" y1="20" x2="200" y2="200" stroke="#aaa" strokeWidth="1.5" />
          <text x="485" y="142" fontSize="12" fill="#888">x</text>
          <text x="210" y="30" fontSize="12" fill="#888">y</text>

          {/* Parabola Curve y = (x-2)^2 - 1 => roots at x=1, x=3, vertex at (2,-1) */}
          {/* Scale: center x=200 is 0. 1 unit = 50px. x=1 -> 250, x=2 -> 300, x=3 -> 350. y=0 is y=150. y=-1 is y=180. */}
          <path d="M 210 50 Q 300 230 390 50" stroke="#ec735e" strokeWidth="3" fill="none" />

          {/* Axis of Symmetry */}
          <line x1="300" y1="35" x2="300" y2="195" stroke="#5e62d6" strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="305" y="45" fontSize="10" fontFamily="DM Mono, monospace" fill="#5e62d6">x = 2 (Axis)</text>

          {/* Roots */}
          <circle cx="255" cy="150" r="5" fill="#2e7d32" />
          <text x="255" y="140" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2e7d32">Root (x=1)</text>

          <circle cx="345" cy="150" r="5" fill="#2e7d32" />
          <text x="345" y="140" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2e7d32">Root (x=3)</text>

          {/* Vertex */}
          <circle cx="300" cy="180" r="5" fill="#ec735e" />
          <text x="300" y="200" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ec735e">Vertex (2, −1)</text>

          {/* Formula Card */}
          <rect x="360" y="25" width="160" height="40" rx="6" fill="#fff" stroke="#ded9ce" />
          <text x="440" y="45" textAnchor="middle" fontSize="12" fontWeight="bold" fontFamily="DM Mono, monospace" fill="#20211f">
            y = ax² + bx + c
          </text>
          <text x="440" y="58" textAnchor="middle" fontSize="9" fill="#888">
            Vertex: x = -b / (2a)
          </text>
        </svg>
      );
    }

    if (key.includes('inequalities')) {
      return (
        <svg viewBox="0 0 540 200" width="100%" height="100%" style={{ maxHeight: 220 }}>
          {/* Number Lines comparing Open Circle vs Closed Circle */}
          {/* Line 1: x > 2 (Open circle) */}
          <text x="50" y="45" fontSize="13" fontWeight="bold" fontFamily="DM Mono, monospace" fill="#ec735e">
            x &gt; 2 (Strict Inequality)
          </text>
          <line x1="50" y1="75" x2="490" y2="75" stroke="#999" strokeWidth="2" />
          {/* Ticks */}
          {[0, 1, 2, 3, 4, 5].map((val) => (
            <g key={`t1-${val}`}>
              <line x1={100 + val * 65} y1="70" x2={100 + val * 65} y2="80" stroke="#666" strokeWidth="1.5" />
              <text x={100 + val * 65} y="95" textAnchor="middle" fontSize="11" fill="#666">{val}</text>
            </g>
          ))}
          {/* Shaded Ray */}
          <line x1="230" y1="75" x2="490" y2="75" stroke="#ec735e" strokeWidth="5" strokeLinecap="round" />
          <circle cx="230" cy="75" r="6" fill="#fff" stroke="#ec735e" strokeWidth="3" />
          <text x="230" y="60" textAnchor="middle" fontSize="10" fill="#ec735e" fontWeight="bold">Open (not included)</text>

          {/* Line 2: x <= 3 (Closed circle) */}
          <text x="50" y="135" fontSize="13" fontWeight="bold" fontFamily="DM Mono, monospace" fill="#2e7d32">
            x ≤ 3 (Inclusive Inequality)
          </text>
          <line x1="50" y1="165" x2="490" y2="165" stroke="#999" strokeWidth="2" />
          {[0, 1, 2, 3, 4, 5].map((val) => (
            <g key={`t2-${val}`}>
              <line x1={100 + val * 65} y1="160" x2={100 + val * 65} y2="170" stroke="#666" strokeWidth="1.5" />
              <text x={100 + val * 65} y="185" textAnchor="middle" fontSize="11" fill="#666">{val}</text>
            </g>
          ))}
          {/* Shaded Ray */}
          <line x1="50" y1="165" x2="295" y2="165" stroke="#2e7d32" strokeWidth="5" strokeLinecap="round" />
          <circle cx="295" cy="165" r="6" fill="#2e7d32" stroke="#2e7d32" strokeWidth="2" />
          <text x="295" y="150" textAnchor="middle" fontSize="10" fill="#2e7d32" fontWeight="bold">Solid (included)</text>
        </svg>
      );
    }

    // -------------------------------------------------------------------------
    // GEOMETRY DIAGRAMS
    // -------------------------------------------------------------------------
    if (key.includes('shapes and their properties') || key.includes('shapes')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Shapes Comparison: Equilateral Triangle, Right Triangle, Regular Pentagon */}
          {/* Triangle 1 */}
          <polygon points="90,45 45,135 135,135" fill="#fef7e7" stroke="#f6c857" strokeWidth="2.5" />
          <text x="90" y="155" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#333">Equilateral △</text>
          <text x="90" y="170" textAnchor="middle" fontSize="9" fill="#777">3 equal sides · 60°</text>

          {/* Right Triangle */}
          <polygon points="200,45 200,135 290,135" fill="#fae8e2" stroke="#ec735e" strokeWidth="2.5" />
          <rect x="200" y="123" width="12" height="12" fill="none" stroke="#ec735e" strokeWidth="1.5" />
          <text x="245" y="155" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#333">Right △</text>
          <text x="245" y="170" textAnchor="middle" fontSize="9" fill="#777">a² + b² = c²</text>

          {/* Parallelogram */}
          <polygon points="360,50 470,50 440,135 330,135" fill="#eef6ef" stroke="#84b98a" strokeWidth="2.5" />
          <text x="400" y="155" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#333">Parallelogram</text>
          <text x="400" y="170" textAnchor="middle" fontSize="9" fill="#777">Opposite sides ∥ &amp; equal</text>
        </svg>
      );
    }

    if (key.includes('angles')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Angles: Acute, Right, Obtuse, Supplementary */}
          {/* 1. Acute Angle (< 90) */}
          <line x1="50" y1="140" x2="130" y2="140" stroke="#333" strokeWidth="2" />
          <line x1="50" y1="140" x2="110" y2="70" stroke="#ec735e" strokeWidth="2.5" />
          <path d="M 80 140 A 30 30 0 0 0 74 112" fill="none" stroke="#ec735e" strokeWidth="2" />
          <text x="90" y="165" textAnchor="middle" fontSize="11" fontWeight="bold">Acute Angle</text>
          <text x="90" y="180" textAnchor="middle" fontSize="9" fill="#777">0° &lt; θ &lt; 90°</text>

          {/* 2. Right Angle (= 90) */}
          <line x1="180" y1="140" x2="260" y2="140" stroke="#333" strokeWidth="2" />
          <line x1="180" y1="140" x2="180" y2="60" stroke="#5e62d6" strokeWidth="2.5" />
          <rect x="180" y="125" width="15" height="15" fill="none" stroke="#5e62d6" strokeWidth="2" />
          <text x="220" y="165" textAnchor="middle" fontSize="11" fontWeight="bold">Right Angle</text>
          <text x="220" y="180" textAnchor="middle" fontSize="9" fill="#777">Exactly 90°</text>

          {/* 3. Obtuse Angle (> 90) */}
          <line x1="330" y1="140" x2="410" y2="140" stroke="#333" strokeWidth="2" />
          <line x1="330" y1="140" x2="280" y2="75" stroke="#d97706" strokeWidth="2.5" />
          <path d="M 360 140 A 30 30 0 0 0 305 107" fill="none" stroke="#d97706" strokeWidth="2" />
          <text x="345" y="165" textAnchor="middle" fontSize="11" fontWeight="bold">Obtuse Angle</text>
          <text x="345" y="180" textAnchor="middle" fontSize="9" fill="#777">90° &lt; θ &lt; 180°</text>

          {/* 4. Supplementary on line */}
          <line x1="430" y1="140" x2="520" y2="140" stroke="#333" strokeWidth="2" />
          <line x1="475" y1="140" x2="455" y2="75" stroke="#2e7d32" strokeWidth="2" />
          <text x="475" y="165" textAnchor="middle" fontSize="11" fontWeight="bold">Supplementary</text>
          <text x="475" y="180" textAnchor="middle" fontSize="9" fill="#777">a + b = 180°</text>
        </svg>
      );
    }

    if (key.includes('area and perimeter')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Rectangle and Triangle with Formulas */}
          {/* Rectangle */}
          <rect x="50" y="45" width="180" height="110" fill="#fae8e2" stroke="#ec735e" strokeWidth="2.5" rx="4" />
          <text x="140" y="35" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ec735e">Length (l = 8)</text>
          <text x="30" y="105" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ec735e">w = 5</text>
          <text x="140" y="95" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#20211f">Area = l × w = 40</text>
          <text x="140" y="120" textAnchor="middle" fontSize="12" fill="#666">Perimeter = 2(l + w) = 26</text>

          {/* Triangle with altitude */}
          <polygon points="380,45 300,155 460,155" fill="#fef7e7" stroke="#f6c857" strokeWidth="2.5" />
          <line x1="380" y1="45" x2="380" y2="155" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
          <rect x="380" y="143" width="12" height="12" fill="none" stroke="#d97706" strokeWidth="1.5" />
          <text x="395" y="105" fontSize="12" fontWeight="bold" fill="#d97706">h</text>
          <text x="380" y="175" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#20211f">Base (b)</text>
          <text x="380" y="195" textAnchor="middle" fontSize="12" fontFamily="DM Mono, monospace" fill="#d97706">
            Area = ½ × b × h
          </text>
        </svg>
      );
    }

    if (key.includes('volume')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Isometric Cylinder & Prism */}
          {/* Cylinder */}
          <ellipse cx="140" cy="65" rx="60" ry="20" fill="#fef7e7" stroke="#f6c857" strokeWidth="2" />
          <line x1="80" y1="65" x2="80" y2="145" stroke="#f6c857" strokeWidth="2" />
          <line x1="200" y1="65" x2="200" y2="145" stroke="#f6c857" strokeWidth="2" />
          <path d="M 80 145 A 60 20 0 0 0 200 145" fill="#fef7e7" stroke="#f6c857" strokeWidth="2" />
          <line x1="140" y1="65" x2="200" y2="65" stroke="#d97706" strokeWidth="2" />
          <text x="170" y="58" fontSize="11" fontWeight="bold" fill="#d97706">r</text>
          <text x="215" y="110" fontSize="11" fontWeight="bold" fill="#f6c857">h</text>
          <text x="140" y="185" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="DM Mono, monospace" fill="#333">
            Cylinder: V = πr²h
          </text>

          {/* 3D Rectangular Prism */}
          <polygon points="340,90 420,90 420,155 340,155" fill="#fae8e2" stroke="#ec735e" strokeWidth="2" />
          <polygon points="340,90 380,50 460,50 420,90" fill="#fceee9" stroke="#ec735e" strokeWidth="2" />
          <polygon points="420,90 460,50 460,115 420,155" fill="#fae8e2" stroke="#ec735e" strokeWidth="2" />
          <text x="380" y="172" textAnchor="middle" fontSize="11" fill="#ec735e">length (l)</text>
          <text x="445" y="140" fontSize="11" fill="#ec735e">width (w)</text>
          <text x="325" y="125" fontSize="11" fill="#ec735e">height (h)</text>
          <text x="400" y="195" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="DM Mono, monospace" fill="#333">
            Prism: V = l × w × h
          </text>
        </svg>
      );
    }

    if (key.includes('trigonometry')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Right Triangle with SOH CAH TOA */}
          <polygon points="120,40 120,170 340,170" fill="#f4f1fa" stroke="#c7b9e9" strokeWidth="3" />
          <rect x="120" y="152" width="18" height="18" fill="none" stroke="#7c69ad" strokeWidth="1.5" />

          {/* Angle theta */}
          <path d="M 300 170 A 40 40 0 0 0 315 152" fill="none" stroke="#ec735e" strokeWidth="2.5" />
          <text x="290" y="162" fontSize="16" fontWeight="bold" fill="#ec735e">θ</text>

          {/* Side Labels */}
          <text x="80" y="110" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#5e62d6">Opposite (b)</text>
          <text x="230" y="190" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#2e7d32">Adjacent (a)</text>
          <text x="245" y="95" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ec735e" transform="rotate(-30 245 95)">
            Hypotenuse (c)
          </text>

          {/* Trig Ratios Card */}
          <rect x="375" y="35" width="145" height="145" rx="8" fill="#fff" stroke="#ded9cd" strokeWidth="1.5" />
          <text x="447" y="60" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ec735e">SOH CAH TOA</text>
          <text x="390" y="90" fontSize="12" fontFamily="DM Mono, monospace" fill="#333">sin θ = Opp / Hyp</text>
          <text x="390" y="120" fontSize="12" fontFamily="DM Mono, monospace" fill="#333">cos θ = Adj / Hyp</text>
          <text x="390" y="150" fontSize="12" fontFamily="DM Mono, monospace" fill="#333">tan θ = Opp / Adj</text>
        </svg>
      );
    }

    // -------------------------------------------------------------------------
    // CALCULUS DIAGRAMS
    // -------------------------------------------------------------------------
    if (key.includes('limits')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Function Curve Approaching Hole as x -> c */}
          <line x1="50" y1="170" x2="490" y2="170" stroke="#aaa" strokeWidth="1.5" />
          <line x1="120" y1="30" x2="120" y2="190" stroke="#aaa" strokeWidth="1.5" />
          <text x="485" y="162" fontSize="12" fill="#888">x</text>
          <text x="130" y="40" fontSize="12" fill="#888">y</text>

          {/* Curve */}
          <path d="M 120 160 Q 250 140 290 90" stroke="#c7b9e9" strokeWidth="3" fill="none" />
          <path d="M 310 70 Q 360 40 460 30" stroke="#c7b9e9" strokeWidth="3" fill="none" />

          {/* Hole at (300, 80) */}
          <circle cx="300" cy="80" r="6" fill="#fff" stroke="#ec735e" strokeWidth="3" />

          {/* Dashed projections */}
          <line x1="300" y1="86" x2="300" y2="170" stroke="#888" strokeDasharray="3 3" />
          <line x1="120" y1="80" x2="294" y2="80" stroke="#888" strokeDasharray="3 3" />

          <text x="300" y="188" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ec735e">c</text>
          <text x="105" y="85" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ec735e">L</text>

          {/* Arrows approaching from left and right */}
          <text x="250" y="165" fontSize="12" fill="#5e62d6">x → c⁻ →</text>
          <text x="330" y="165" fontSize="12" fill="#2e7d32">← x → c⁺</text>

          <rect x="330" y="40" width="180" height="40" rx="6" fill="#fff" stroke="#c7b9e9" />
          <text x="420" y="65" textAnchor="middle" fontSize="13" fontFamily="DM Mono, monospace" fontWeight="bold" fill="#333">
            lim f(x) = L as x → c
          </text>
        </svg>
      );
    }

    if (key.includes('derivatives')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Curve with Secant converging to Tangent Line */}
          <line x1="50" y1="180" x2="490" y2="180" stroke="#aaa" strokeWidth="1.5" />
          <line x1="100" y1="20" x2="100" y2="190" stroke="#aaa" strokeWidth="1.5" />

          {/* Curve */}
          <path d="M 120 170 Q 240 160 380 40" stroke="#20211f" strokeWidth="2.5" fill="none" />

          {/* Tangent Line at x=260 */}
          <line x1="160" y1="180" x2="360" y2="60" stroke="#ec735e" strokeWidth="2.5" />
          <circle cx="260" cy="120" r="5" fill="#ec735e" />
          <text x="280" y="130" fontSize="11" fontWeight="bold" fill="#ec735e">P(x, f(x))</text>

          {/* Slope Triangle */}
          <polygon points="260,120 310,120 310,90" fill="#fae8e2" stroke="#ec735e" strokeWidth="1" />
          <text x="285" y="135" fontSize="10" fill="#ec735e">dx</text>
          <text x="320" y="108" fontSize="10" fill="#ec735e">dy</text>

          <rect x="360" y="30" width="160" height="50" rx="6" fill="#fff" stroke="#ec735e" />
          <text x="440" y="52" textAnchor="middle" fontSize="13" fontFamily="DM Mono, monospace" fontWeight="bold" fill="#ec735e">
            f'(x) = dy / dx
          </text>
          <text x="440" y="70" textAnchor="middle" fontSize="10" fill="#666">
            Instantaneous Rate of Change
          </text>
        </svg>
      );
    }

    if (key.includes('integrals')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Riemann Sum under curve */}
          <line x1="50" y1="180" x2="490" y2="180" stroke="#aaa" strokeWidth="1.5" />
          <line x1="90" y1="30" x2="90" y2="190" stroke="#aaa" strokeWidth="1.5" />

          {/* Riemann Rectangles */}
          <rect x="150" y="140" width="40" height="40" fill="#eef6ef" stroke="#84b98a" strokeWidth="1.5" />
          <rect x="190" y="110" width="40" height="70" fill="#eef6ef" stroke="#84b98a" strokeWidth="1.5" />
          <rect x="230" y="85" width="40" height="95" fill="#eef6ef" stroke="#84b98a" strokeWidth="1.5" />
          <rect x="270" y="70" width="40" height="110" fill="#eef6ef" stroke="#84b98a" strokeWidth="1.5" />
          <rect x="310" y="65" width="40" height="115" fill="#eef6ef" stroke="#84b98a" strokeWidth="1.5" />
          <rect x="350" y="75" width="40" height="105" fill="#eef6ef" stroke="#84b98a" strokeWidth="1.5" />

          {/* Smooth Curve */}
          <path d="M 120 165 Q 280 40 430 110" stroke="#2e7d32" strokeWidth="3" fill="none" />

          <text x="150" y="196" textAnchor="middle" fontSize="12" fontWeight="bold">a</text>
          <text x="390" y="196" textAnchor="middle" fontSize="12" fontWeight="bold">b</text>

          <rect x="250" y="20" width="220" height="36" rx="6" fill="#fff" stroke="#84b98a" />
          <text x="360" y="44" textAnchor="middle" fontSize="14" fontFamily="serif" fontWeight="bold" fill="#2e7d32">
            Area = ∫ₐᵇ f(x) dx
          </text>
        </svg>
      );
    }

    if (key.includes('differential equations')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Slope field segments with solution curve */}
          <line x1="60" y1="110" x2="480" y2="110" stroke="#aaa" strokeWidth="1.5" />
          <line x1="270" y1="20" x2="270" y2="200" stroke="#aaa" strokeWidth="1.5" />

          {/* Grid of slope vectors */}
          {[120, 180, 240, 300, 360, 420].map((x) =>
            [50, 90, 130, 170].map((y) => {
              const slope = (x - 270) * 0.003;
              const dx = 12;
              const dy = slope * 12;
              return (
                <line
                  key={`slope-${x}-${y}`}
                  x1={x - dx}
                  y1={y - dy}
                  x2={x + dx}
                  y2={y + dy}
                  stroke="#c7b9e9"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })
          )}

          {/* Solution Curve y = C e^x */}
          <path d="M 100 160 Q 270 140 430 40" stroke="#ec735e" strokeWidth="3" fill="none" />
          <text x="435" y="35" fontSize="11" fontWeight="bold" fill="#ec735e">y(t) Solution Curve</text>

          <rect x="70" y="25" width="180" height="34" rx="6" fill="#fff" stroke="#c7b9e9" />
          <text x="160" y="47" textAnchor="middle" fontSize="12" fontFamily="DM Mono, monospace" fontWeight="bold" fill="#5e62d6">
            dy/dt = k · y(t)
          </text>
        </svg>
      );
    }

    // -------------------------------------------------------------------------
    // STATISTICS DIAGRAMS
    // -------------------------------------------------------------------------
    if (key.includes('mean, median') || key.includes('mean') || key.includes('median')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Skewed curve with Mode, Median, Mean marked */}
          <line x1="50" y1="170" x2="490" y2="170" stroke="#aaa" strokeWidth="1.5" />

          {/* Positively Skewed Curve */}
          <path d="M 60 170 Q 150 20 230 110 T 480 170" fill="#f8fdf9" stroke="#84b98a" strokeWidth="3" />

          {/* Mode Line (Peak) */}
          <line x1="160" y1="45" x2="160" y2="170" stroke="#ec735e" strokeWidth="2" strokeDasharray="4 4" />
          <text x="160" y="35" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ec735e">Mode (Peak)</text>

          {/* Median Line (Equal Area Split) */}
          <line x1="200" y1="80" x2="200" y2="170" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
          <text x="200" y="70" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#d97706">Median</text>

          {/* Mean Line (Pulled by Tail) */}
          <line x1="245" y1="120" x2="245" y2="170" stroke="#5e62d6" strokeWidth="2" strokeDasharray="4 4" />
          <text x="245" y="110" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5e62d6">Mean</text>

          <text x="360" y="85" fontSize="12" fill="#555">Right (Positive) Skew</text>
          <text x="360" y="105" fontSize="11" fill="#888">Mode &lt; Median &lt; Mean</text>
        </svg>
      );
    }

    if (key.includes('probability')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Venn Diagram A and B with intersection */}
          <rect x="40" y="25" width="460" height="170" rx="10" fill="#faf9f5" stroke="#ded9ce" strokeWidth="1.5" />
          <text x="65" y="50" fontSize="12" fontWeight="bold" fill="#888">Sample Space (S)</text>

          {/* Circle A */}
          <circle cx="210" cy="115" r="65" fill="#ec735e" fillOpacity="0.25" stroke="#ec735e" strokeWidth="2" />
          <text x="180" y="115" fontSize="16" fontWeight="bold" fill="#ec735e">A</text>

          {/* Circle B */}
          <circle cx="310" cy="115" r="65" fill="#5e62d6" fillOpacity="0.25" stroke="#5e62d6" strokeWidth="2" />
          <text x="340" y="115" fontSize="16" fontWeight="bold" fill="#5e62d6">B</text>

          {/* Intersection A and B */}
          <text x="260" y="120" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#20211f">A ∩ B</text>

          <rect x="170" y="165" width="200" height="24" rx="4" fill="#ffffff" stroke="#ccc" />
          <text x="270" y="181" textAnchor="middle" fontSize="11" fontFamily="DM Mono, monospace" fontWeight="bold" fill="#333">
            P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
          </text>
        </svg>
      );
    }

    if (key.includes('data distributions') || key.includes('distributions')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Empirical Rule Normal Curve 68-95-99.7 */}
          <line x1="50" y1="175" x2="490" y2="175" stroke="#aaa" strokeWidth="1.5" />

          {/* Normal Curve */}
          <path d="M 60 174 Q 210 170 270 30 Q 330 170 480 174" fill="#e8f4ea" stroke="#2e7d32" strokeWidth="3" />

          {/* Mean Center */}
          <line x1="270" y1="30" x2="270" y2="175" stroke="#2e7d32" strokeWidth="2" />
          <text x="270" y="195" textAnchor="middle" fontSize="12" fontWeight="bold">μ</text>

          {/* -1SD and +1SD */}
          <line x1="210" y1="95" x2="210" y2="175" stroke="#888" strokeDasharray="3 3" />
          <line x1="330" y1="95" x2="330" y2="175" stroke="#888" strokeDasharray="3 3" />
          <text x="210" y="195" textAnchor="middle" fontSize="11" fill="#666">μ − 1σ</text>
          <text x="330" y="195" textAnchor="middle" fontSize="11" fill="#666">μ + 1σ</text>

          {/* 68% Bracket */}
          <line x1="210" y1="120" x2="330" y2="120" stroke="#ec735e" strokeWidth="2" />
          <text x="270" y="112" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ec735e">68% of Data</text>

          {/* 95% Bracket */}
          <line x1="150" y1="150" x2="390" y2="150" stroke="#5e62d6" strokeWidth="1.5" />
          <text x="270" y="144" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#5e62d6">95% (±2σ)</text>
        </svg>
      );
    }

    if (key.includes('hypothesis testing')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Two-Tailed Hypothesis Testing Curve */}
          <line x1="40" y1="165" x2="500" y2="165" stroke="#aaa" strokeWidth="1.5" />

          {/* Bell Curve */}
          <path d="M 60 164 Q 210 160 270 40 Q 330 160 480 164" stroke="#333" strokeWidth="2.5" fill="none" />

          {/* Left Rejection Tail */}
          <path d="M 60 164 Q 120 162 140 145 L 140 165 Z" fill="#fad2cf" />
          <line x1="140" y1="145" x2="140" y2="165" stroke="#d93025" strokeWidth="2" />
          <text x="100" y="185" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#d93025">
            Reject H₀ (α/2)
          </text>

          {/* Right Rejection Tail */}
          <path d="M 400 145 Q 420 162 480 164 L 400 165 Z" fill="#fad2cf" />
          <line x1="400" y1="145" x2="400" y2="165" stroke="#d93025" strokeWidth="2" />
          <text x="440" y="185" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#d93025">
            Reject H₀ (α/2)
          </text>

          {/* Fail to Reject Region */}
          <rect x="180" y="70" width="180" height="40" rx="6" fill="#e8f4ea" stroke="#2e7d32" strokeWidth="1" />
          <text x="270" y="90" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2e7d32">
            Fail to Reject H₀
          </text>
          <text x="270" y="103" textAnchor="middle" fontSize="9" fill="#1b5e20">
            Confidence Region (1 − α = 95%)
          </text>
        </svg>
      );
    }

    // -------------------------------------------------------------------------
    // ARITHMETIC DIAGRAMS
    // -------------------------------------------------------------------------
    if (key.includes('basic operations')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Number line jumps for addition and subtraction */}
          <text x="50" y="40" fontSize="14" fontWeight="bold" fontFamily="DM Mono, monospace" fill="#ec735e">
            Vector Addition &amp; Subtraction on Number Line: 2 + 5 − 3 = 4
          </text>

          <line x1="40" y1="130" x2="500" y2="130" stroke="#333" strokeWidth="2" />
          {[-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => (
            <g key={n}>
              <line x1={60 + i * 40} y1="124" x2={60 + i * 40} y2="136" stroke="#555" strokeWidth="1.5" />
              <text x={60 + i * 40} y="152" textAnchor="middle" fontSize="11" fill="#444">{n}</text>
            </g>
          ))}

          {/* Jump 1: Start at 2, jump +5 to 7 */}
          <path d="M 220 125 Q 320 60 420 125" stroke="#2e7d32" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
          <text x="320" y="75" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2e7d32">+5</text>

          {/* Jump 2: From 7, jump -3 to 4 */}
          <path d="M 420 125 Q 360 85 300 125" stroke="#ec735e" strokeWidth="3" fill="none" markerEnd="url(#arrow)" />
          <text x="360" y="95" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#ec735e">−3</text>

          <circle cx="300" cy="130" r="6" fill="#20211f" />
          <text x="300" y="175" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#20211f">Final Result = 4</text>
        </svg>
      );
    }

    if (key.includes('fractions')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Fraction Pie (3/8) and Fraction Equivalence Bar */}
          {/* Pie Chart: 8 slices, 3 filled */}
          <g transform="translate(130, 105)">
            <circle cx="0" cy="0" r="70" fill="#f1ede7" stroke="#333" strokeWidth="2" />
            {/* Slice 1 (0 to 45 deg) */}
            <path d="M 0 0 L 70 0 A 70 70 0 0 1 49.5 49.5 Z" fill="#ec735e" stroke="#fff" strokeWidth="1.5" />
            {/* Slice 2 (45 to 90 deg) */}
            <path d="M 0 0 L 49.5 49.5 A 70 70 0 0 1 0 70 Z" fill="#ec735e" stroke="#fff" strokeWidth="1.5" />
            {/* Slice 3 (90 to 135 deg) */}
            <path d="M 0 0 L 0 70 A 70 70 0 0 1 -49.5 49.5 Z" fill="#ec735e" stroke="#fff" strokeWidth="1.5" />
            {/* Dividing lines for other 5 slices */}
            <line x1="0" y1="0" x2="-70" y2="0" stroke="#333" strokeWidth="1" />
            <line x1="0" y1="0" x2="-49.5" y2="-49.5" stroke="#333" strokeWidth="1" />
            <line x1="0" y1="0" x2="0" y2="-70" stroke="#333" strokeWidth="1" />
            <line x1="0" y1="0" x2="49.5" y2="-49.5" stroke="#333" strokeWidth="1" />
          </g>
          <text x="130" y="195" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ec735e">
            3 / 8 Shaded (37.5%)
          </text>

          {/* Fraction Equivalent Strips */}
          <text x="350" y="45" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">Equivalent Fractions</text>
          {/* 1 Whole */}
          <rect x="250" y="60" width="200" height="25" fill="#faf6ee" stroke="#333" strokeWidth="1.5" />
          <text x="350" y="77" textAnchor="middle" fontSize="11" fontWeight="bold">1 Whole</text>
          {/* 1/2 + 1/2 */}
          <rect x="250" y="90" width="100" height="25" fill="#fae8e2" stroke="#ec735e" strokeWidth="1.5" />
          <rect x="350" y="90" width="100" height="25" fill="#f1ede7" stroke="#ec735e" strokeWidth="1.5" />
          <text x="300" y="107" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ec735e">½</text>
          <text x="400" y="107" textAnchor="middle" fontSize="11" fill="#777">½</text>
          {/* 1/4 * 4 */}
          <rect x="250" y="120" width="50" height="25" fill="#fae8e2" stroke="#ec735e" strokeWidth="1.5" />
          <rect x="300" y="120" width="50" height="25" fill="#fae8e2" stroke="#ec735e" strokeWidth="1.5" />
          <rect x="350" y="120" width="100" height="25" fill="#f1ede7" stroke="#ccc" strokeWidth="1.5" />
          <text x="275" y="137" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ec735e">¼</text>
          <text x="325" y="137" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ec735e">¼</text>
          <text x="350" y="170" textAnchor="middle" fontSize="12" fontFamily="DM Mono, monospace" fontWeight="bold" fill="#20211f">
            ½ = 2/4 = 4/8
          </text>
        </svg>
      );
    }

    if (key.includes('decimals')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* Decimal Place Value Place Chart */}
          <rect x="30" y="30" width="480" height="150" rx="10" fill="#faf8f2" stroke="#ded9cd" strokeWidth="1.5" />

          {/* Columns */}
          {['Hundreds (100)', 'Tens (10)', 'Units (1)', '·', 'Tenths (0.1)', 'Hundredths (0.01)'].map((col, idx) => (
            <g key={col}>
              <rect
                x={45 + idx * 75}
                y="45"
                width={idx === 3 ? 20 : 70}
                height="32"
                rx="4"
                fill={idx < 3 ? '#fae8e2' : idx === 3 ? '#20211f' : '#e8f4ea'}
              />
              <text
                x={45 + idx * 75 + (idx === 3 ? 10 : 35)}
                y="65"
                textAnchor="middle"
                fontSize={idx === 3 ? 18 : 9}
                fontWeight="bold"
                fill={idx === 3 ? '#fff' : idx < 3 ? '#ec735e' : '#2e7d32'}
              >
                {idx === 3 ? '•' : col.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* Digits row: 3 4 5 . 7 8 */}
          {['3', '4', '5', '.', '7', '8'].map((dig, idx) => (
            <text
              key={`dig-${idx}`}
              x={45 + idx * 75 + (idx === 3 ? 10 : 35)}
              y="125"
              textAnchor="middle"
              fontSize="32"
              fontWeight="bold"
              fontFamily="serif"
              fill={idx === 3 ? '#ec735e' : '#20211f'}
            >
              {dig}
            </text>
          ))}

          <text x="270" y="165" textAnchor="middle" fontSize="13" fontFamily="DM Mono, monospace" fontWeight="bold" fill="#555">
            345.78 = 300 + 40 + 5 + 0.7 + 0.08
          </text>
        </svg>
      );
    }

    if (key.includes('percentages')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* 100 Grid Percentage Visualizer */}
          <g transform="translate(140, 20)">
            {Array.from({ length: 10 }).map((_, r) =>
              Array.from({ length: 10 }).map((_, c) => {
                const count = r * 10 + c;
                const isFilled = count < 35; // 35%
                return (
                  <rect
                    key={`cell-${r}-${c}`}
                    x={c * 17}
                    y={r * 17}
                    width="14"
                    height="14"
                    rx="2"
                    fill={isFilled ? '#ec735e' : '#faf0ea'}
                    stroke={isFilled ? '#d95f4c' : '#ebd8cf'}
                    strokeWidth="1"
                  />
                );
              })
            )}
          </g>

          <rect x="335" y="45" width="165" height="120" rx="8" fill="#fff" stroke="#ded9cd" strokeWidth="1.5" />
          <text x="417" y="75" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#ec735e">35%</text>
          <text x="417" y="100" textAnchor="middle" fontSize="12" fill="#666">35 parts out of 100</text>
          <text x="417" y="125" textAnchor="middle" fontSize="13" fontFamily="DM Mono, monospace" fill="#20211f">
            = 35/100 = 0.35
          </text>
          <text x="417" y="145" textAnchor="middle" fontSize="11" fill="#2e7d32" fontWeight="bold">
            = 7 / 20 Simplified
          </text>
        </svg>
      );
    }

    if (key.includes('word problems')) {
      return (
        <svg viewBox="0 0 540 220" width="100%" height="100%" style={{ maxHeight: 240 }}>
          {/* 4-Step Pólya Problem-Solving Flow */}
          <defs>
            <marker id="stepArr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#888" />
            </marker>
          </defs>

          {[
            { num: '1', title: 'Understand', desc: 'Identify knowns & unknown', color: '#ec735e', bg: '#fae8e2' },
            { num: '2', title: 'Plan / Model', desc: 'Write equation: d = r · t', color: '#5e62d6', bg: '#eeeffb' },
            { num: '3', title: 'Execute', desc: 'Solve algebraically', color: '#2e7d32', bg: '#e8f4ea' },
            { num: '4', title: 'Verify', desc: 'Check units & reality', color: '#d97706', bg: '#fef7e7' }
          ].map((st, i) => (
            <g key={st.num} transform={`translate(${40 + i * 120}, 45)`}>
              <rect x="0" y="0" width="105" height="120" rx="8" fill={st.bg} stroke={st.color} strokeWidth="1.5" />
              <circle cx="52" cy="25" r="14" fill={st.color} />
              <text x="52" y="30" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fff">{st.num}</text>
              <text x="52" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#20211f">{st.title}</text>
              <text x="52" y="85" textAnchor="middle" fontSize="9" fill="#555" width="80">{st.desc}</text>
              {i < 3 && (
                <line x1="110" y1="60" x2="118" y2="60" stroke="#888" strokeWidth="2" markerEnd="url(#stepArr)" />
              )}
            </g>
          ))}
          <text x="270" y="195" textAnchor="middle" fontSize="12" fontFamily="DM Mono, monospace" fontWeight="bold" fill="#333">
            Pólya's Universal Mathematical Modeling Method
          </text>
        </svg>
      );
    }

    // Default Fallback Diagram
    return (
      <svg viewBox="0 0 540 200" width="100%" height="100%" style={{ maxHeight: 220 }}>
        <rect x="30" y="20" width="480" height="160" rx="10" fill="#faf8f2" stroke="#ded9ce" strokeWidth="1.5" />
        <circle cx="270" cy="80" r="35" fill="#fae8e2" stroke="#ec735e" strokeWidth="2" />
        <text x="270" y="87" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#ec735e">∫ x dx</text>
        <text x="270" y="140" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#20211f">
          {title || 'Mathematical Concept Model'}
        </text>
        <text x="270" y="160" textAnchor="middle" fontSize="11" fill="#777">
          {topic} · Visual Reference &amp; Geometric Representation
        </text>
      </svg>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        my: 3,
        p: { xs: 2, sm: 2.5 },
        bgcolor: '#ffffff',
        borderRadius: 3.5,
        border: '1.5px solid #ded9cd',
        boxShadow: '0 4px 20px rgba(44,39,27,0.04)',
        overflow: 'hidden'
      }}
    >
      {/* Diagram Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <AutoAwesome sx={{ color: '#ec735e', fontSize: 18 }} />
          <Typography
            fontFamily="DM Mono, monospace"
            fontSize={11}
            fontWeight={800}
            color="#ec735e"
            letterSpacing={1}
            textTransform="uppercase"
          >
            Figure: Geometric Intuition &amp; Visual Model
          </Typography>
        </Stack>
        <Chip
          label="Vector Graphic"
          size="small"
          sx={{
            fontSize: 10,
            bgcolor: '#faf8f2',
            border: '1px solid #e8e4db',
            color: '#666',
            height: 20
          }}
        />
      </Stack>

      {/* SVG Canvas Box */}
      <Box
        sx={{
          bgcolor: '#faf9f5',
          p: { xs: 1, sm: 2 },
          borderRadius: 2.5,
          border: '1px solid #eee8dc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 180
        }}
      >
        {renderDiagramContent()}
      </Box>

      {/* Caption & Explanation */}
      <Box sx={{ mt: 1.5, px: 0.5 }}>
        <Typography fontSize={11} color="text.secondary" lineHeight={1.5}>
          <strong>Visual Guide:</strong> Study the visual model above to internalize the geometric relationships and computational rules of <em>{title}</em> before tackling practice problems.
        </Typography>
      </Box>
    </Paper>
  );
}
