const { stdin } = process;

stdin.setEncoding('utf-8');
stdin.setRawMode(true); // 1キー押すたびに動くようにする

// _getchもどき (await必要)
export function _getch(): Promise<string> {
  return new Promise((res) => {
    stdin.resume();
    stdin.once('data', (data) => {
      const str = data.toString();
      if (str === '\x03') process.exit(0);
      stdin.pause();
      res(str);
    });
  });
}

// printfもどき
export function printf(prompt: string, ...args: (string | number)[]) {
  process.stdout.write(prompt.replace(/%(s|d)/g, (m) => `${args.shift() ?? ''}`));
}
