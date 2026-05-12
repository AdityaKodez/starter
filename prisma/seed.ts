import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  Subject,
  TopicDifficulty,
  TopicImportance,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type SeedTopic = {
  name: string;
  difficulty: TopicDifficulty;
  importance: TopicImportance;
  estimatedMinutes: number;
};

type SeedChapter = {
  subject: Subject;
  name: string;
  topics: SeedTopic[];
};

const chapters: SeedChapter[] = [
  {
    subject: Subject.maths,
    name: "Sets, Relations and Functions",
    topics: [
      {
        name: "Sets and set operations",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 40,
      },
      {
        name: "Relations and equivalence",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 50,
      },
      {
        name: "Functions and composition",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Complex Numbers and Quadratic Equations",
    topics: [
      {
        name: "Complex numbers and Argand plane",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Modulus and argument",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 50,
      },
      {
        name: "Quadratic equations and roots",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Matrices and Determinants",
    topics: [
      {
        name: "Matrices and operations",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Determinants and properties",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Inverse matrix and linear systems",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Permutations and Combinations",
    topics: [
      {
        name: "Counting principles",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 50,
      },
      {
        name: "Permutations",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Combinations",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Binomial Theorem",
    topics: [
      {
        name: "Binomial expansion",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "General term and middle term",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Simple applications",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Sequence and Series",
    topics: [
      {
        name: "Arithmetic progression",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Geometric progression",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "AM-GM relation and means",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Limit, Continuity and Differentiability",
    topics: [
      {
        name: "Limits and continuity",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Differentiation rules",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Applications of derivatives",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Integral Calculus",
    topics: [
      {
        name: "Indefinite integrals",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Definite integrals",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Area under curves",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Differential Equations",
    topics: [
      {
        name: "Order and degree",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 50,
      },
      {
        name: "Separable and homogeneous",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Linear differential equations",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Coordinate Geometry",
    topics: [
      {
        name: "Straight line and pair of lines",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Circle",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Conic sections",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Three Dimensional Geometry",
    topics: [
      {
        name: "Direction ratios and cosines",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Line and angle between lines",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Shortest distance between lines",
        difficulty: TopicDifficulty.advanced,
        importance: TopicImportance.primary,
        estimatedMinutes: 90,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Vector Algebra",
    topics: [
      {
        name: "Vector operations",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Scalar and vector products",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Components and applications",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 65,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Statistics and Probability",
    topics: [
      {
        name: "Measures of dispersion",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.secondary,
        estimatedMinutes: 45,
      },
      {
        name: "Probability and Bayes theorem",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Random variables and distributions",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.maths,
    name: "Trigonometry",
    topics: [
      {
        name: "Trigonometric identities",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Trigonometric functions",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Inverse trigonometric functions",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Units and Measurements",
    topics: [
      {
        name: "Units and dimensions",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 35,
      },
      {
        name: "Significant figures and errors",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 35,
      },
      {
        name: "Dimensional analysis",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.secondary,
        estimatedMinutes: 30,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Kinematics",
    topics: [
      {
        name: "Motion in a straight line",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 45,
      },
      {
        name: "Uniformly accelerated motion",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Projectile and circular motion",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Laws of Motion",
    topics: [
      {
        name: "Newton's laws and momentum",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Friction and applications",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Uniform circular motion",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Work, Energy and Power",
    topics: [
      {
        name: "Work-energy theorem",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Potential energy and conservation",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Collisions",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Rotational Motion",
    topics: [
      {
        name: "Center of mass",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Torque and angular momentum",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 80,
      },
      {
        name: "Moment of inertia and rotation",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 80,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Gravitation",
    topics: [
      {
        name: "Newton's law of gravitation",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 45,
      },
      {
        name: "Gravitational field and potential",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Satellites and escape velocity",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Properties of Solids and Liquids",
    topics: [
      {
        name: "Elasticity and stress-strain",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Fluid mechanics and viscosity",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Surface tension and capillarity",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Thermodynamics",
    topics: [
      {
        name: "Thermal expansion and calorimetry",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "First law and processes",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Second law and entropy",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Kinetic Theory of Gases",
    topics: [
      {
        name: "Kinetic theory and pressure",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "RMS speed and degrees of freedom",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Specific heat and mean free path",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 65,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Oscillations and Waves",
    topics: [
      {
        name: "Simple harmonic motion",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Wave motion and superposition",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Standing waves and resonance",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Electrostatics",
    topics: [
      {
        name: "Electric charges and fields",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Gauss law and applications",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Potential and capacitance",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Current Electricity",
    topics: [
      {
        name: "Ohm's law and resistivity",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Kirchhoff's laws and circuits",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Wheatstone bridge and meter bridge",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 65,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Magnetic Effects of Current and Magnetism",
    topics: [
      {
        name: "Biot-Savart and Ampere law",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Magnetic force and torque",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Magnetism in matter",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 60,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Electromagnetic Induction and Alternating Currents",
    topics: [
      {
        name: "Faraday and Lenz laws",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Inductance and eddy currents",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "AC circuits and transformer",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 80,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Electromagnetic Waves",
    topics: [
      {
        name: "EM waves and spectrum",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.secondary,
        estimatedMinutes: 35,
      },
      {
        name: "Applications of EM waves",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.secondary,
        estimatedMinutes: 35,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Optics",
    topics: [
      {
        name: "Ray optics and lenses",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Optical instruments",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
      {
        name: "Wave optics",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Dual Nature of Matter and Radiation",
    topics: [
      {
        name: "Photoelectric effect",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "De Broglie waves",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Particle nature of light",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Atoms and Nuclei",
    topics: [
      {
        name: "Atomic models and spectra",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Nuclear properties and decay",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Binding energy and reactions",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Electronic Devices",
    topics: [
      {
        name: "Semiconductors and diodes",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Transistors and logic gates",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Rectifiers and regulators",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.physics,
    name: "Experimental Skills",
    topics: [
      {
        name: "Measurement tools and errors",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.secondary,
        estimatedMinutes: 35,
      },
      {
        name: "Experimental observations",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.secondary,
        estimatedMinutes: 35,
      },
      {
        name: "Basic lab experiments list",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.secondary,
        estimatedMinutes: 35,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Some Basic Concepts in Chemistry",
    topics: [
      {
        name: "Atomic and molecular masses",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 40,
      },
      {
        name: "Mole concept and stoichiometry",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Chemical equations and composition",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Atomic Structure",
    topics: [
      {
        name: "Bohr model and spectra",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Quantum numbers and orbitals",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Electronic configuration",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Chemical Bonding and Molecular Structure",
    topics: [
      {
        name: "Ionic and covalent bonding",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "VSEPR and hybridization",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Molecular orbital theory",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Chemical Thermodynamics",
    topics: [
      {
        name: "First law and enthalpy",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Second law and entropy",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Gibbs energy and equilibrium",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Solutions",
    topics: [
      {
        name: "Concentration terms",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Raoult law and vapor pressure",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Colligative properties",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Equilibrium",
    topics: [
      {
        name: "Chemical equilibrium",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Ionic equilibrium and pH",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Buffers and solubility product",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Redox Reactions and Electrochemistry",
    topics: [
      {
        name: "Redox and oxidation number",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Electrochemical cells and Nernst",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Conductance and galvanic cells",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Chemical Kinetics",
    topics: [
      {
        name: "Rate laws and order",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Arrhenius equation",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Activation energy and catalysis",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Classification of Elements and Periodicity",
    topics: [
      {
        name: "Modern periodic law",
        difficulty: TopicDifficulty.easy,
        importance: TopicImportance.primary,
        estimatedMinutes: 45,
      },
      {
        name: "Periodic trends",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "s, p, d, f block overview",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "p-Block Elements",
    topics: [
      {
        name: "Group 13 and 14",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Group 15 and 16",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Group 17 and 18",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "d- and f-Block Elements",
    topics: [
      {
        name: "Transition elements properties",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Lanthanoids and actinoids",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 65,
      },
      {
        name: "Complex formation and magnetism",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 65,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Coordination Compounds",
    topics: [
      {
        name: "Nomenclature and isomerism",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Bonding theories",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 80,
      },
      {
        name: "Properties and applications",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 60,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Purification and Characterisation of Organic Compounds",
    topics: [
      {
        name: "Purification methods",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Qualitative analysis of elements",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Quantitative analysis basics",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 60,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Basic Principles of Organic Chemistry",
    topics: [
      {
        name: "Hybridization and isomerism",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Electronic effects",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Reaction mechanisms",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Hydrocarbons",
    topics: [
      {
        name: "Alkanes and conformations",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Alkenes and alkynes",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Aromatic hydrocarbons",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Organic Compounds Containing Halogens",
    topics: [
      {
        name: "Preparation and properties",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Substitution reactions",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 70,
      },
      {
        name: "Environmental effects",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 50,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Organic Compounds Containing Oxygen",
    topics: [
      {
        name: "Alcohols, phenols, ethers",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Aldehydes and ketones",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Carboxylic acids",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Organic Compounds Containing Nitrogen",
    topics: [
      {
        name: "Amines",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 60,
      },
      {
        name: "Diazonium salts",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.primary,
        estimatedMinutes: 75,
      },
      {
        name: "Properties and reactions",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Biomolecules",
    topics: [
      {
        name: "Carbohydrates",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Proteins and enzymes",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.primary,
        estimatedMinutes: 55,
      },
      {
        name: "Nucleic acids and vitamins",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
    ],
  },
  {
    subject: Subject.chemistry,
    name: "Principles Related to Practical Chemistry",
    topics: [
      {
        name: "Inorganic preparation principles",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
      {
        name: "Organic preparation principles",
        difficulty: TopicDifficulty.medium,
        importance: TopicImportance.secondary,
        estimatedMinutes: 55,
      },
      {
        name: "Qualitative salt analysis",
        difficulty: TopicDifficulty.hard,
        importance: TopicImportance.secondary,
        estimatedMinutes: 70,
      },
    ],
  },
];

async function main() {
  for (const [chapterIndex, chapter] of chapters.entries()) {
    const savedChapter = await prisma.studyChapter.upsert({
      where: {
        subject_name: {
          subject: chapter.subject,
          name: chapter.name,
        },
      },
      update: {
        order: chapterIndex + 1,
      },
      create: {
        subject: chapter.subject,
        name: chapter.name,
        order: chapterIndex + 1,
      },
    });

    for (const [topicIndex, topic] of chapter.topics.entries()) {
      await prisma.studyTopic.upsert({
        where: {
          chapterId_name: {
            chapterId: savedChapter.id,
            name: topic.name,
          },
        },
        update: {
          difficulty: topic.difficulty,
          importance: topic.importance,
          estimatedMinutes: topic.estimatedMinutes,
          order: topicIndex + 1,
        },
        create: {
          chapterId: savedChapter.id,
          name: topic.name,
          difficulty: topic.difficulty,
          importance: topic.importance,
          estimatedMinutes: topic.estimatedMinutes,
          order: topicIndex + 1,
        },
      });
    }
  }

  const topicCount = await prisma.studyTopic.count();
  console.log(`Seeded ${chapters.length} chapters and ${topicCount} topics.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
