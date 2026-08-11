import { useState, useEffect, useRef, useCallback } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  InputNumber,
  Radio,
  Row,
  Segmented,
  Select,
  Slider,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
} from "antd";
import {
  LuActivity,
  LuArrowRight,
  LuBookOpen,
  LuCheck,
  LuCompass,
  LuInfo,
  LuLayers,
  LuPause,
  LuPlay,
  LuRotateCcw,
  LuSparkles,
  LuX,
  LuZap,
} from "react-icons/lu";
import icon from "./favicon.svg";

export const RTIFACT = {
  title: "Magnetic Force Educational Lab (Grade 10 Physics)",
  icon,
};

// Physics constants
const ELEMENTARY_CHARGE = 1.602e-19; // Coulombs
const ELECTRON_MASS = 9.109e-31; // kg
const PROTON_MASS = 1.673e-27; // kg
const ALPHA_MASS = 6.644e-27; // kg
const MU_0 = 4 * Math.PI * 1e-7; // T*m/A

const PARTICLE_PRESETS = {
  proton: {
    name: "Proton (p+)",
    charge: 1, // in elementary charges
    mass: 1, // relative mass unit
    realMass: PROTON_MASS,
    particleHex: "#ef4444",
    symbol: "p⁺",
  },
  electron: {
    name: "Electron (e-)",
    charge: -1,
    mass: 1 / 1836,
    realMass: ELECTRON_MASS,
    particleHex: "#3b82f6",
    symbol: "e⁻",
  },
  alpha: {
    name: "Alpha Particle (α²⁺)",
    charge: 2,
    mass: 4,
    realMass: ALPHA_MASS,
    particleHex: "#eab308",
    symbol: "α²⁺",
  },
  custom: {
    name: "Custom Ion",
    charge: 1,
    mass: 1,
    realMass: PROTON_MASS,
    particleHex: "#10b981",
    symbol: "X⁺",
  },
};

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question:
      "A positive charge (proton) moves to the RIGHT into a magnetic field pointing INTO the screen. What direction is the magnetic force?",
    options: ["Upward", "Downward", "Leftward", "Out of the screen"],
    answer: 0,
    explanation:
      "Using Right-Hand Rule #1: Index finger points Right (v), middle finger points Into screen (B), thumb points UPWARD (F). Since it is a positive charge, force is UPWARD.",
  },
  {
    id: 2,
    question:
      "If an electron replaces the proton moving in the exact same direction and field, how will its deflection differ?",
    options: [
      "Same direction, much larger radius",
      "Opposite direction (Downward), much smaller radius",
      "No deflection at all",
      "Opposite direction (Downward), exact same radius",
    ],
    answer: 1,
    explanation:
      "Electron has negative charge (reverses force direction to Downward) and is 1836x lighter (much smaller radius r = mv/qB).",
  },
  {
    id: 3,
    question:
      "A wire carries current to the RIGHT in a magnetic field pointing UP. What direction is the magnetic force on the wire?",
    options: [
      "Into the screen",
      "Out of the screen",
      "Downward",
      "To the Left",
    ],
    answer: 1,
    explanation:
      "Using RHR for current wires (F = I L x B): Thumb points Right (current I), index points Up (B-field), palm/middle finger faces OUT OF THE SCREEN.",
  },
  {
    id: 4,
    question:
      "Two parallel wires carry electric currents in the SAME direction. What force do they exert on each other?",
    options: [
      "They repel each other",
      "They attract each other",
      "No force is exerted",
      "They rotate around each other",
    ],
    answer: 1,
    explanation:
      "Parallel currents in the same direction ATTRACT each other because the magnetic field from wire 1 creates an inward Lorentz force on current in wire 2.",
  },
  {
    id: 5,
    question:
      "What happens to the radius of a charged particle's circular path if you DOUBLE the magnetic field strength B?",
    options: [
      "Radius doubles",
      "Radius quadruples",
      "Radius is halved",
      "Radius stays unchanged",
    ],
    answer: 2,
    explanation:
      "The radius formula is r = (m·v) / (|q|·B). Since B is in the denominator, doubling B cuts the radius in half!",
  },
];

