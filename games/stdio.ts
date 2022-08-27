import { readSync } from 'fs';

process.stdin.setRawMode(true);

export function _getch() {
  const buffer = Buffer.alloc(10);
  readSync(process.stdin.fd, buffer);
  const userInput = buffer.toString('utf8').replace(/\x00+$/, '');

  // Ctrl+Cが押されたら終了
  if (userInput === '\x03') process.exit(0);

  return userInput;
}

