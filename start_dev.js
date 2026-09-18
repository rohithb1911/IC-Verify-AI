const { spawn, execSync } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const isWin = process.platform === 'win32';

// ANSI escape codes for styling
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}====================================================${RESET}`);
console.log(`${BOLD}${CYAN}    IC VERIFY AI — Optical Inspection Platform      ${RESET}`);
console.log(`${BOLD}${CYAN}====================================================${RESET}`);
console.log(`${YELLOW}Starting FastAPI Backend and React Frontend concurrently...${RESET}\n`);

// Determine python command (python or python3)
let pythonCmd = 'python';
try {
  execSync('python --version', { stdio: 'ignore' });
} catch (e) {
  try {
    execSync('python3 --version', { stdio: 'ignore' });
    pythonCmd = 'python3';
  } catch (e2) {
    console.error(`${RED}Error: Neither 'python' nor 'python3' was found in PATH.${RESET}`);
  }
}

// 1. Spawn FastAPI Backend
console.log(`${CYAN}[BACKEND]${RESET} Launching FastAPI server on http://127.0.0.1:8000 ...`);
const backendProc = spawn(pythonCmd, ['main.py'], {
  cwd: path.join(rootDir, 'backend'),
  shell: true,
  env: { ...process.env, PYTHONUNBUFFERED: '1' }
});

backendProc.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.log(`${CYAN}[BACKEND]${RESET} ${line}`);
    }
  });
});

backendProc.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.log(`${CYAN}[BACKEND]${RESET} ${line}`);
    }
  });
});

// 2. Spawn React Frontend
console.log(`${MAGENTA}[FRONTEND]${RESET} Launching Vite development server ...`);
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const frontendProc = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  shell: true
});

frontendProc.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.log(`${MAGENTA}[FRONTEND]${RESET} ${line}`);
    }
  });
});

frontendProc.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.log(`${MAGENTA}[FRONTEND]${RESET} ${line}`);
    }
  });
});

// Cleanup logic for clean shutdown
function killProcess(proc, name) {
  if (!proc || !proc.pid) return;
  try {
    if (isWin) {
      execSync(`taskkill /pid ${proc.pid} /f /t`, { stdio: 'ignore' });
    } else {
      process.kill(-proc.pid, 'SIGKILL');
    }
  } catch (e) {
    try { proc.kill(); } catch (err) {}
  }
}

let cleanedUp = false;
function cleanup() {
  if (cleanedUp) return;
  cleanedUp = true;
  console.log(`\n${YELLOW}Shutting down IC Verify AI development servers...${RESET}`);
  killProcess(backendProc, 'Backend');
  killProcess(frontendProc, 'Frontend');
  console.log(`${GREEN}All processes terminated cleanly.${RESET}`);
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
