export const drawBoard = (h, w) => {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  process.stdout.write("\x1b[2J"); // clear terminal
  process.stdout.write("\x1b[H"); // go to top-right

  process.stdout.write("\n");
  process.stdout.write("\u250C");
  for (let i = 0; i < w; i++) {
    process.stdout.write("\u2500");
  }
  process.stdout.write("\u2510");

  for (let i = 0; i < h; i++) {
    process.stdout.write("\n");
    process.stdout.write("\u2502");
    for (let i = 0; i < w; i++) {
      process.stdout.write(" ");
    }
    process.stdout.write("\u2502");
  }

  process.stdout.write("\n");
  process.stdout.write("\u2514");
  for (let i = 0; i < w; i++) {
    process.stdout.write("\u2500");
  }
  process.stdout.write("\u2518");
};
