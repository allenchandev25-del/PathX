# PathX: Autonomous Vehicle Path Prediction Simulator

PathX is a high-fidelity mathematical simulator designed to model autonomous vehicle behavior. Developed as an academic project for Karunya University, it bridges complex kinematic models with real-time web-based visualization.

## 🚀 Key Features

- **Kinematic Simulation**: Real-time modeling of vehicle dynamics using the kinematic bicycle model.
- **Dual Operating Modes**:
  - 🎮 **Manual**: Direct control over steering velocity and thrust output.
  - 🤖 **Autonomous**: Path tracking using Pure Pursuit algorithms at 60Hz.
- **Advanced Telemetry**: Live visualization of velocity profiles, steering vectors, and system stability.
- **Modern UI/UX**: Premium dark-mode interface with glassmorphism and real-time data visualization.

## 🛠️ Tech Stack

### Core Technologies
- **Frontend Framework**: [React 19](https://react.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)

### Libraries & Tools
- **Animation**: [Motion](https://motion.dev/) (Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Engine**: [Google Gemini API](https://ai.google.dev/)
- **Backend**: [Express](https://expressjs.com/)
- **Database**: [Better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **Utility**: [Clsx](https://github.com/lukeed/clsx), [Tailwind Merge](https://github.com/dcastil/tailwind-merge)

## 📐 Mathematical Foundation

The simulator is built upon core mathematical principles:

- **Partial Differential Equations (PDEs)**: Used to model continuous state changes and field-based pathfinding.
- **Vector Spaces**: State-space representation where position, velocity, and heading are treated as vectors.
- **Inner Product Spaces**: Euclidean distance metrics and projections for precise path tracking and obstacle avoidance.
- **Laplace Transforms**: Control system stability analysis in the frequency domain to ensure smooth, stable steering responses.

## 🛠️ Technical Implementation

- **Euler Integration**: Solving kinematic differential equations in real-time.
- **Frontend Stack**: Built with React, Vite, and Tailwind CSS.
- **Animations**: Powered by `motion/react` (Framer Motion) for fluid UI transitions.
- **Architecture**: Modular design separating math models from rendering components.

## 🏁 Run Locally

**Prerequisites:** Node.js (v18+)

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configuration**:
   Copy `.env.example` to `.env.local` and set your `GEMINI_API_KEY`:
   ```bash
   cp .env.example .env.local
   ```

3. **Launch Development Server**:
   ```bash
   npm run dev
   ```

---