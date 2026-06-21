import { spawn } from 'node:child_process';

const children = [
  spawn('npm', ['--prefix', 'back', 'run', 'start:dev'], {
    stdio: 'inherit',
    shell: true,
  }),
  spawn('npm', ['--prefix', 'front', 'run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  }),
];

const exit = (code) => {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exit(code ?? 0);
};

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      exit(code);
    }
  });
  child.on('error', () => exit(1));
}

process.on('SIGINT', () => exit(0));
process.on('SIGTERM', () => exit(0));
