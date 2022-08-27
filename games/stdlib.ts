// clsしか出来ないので引数は"cls"しか受け付けない。無駄だが気分で
export function system(command: 'cls') {
  if (command === 'cls') {
    process.stdout.write('\x1b[2J\x1b[1;1H');
  }
}