export default function MagneticForceSim() {
  const [activeTab, setActiveTab] = useState("lorentz");

  // --- Mode 1: Lorentz Force Particle Simulator State ---
  const [particlePreset, setParticlePreset] = useState("proton");
  const [chargeSign, setChargeSign] = useState(1);
  const [chargeMagnitude, setChargeMagnitude] = useState(1);
  const [massScale] = useState(1);
  const [speed, setSpeed] = useState(50); // relative velocity unit (1-100)
  const [velocityAngle, setVelocityAngle] = useState(0); // degrees relative to horizontal
  const [bField, setBField] = useState(2); // Tesla-like units (-5 to 5, positive = Into Page, negative = Out of Page)
  const [bDirection, setBDirection] = useState("into"); // "into", "out"
  const [showVectors, setShowVectors] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Particle Simulation Engine Ref
  const canvasRef = useRef(null);
  const simStateRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    trail: [],
  });

  // Calculate physical values for Grade 10 reference
  const effectiveCharge = chargeSign * chargeMagnitude;
  const velocityRad = (velocityAngle * Math.PI) / 180;
  const vMag = speed * 1e4; // m/s scale
  const qMag = Math.abs(effectiveCharge) * ELEMENTARY_CHARGE;
  const bMag = Math.abs(bField);
  const mReal =
    particlePreset === "electron"
      ? ELECTRON_MASS
      : particlePreset === "alpha"
        ? ALPHA_MASS
        : PROTON_MASS * massScale;

  const forceLorentz = qMag * vMag * bMag * Math.sin(Math.PI / 2); // 90 deg perp
  const radiusCyclotron = bMag > 0 ? (mReal * vMag) / (qMag * bMag) : Infinity;
  const periodCyclotron =
    bMag > 0 ? (2 * Math.PI * mReal) / (qMag * bMag) : Infinity;

  // Reset Particle Position
  const resetParticle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const startX = canvas.width / 2;
    const startY = canvas.height / 2;
    const initialVx = speed * 0.08 * Math.cos(velocityRad);
    const initialVy = -speed * 0.08 * Math.sin(velocityRad); // canvas y is inverted

    simStateRef.current = {
      x: startX,
      y: startY,
      vx: initialVx,
      vy: initialVy,
      trail: [{ x: startX, y: startY }],
    };
  }, [speed, velocityRad]);

  useEffect(() => {
    resetParticle();
  }, [
    particlePreset,
    chargeSign,
    chargeMagnitude,
    massScale,
    speed,
    velocityAngle,
    bDirection,
    resetParticle,
  ]);

  // Particle Animation Loop
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas with subtle dark background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      // Draw Magnetic Field Grid Background
      const spacing = 40;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";

      for (let x = 20; x < width; x += spacing) {
        for (let y = 20; y < height; y += spacing) {
          if (bMag > 0) {
            if (bDirection === "into") {
              // Draw "X" for into page
              ctx.strokeStyle = "rgba(239, 68, 68, 0.25)";
              ctx.beginPath();
              ctx.moveTo(x - 5, y - 5);
              ctx.lineTo(x + 5, y + 5);
              ctx.moveTo(x + 5, y - 5);
              ctx.lineTo(x - 5, y + 5);
              ctx.stroke();
            } else {
              // Draw Dot "•" for out of page
              ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Physics Step
      if (isPlaying) {
        const state = simStateRef.current;
        // B vector: (0, 0, Bz) where Bz > 0 is into page (+z), Bz < 0 out of page (-z)
        // In 2D plane (x right, y down in canvas coords), Lorentz acceleration:
        // F = q (v x B). In canvas coords:
        // v = (vx, vy, 0), B = (0, 0, Bz)
        // v x B = (vy * Bz, -vx * Bz, 0)
        // Force on particle = q * (v x B)
        // Note: Canvas y axis goes DOWN, so vy > 0 means moving down.
        const bValue = (bDirection === "into" ? 1 : -1) * bField * 0.003;
        const qValue = effectiveCharge;
        const massValue = particlePreset === "electron" ? 0.05 : massScale;

        // Acceleration in canvas coordinates
        const ax = (qValue * state.vy * bValue) / massValue;
        const ay = (-qValue * state.vx * bValue) / massValue;

        state.vx += ax;
        state.vy += ay;
        state.x += state.vx;
        state.y += state.vy;

        // Boundary wrapping or bounce
        if (state.x < 10 || state.x > width - 10) state.vx *= -1;
        if (state.y < 10 || state.y > height - 10) state.vy *= -1;

        if (showTrail) {
          state.trail.push({ x: state.x, y: state.y });
          if (state.trail.length > 250) state.trail.shift();
        }
      }

      const state = simStateRef.current;

      // Draw Trail
      if (showTrail && state.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(state.trail[0].x, state.trail[0].y);
        for (let i = 1; i < state.trail.length; i++) {
          ctx.lineTo(state.trail[i].x, state.trail[i].y);
        }
        ctx.strokeStyle =
          effectiveCharge >= 0
            ? "rgba(239, 68, 68, 0.6)"
            : "rgba(59, 130, 246, 0.6)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Particle Body
      ctx.beginPath();
      ctx.arc(state.x, state.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = effectiveCharge >= 0 ? "#ef4444" : "#3b82f6";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Particle Charge Symbol
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        effectiveCharge > 0 ? "+" : effectiveCharge < 0 ? "-" : "0",
        state.x,
        state.y,
      );

      // Draw Velocity and Force Vectors
      if (showVectors) {
        // Velocity Vector (Green Arrow)
        const vScale = 15;
        const endVx = state.x + state.vx * vScale;
        const endVy = state.y + state.vy * vScale;

        drawArrow(ctx, state.x, state.y, endVx, endVy, "#10b981", "v");

        // Force Vector (Yellow Arrow)
        const bValue = (bDirection === "into" ? 1 : -1) * bField * 0.003;
        const qValue = effectiveCharge;
        const fx = qValue * state.vy * bValue;
        const fy = -qValue * state.vx * bValue;
        const fScale = 400;
        const endFx = state.x + fx * fScale;
        const endFy = state.y + fy * fScale;

        if (Math.hypot(fx, fy) > 0.001) {
          drawArrow(ctx, state.x, state.y, endFx, endFy, "#f59e0b", "F_mag");
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [
    isPlaying,
    showTrail,
    showVectors,
    bField,
    bDirection,
    effectiveCharge,
    massScale,
    particlePreset,
  ]);

  // Utility to draw clean vector arrows on canvas
  function drawArrow(ctx, fromx, fromy, tox, toy, color, label) {
    const headlen = 10;
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 6),
      toy - headlen * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 6),
      toy - headlen * Math.sin(angle + Math.PI / 6),
    );
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(label, tox + 12 * Math.cos(angle), toy + 12 * Math.sin(angle));
  }

  // --- Mode 2: Current Wire Simulator State ---
  const [wireCurrent, setWireCurrent] = useState(5); // Amperes (-10 to 10)
  const [wireLength, setWireLength] = useState(0.5); // meters
  const [wireBField, setWireBField] = useState(1.5); // Tesla
  const [wireAngle, setWireAngle] = useState(90); // degrees
  const wireForce =
    Math.abs(wireCurrent) *
    wireLength *
    wireBField *
    Math.sin((wireAngle * Math.PI) / 180);

  // --- Mode 3: Parallel Wires Simulator State ---
  const [current1, setCurrent1] = useState(8); // A
  const [current2, setCurrent2] = useState(8); // A
  const [wireDistance, setWireDistance] = useState(0.05); // meters (5 cm)
  const forcePerLength =
    (MU_0 * Math.abs(current1) * Math.abs(current2)) /
    (2 * Math.PI * wireDistance);
  const isAttracting = current1 * current2 > 0;

  // --- Mode 4: Quiz State ---
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const handleSelectQuizOption = (questionId, optionIndex) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.answer) score += 1;
    });
    return score;
  };

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8 text-foreground">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card">
              <LuZap className="h-7 w-7 text-yellow-400" aria-hidden="true" />
            </div>
            <div>
              <Typography.Title level={2} className="m-0 text-foreground">
                Magnetic Force Lab & Interactive Sim
              </Typography.Title>
              <Typography.Text type="secondary" className="text-sm">
                Grade 10 Physics • Lorentz Force, Right-Hand Rule &
                Electromagnetism
              </Typography.Text>
            </div>
          </div>
          <Space className="flex-wrap">
            <Tag color="blue" className="px-3 py-1 text-sm font-medium">
              Grade 10 Standard
            </Tag>
            <Tag color="purple" className="px-3 py-1 text-sm font-medium">
              F = q(v × B)
            </Tag>
          </Space>
        </header>

        {/* Navigation Tabs */}
        <Segmented
          size="large"
          block
          options={[
            {
              label: (
                <div className="flex items-center justify-center gap-2 py-1">
                  <LuActivity className="h-4 w-4" />
                  <span>1. Moving Charge Sim</span>
                </div>
              ),
              value: "lorentz",
            },
            {
              label: (
                <div className="flex items-center justify-center gap-2 py-1">
                  <LuZap className="h-4 w-4" />
                  <span>2. Wire in B-Field</span>
                </div>
              ),
              value: "wire",
            },
            {
              label: (
                <div className="flex items-center justify-center gap-2 py-1">
                  <LuLayers className="h-4 w-4" />
                  <span>3. Parallel Wires</span>
                </div>
              ),
              value: "parallel",
            },
            {
              label: (
                <div className="flex items-center justify-center gap-2 py-1">
                  <LuInfo className="h-4 w-4" />
                  <span>4. Concept Quiz</span>
                </div>
              ),
              value: "quiz",
            },
            {
              label: (
                <div className="flex items-center justify-center gap-2 py-1">
                  <LuBookOpen className="h-4 w-4" />
                  <span>5. Formulas & RHR</span>
                </div>
              ),
              value: "formulas",
            },
          ]}
          value={activeTab}
          onChange={(v) => setActiveTab(String(v))}
        />

        {/* TAB 1: Lorentz Force Particle Simulator */}
        {activeTab === "lorentz" && (
          <Row gutter={[24, 24]}>
            {/* Control Panel */}
            <Col xs={24} lg={8}>
              <Card
                title={
                  <span className="flex items-center gap-2 font-semibold">
                    <LuCompass className="text-primary" /> Particle & Field
                    Settings
                  </span>
                }
                className="shadow-md"
              >
                <div className="space-y-5">
                  {/* Particle Preset */}
                  <div>
                    <label className="mb-1 block font-medium text-sm">
                      Particle Preset
                    </label>
                    <Select
                      className="w-full"
                      value={particlePreset}
                      onChange={(val) => {
                        setParticlePreset(val);
                        if (val !== "custom") {
                          setChargeSign(
                            PARTICLE_PRESETS[val].charge >= 0 ? 1 : -1,
                          );
                          setChargeMagnitude(
                            Math.abs(PARTICLE_PRESETS[val].charge),
                          );
                        }
                      }}
                      options={Object.entries(PARTICLE_PRESETS).map(
                        ([key, item]) => ({
                          label: `${item.name} (${item.symbol})`,
                          value: key,
                        }),
                      )}
                    />
                  </div>

                  {/* Charge Sign & Magnitude */}
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Electric Charge (q)</span>
                      <Tag color={chargeSign >= 0 ? "red" : "blue"}>
                        {chargeSign > 0 ? "+" : chargeSign < 0 ? "-" : "0"}{" "}
                        {chargeMagnitude} e
                      </Tag>
                    </div>
                    <Row gutter={8} align="middle">
                      <Col span={12}>
                        <Radio.Group
                          block
                          optionType="button"
                          value={chargeSign}
                          onChange={(e) => setChargeSign(e.target.value)}
                        >
                          <Radio.Button value={1}>Positive (+)</Radio.Button>
                          <Radio.Button value={-1}>Negative (-)</Radio.Button>
                        </Radio.Group>
                      </Col>
                      <Col span={12}>
                        <InputNumber
                          min={1}
                          max={5}
                          value={chargeMagnitude}
                          onChange={(v) => setChargeMagnitude(v || 1)}
                          addonBefore="|q|"
                          className="w-full"
                        />
                      </Col>
                    </Row>
                  </div>

                  {/* Velocity Controls */}
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Initial Velocity Speed (v)</span>
                      <span>{speed} rel. units</span>
                    </div>
                    <Slider
                      min={10}
                      max={100}
                      value={speed}
                      onChange={(v) => setSpeed(v)}
                    />
                  </div>

                  {/* Velocity Launch Angle */}
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Launch Angle (θ)</span>
                      <span>{velocityAngle}°</span>
                    </div>
                    <Slider
                      min={-180}
                      max={180}
                      value={velocityAngle}
                      onChange={(v) => setVelocityAngle(v)}
                    />
                  </div>

                  {/* Magnetic Field (B) Controls */}
                  <Divider className="my-3" />
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Magnetic Field Direction (B)</span>
                      <Tag
                        color={bDirection === "into" ? "volcano" : "geekblue"}
                      >
                        {bDirection === "into"
                          ? "⊗ Into Screen"
                          : "⊙ Out of Screen"}
                      </Tag>
                    </div>
                    <Segmented
                      block
                      options={[
                        { label: "⊗ Into Page", value: "into" },
                        { label: "⊙ Out of Page", value: "out" },
                      ]}
                      value={bDirection}
                      onChange={(v) => setBDirection(String(v))}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Magnetic Field Strength (|B|)</span>
                      <span>{bField} Tesla</span>
                    </div>
                    <Slider
                      min={0}
                      max={5}
                      step={0.2}
                      value={bField}
                      onChange={(v) => setBField(v)}
                    />
                  </div>

                  {/* Visual Toggles */}
                  <Divider className="my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Show Vectors (v, F)
                    </span>
                    <Switch checked={showVectors} onChange={setShowVectors} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Show Motion Trail
                    </span>
                    <Switch checked={showTrail} onChange={setShowTrail} />
                  </div>

                  {/* Playback Controls */}
                  <Space className="w-full justify-between pt-2">
                    <Button
                      type={isPlaying ? "default" : "primary"}
                      icon={isPlaying ? <LuPause /> : <LuPlay />}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </Button>
                    <Button icon={<LuRotateCcw />} onClick={resetParticle}>
                      Reset Particle
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>

            {/* Interactive Canvas & Diagnostics */}
            <Col xs={24} lg={16}>
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-semibold">
                      <LuSparkles className="text-yellow-500" /> Real-time 2D
                      Lorentz Orbit Canvas
                    </span>
                    <Space>
                      <Badge color="#10b981" text="Green = Velocity (v)" />
                      <Badge color="#f59e0b" text="Yellow = Force (F)" />
                    </Space>
                  </div>
                }
              >
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={440}
                    role="img"
                    aria-label="Animated path of a charged particle in a magnetic field"
                    aria-describedby="lorentz-diagnostics"
                    className="block w-full h-[440px] bg-slate-900 cursor-crosshair"
                  >
                    The particle path, velocity vector, and magnetic-force
                    vector are summarized by the diagnostics below.
                  </canvas>
                </div>

                {/* Grade 10 Formula Calculated Stats */}
                <div
                  id="lorentz-diagnostics"
                  className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-card p-4 rounded-lg border border-border"
                >
                  <Statistic
                    title="Magnetic Force (F)"
                    value={forceLorentz.toExponential(2)}
                    suffix="N"
                    valueStyle={{ fontSize: "1.2rem", fontWeight: "bold" }}
                  />
                  <Statistic
                    title="Orbit Radius (r)"
                    value={
                      radiusCyclotron === Infinity
                        ? "Straight"
                        : (radiusCyclotron * 1e8).toFixed(2)
                    }
                    suffix={radiusCyclotron === Infinity ? "" : "×10⁻⁸ m"}
                    valueStyle={{ fontSize: "1.2rem", fontWeight: "bold" }}
                  />
                  <Statistic
                    title="Cyclotron Period (T)"
                    value={
                      periodCyclotron === Infinity
                        ? "N/A"
                        : (periodCyclotron * 1e9).toFixed(2)
                    }
                    suffix={periodCyclotron === Infinity ? "" : "ns"}
                    valueStyle={{ fontSize: "1.2rem", fontWeight: "bold" }}
                  />
                  <Statistic
                    title="Charge Type"
                    value={
                      effectiveCharge > 0
                        ? "Positive (+)"
                        : effectiveCharge < 0
                          ? "Negative (-)"
                          : "Neutral"
                    }
                    valueStyle={{
                      fontSize: "1.1rem",
                      color:
                        effectiveCharge > 0
                          ? "var(--color-danger)"
                          : "var(--color-primary)",
                    }}
                  />
                </div>

                <Alert
                  className="mt-4"
                  type="info"
                  showIcon
                  message="Grade 10 Insight: Centripetal Lorentz Force"
                  description="When a charged particle moves perpendicular to a uniform magnetic field, the magnetic force F = q(v × B) is always perpendicular to velocity. This provides a centripetal force F = mv²/r, forcing the particle into a circular orbit!"
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* TAB 2: Current-Carrying Wire Simulator */}
        {activeTab === "wire" && (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <Card
                title={
                  <span className="flex items-center gap-2 font-semibold">
                    <LuZap className="text-yellow-500" /> Current Wire
                    Parameters
                  </span>
                }
              >
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Electric Current (I)</span>
                      <Tag color={wireCurrent >= 0 ? "green" : "volcano"}>
                        {wireCurrent >= 0 ? "Right →" : "← Left"}{" "}
                        {Math.abs(wireCurrent)} A
                      </Tag>
                    </div>
                    <Slider
                      min={-10}
                      max={10}
                      value={wireCurrent}
                      onChange={setWireCurrent}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Wire Length in Field (L)</span>
                      <span>{wireLength} meters</span>
                    </div>
                    <Slider
                      min={0.1}
                      max={2.0}
                      step={0.1}
                      value={wireLength}
                      onChange={setWireLength}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>External Magnetic Field (B)</span>
                      <span>{wireBField} Tesla</span>
                    </div>
                    <Slider
                      min={0}
                      max={3.0}
                      step={0.1}
                      value={wireBField}
                      onChange={setWireBField}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Angle between Wire and B-field (θ)</span>
                      <span>{wireAngle}°</span>
                    </div>
                    <Slider
                      min={0}
                      max={90}
                      value={wireAngle}
                      onChange={setWireAngle}
                    />
                  </div>

                  <Divider />

                  <Alert
                    type="warning"
                    showIcon
                    message="Formula: F = I · L · B · sin(θ)"
                    description={`F = (${Math.abs(wireCurrent)} A) × (${wireLength} m) × (${wireBField} T) × sin(${wireAngle}°) = ${wireForce.toFixed(
                      3,
                    )} N`}
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={14}>
              <Card
                title={
                  <span className="flex items-center gap-2 font-semibold">
                    Visual Wire Deflection & Force Vector
                  </span>
                }
              >
                <div className="relative flex flex-col items-center justify-center p-8 bg-slate-900 rounded-lg border border-border min-h-[360px]">
                  {/* B-Field Background Grid */}
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 p-4 pointer-events-none opacity-30">
                    {Array.from({ length: 24 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-center text-red-400 font-bold text-xl"
                      >
                        ⊗
                      </div>
                    ))}
                  </div>

                  {/* Wire Diagram */}
                  <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                    {/* Magnetic Force Arrow */}
                    <div
                      className="transition-all duration-300 flex flex-col items-center mb-4"
                      style={{
                        transform: `translateY(${
                          wireCurrent > 0 ? -wireForce * 15 : wireForce * 15
                        }px)`,
                      }}
                    >
                      {wireForce > 0.01 && (
                        <div className="flex flex-col items-center">
                          <Tag color="gold" className="text-sm font-bold mb-1">
                            F_mag = {wireForce.toFixed(2)} N (
                            {wireCurrent >= 0 ? "UP" : "DOWN"})
                          </Tag>
                          <LuArrowRight
                            className={`h-10 w-10 text-yellow-400 font-bold transition-transform duration-300 ${
                              wireCurrent >= 0 ? "-rotate-90" : "rotate-90"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Conductive Wire */}
                    <div className="w-full h-6 bg-amber-600 rounded-full flex items-center justify-between px-4 shadow-lg border-2 border-amber-300 relative">
                      <span className="text-xs font-bold text-white">
                        [- Terminal]
                      </span>
                      {/* Current Motion Animation */}
                      <div className="flex items-center space-x-6 overflow-hidden w-3/4 justify-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-3 w-3 rounded-full bg-yellow-300 transition-transform duration-500 ${
                              wireCurrent > 0 ? "animate-pulse" : ""
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-white">
                        [+ Terminal]
                      </span>
                    </div>

                    {/* Current Direction Indicator */}
                    <div className="mt-3 flex items-center gap-2">
                      <LuArrowRight
                        className={`h-6 w-6 text-emerald-400 transition-transform duration-300 ${
                          wireCurrent < 0 ? "rotate-180" : ""
                        }`}
                      />
                      <span className="text-sm font-semibold text-emerald-400">
                        Current Flow (I = {wireCurrent} A)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-lg bg-card border border-border">
                  <Typography.Title level={5} className="mt-0">
                    Grade 10 Concept: The Motor Effect
                  </Typography.Title>
                  <Typography.Paragraph
                    type="secondary"
                    className="mb-0 text-sm"
                  >
                    When free electrons drift through a conductor placed inside
                    an external magnetic field B, each moving electron
                    experiences a magnetic force. The combined microscopic
                    forces push the whole wire physically! This is the core
                    operating principle behind electric motors, speakers, and
                    galvanometers.
                  </Typography.Paragraph>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* TAB 3: Parallel Wires Attraction & Repulsion */}
        {activeTab === "parallel" && (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <Card
                title={
                  <span className="flex items-center gap-2 font-semibold">
                    <LuLayers className="text-primary" /> Parallel Wires
                    Controls
                  </span>
                }
              >
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Wire 1 Current (I₁)</span>
                      <Tag color={current1 >= 0 ? "blue" : "volcano"}>
                        {current1 >= 0 ? "▲ Upward" : "▼ Downward"} (
                        {Math.abs(current1)} A)
                      </Tag>
                    </div>
                    <Slider
                      min={-15}
                      max={15}
                      value={current1}
                      onChange={setCurrent1}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Wire 2 Current (I₂)</span>
                      <Tag color={current2 >= 0 ? "blue" : "volcano"}>
                        {current2 >= 0 ? "▲ Upward" : "▼ Downward"} (
                        {Math.abs(current2)} A)
                      </Tag>
                    </div>
                    <Slider
                      min={-15}
                      max={15}
                      value={current2}
                      onChange={setCurrent2}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>Distance between Wires (d)</span>
                      <span>{(wireDistance * 100).toFixed(1)} cm</span>
                    </div>
                    <Slider
                      min={0.01}
                      max={0.2}
                      step={0.01}
                      value={wireDistance}
                      onChange={setWireDistance}
                    />
                  </div>

                  <Divider />

                  <Statistic
                    title="Force Per Unit Length (F / L)"
                    value={forcePerLength.toExponential(3)}
                    suffix="N/m"
                    valueStyle={{
                      color: isAttracting
                        ? "var(--color-success)"
                        : "var(--color-danger)",
                      fontWeight: "bold",
                    }}
                  />

                  <Alert
                    type={isAttracting ? "success" : "error"}
                    showIcon
                    message={
                      isAttracting
                        ? "ATTRACTION (Parallel Currents)"
                        : "REPULSION (Anti-Parallel Currents)"
                    }
                    description={
                      isAttracting
                        ? "Currents flowing in the SAME direction produce magnetic fields that pull the conductors TOGETHER."
                        : "Currents flowing in OPPOSITE directions produce magnetic fields that push the conductors APART."
                    }
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={14}>
              <Card title="Interactive Field & Force Visualization">
                <div className="relative flex items-center justify-around p-8 bg-slate-900 rounded-lg border border-border min-h-[380px]">
                  {/* Wire 1 */}
                  <div className="flex flex-col items-center space-y-3">
                    <Tag color="blue" className="font-bold">
                      Wire 1 (I₁ = {current1} A)
                    </Tag>
                    <div className="w-8 h-64 bg-slate-700 rounded-lg border-2 border-blue-400 flex flex-col justify-around items-center relative">
                      <LuArrowRight
                        className={`h-8 w-8 text-blue-400 font-bold transition-transform duration-300 ${
                          current1 >= 0 ? "-rotate-90" : "rotate-90"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Center Interaction Arrows */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="text-center">
                      <span className="text-xs text-slate-400">
                        Distance d = {(wireDistance * 100).toFixed(1)} cm
                      </span>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Force Arrow on Wire 1 */}
                      <LuArrowRight
                        className={`h-8 w-8 transition-all duration-300 ${
                          isAttracting
                            ? "text-emerald-400 translate-x-2"
                            : "text-red-400 -rotate-180 -translate-x-2"
                        }`}
                      />
                      {/* Force Arrow on Wire 2 */}
                      <LuArrowRight
                        className={`h-8 w-8 transition-all duration-300 ${
                          isAttracting
                            ? "text-emerald-400 rotate-180 -translate-x-2"
                            : "text-red-400 translate-x-2"
                        }`}
                      />
                    </div>

                    <Tag
                      color={isAttracting ? "emerald" : "red"}
                      className="text-sm font-bold"
                    >
                      {isAttracting ? "Attraction Force" : "Repulsion Force"}
                    </Tag>
                  </div>

                  {/* Wire 2 */}
                  <div className="flex flex-col items-center space-y-3">
                    <Tag color="purple" className="font-bold">
                      Wire 2 (I₂ = {current2} A)
                    </Tag>
                    <div className="w-8 h-64 bg-slate-700 rounded-lg border-2 border-purple-400 flex flex-col justify-around items-center relative">
                      <LuArrowRight
                        className={`h-8 w-8 text-purple-400 font-bold transition-transform duration-300 ${
                          current2 >= 0 ? "-rotate-90" : "rotate-90"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* TAB 4: Grade 10 Interactive Quiz */}
        {activeTab === "quiz" && (
          <Card
            title={
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <LuInfo className="text-primary" /> Grade 10 Knowledge Check
                </span>
                {submittedQuiz && (
                  <Tag color="cyan" className="text-sm font-bold py-1 px-3">
                    Score: {calculateScore()} / {QUIZ_QUESTIONS.length}
                  </Tag>
                )}
              </div>
            }
          >
            <div className="space-y-6">
              {QUIZ_QUESTIONS.map((q, idx) => {
                const isCorrect = userAnswers[q.id] === q.answer;

                return (
                  <Card
                    key={q.id}
                    type="inner"
                    title={`Question ${idx + 1}: ${q.question}`}
                    className="border-border"
                  >
                    <Radio.Group
                      onChange={(e) =>
                        handleSelectQuizOption(q.id, e.target.value)
                      }
                      value={userAnswers[q.id]}
                      disabled={submittedQuiz}
                      className="w-full space-y-2"
                    >
                      <Space direction="vertical" className="w-full">
                        {q.options.map((opt, optIdx) => (
                          <Radio
                            key={optIdx}
                            value={optIdx}
                            className="p-2 rounded border border-border w-full hover:bg-slate-800/50"
                          >
                            {opt}
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>

                    {submittedQuiz && (
                      <div className="mt-4 p-3 rounded bg-slate-900 border border-border">
                        {isCorrect ? (
                          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                            <LuCheck /> Correct!
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-400 font-semibold">
                            <LuX /> Incorrect. Correct Answer:{" "}
                            {q.options[q.answer]}
                          </div>
                        )}
                        <p className="mt-1 text-sm text-slate-300 mb-0">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  onClick={() => {
                    setUserAnswers({});
                    setSubmittedQuiz(false);
                  }}
                >
                  Reset Quiz
                </Button>
                <Button
                  type="primary"
                  onClick={() => setSubmittedQuiz(true)}
                  disabled={Object.keys(userAnswers).length === 0}
                >
                  Submit & Check Answers
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* TAB 5: Formulas & Right-Hand Rule Guide */}
        {activeTab === "formulas" && (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="flex items-center gap-2 font-semibold">
                    <LuBookOpen className="text-primary" /> Key Grade 10
                    Formulas
                  </span>
                }
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-900 border border-border">
                    <Typography.Text
                      strong
                      className="text-yellow-400 block text-base"
                    >
                      1. Lorentz Force on a Moving Charge
                    </Typography.Text>
                    <code className="text-lg text-emerald-300 font-mono block my-2">
                      F = |q| · v · B · sin(θ)
                    </code>
                    <Typography.Paragraph
                      type="secondary"
                      className="mb-0 text-sm"
                    >
                      Where <b>F</b> is magnetic force (N), <b>q</b> is charge
                      (C), <b>v</b> is speed (m/s), <b>B</b> is magnetic field
                      (T), and <b>θ</b> is angle between velocity and B-field.
                    </Typography.Paragraph>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-900 border border-border">
                    <Typography.Text
                      strong
                      className="text-yellow-400 block text-base"
                    >
                      2. Radius of Circular Motion (Cyclotron Radius)
                    </Typography.Text>
                    <code className="text-lg text-emerald-300 font-mono block my-2">
                      r = (m · v) / (|q| · B)
                    </code>
                    <Typography.Paragraph
                      type="secondary"
                      className="mb-0 text-sm"
                    >
                      Equating magnetic force to centripetal force:{" "}
                      <b>|q|vB = m v² / r</b>.
                    </Typography.Paragraph>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-900 border border-border">
                    <Typography.Text
                      strong
                      className="text-yellow-400 block text-base"
                    >
                      3. Magnetic Force on Current Wire
                    </Typography.Text>
                    <code className="text-lg text-emerald-300 font-mono block my-2">
                      F = I · L · B · sin(θ)
                    </code>
                    <Typography.Paragraph
                      type="secondary"
                      className="mb-0 text-sm"
                    >
                      Where <b>I</b> is electric current (A) and <b>L</b> is
                      length of conductor inside B-field.
                    </Typography.Paragraph>
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="flex items-center gap-2 font-semibold">
                    <LuCompass className="text-primary" /> Right-Hand Rule (RHR
                    #1) Guide
                  </span>
                }
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-slate-900 border border-border space-y-3">
                    <Tag color="red" className="text-sm font-bold">
                      Step-by-Step RHR #1 for Positive Charges (+q)
                    </Tag>
                    <ul className="list-disc list-inside space-y-2 text-sm text-slate-200">
                      <li>
                        <b>Index Finger:</b> Point in direction of velocity (
                        <b>v</b>) or conventional current (<b>I</b>).
                      </li>
                      <li>
                        <b>Middle Finger:</b> Point in direction of magnetic
                        field (<b>B</b>).
                      </li>
                      <li>
                        <b>Thumb:</b> Points in direction of magnetic force (
                        <b>F</b>).
                      </li>
                    </ul>
                  </div>

                  <Alert
                    type="error"
                    showIcon
                    message="Critical Warning for Electrons / Negative Charges (-q)"
                    description="For negative charges (such as electrons e⁻), apply the Right-Hand Rule as usual, then REVERSE the resulting force direction by 180°!"
                  />

                  <Collapse
                    items={[
                      {
                        key: "1",
                        label: "Real-World Application: Electric Motors",
                        children: (
                          <p className="text-sm text-slate-300">
                            Electric motors pass current through wire coils
                            placed in magnetic fields. The magnetic force pushes
                            opposite sides of the coil in opposite directions,
                            creating continuous torque that turns the motor
                            shaft!
                          </p>
                        ),
                      },
                      {
                        key: "2",
                        label: "Real-World Application: Mass Spectrometry",
                        children: (
                          <p className="text-sm text-slate-300">
                            By measuring the circular orbit radius r = mv/(qB)
                            of ionized atoms in a known magnetic field,
                            scientists can precisely weigh individual isotopes
                            and identify unknown chemical compounds.
                          </p>
                        ),
                      },
                    ]}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </main>
  );
}
