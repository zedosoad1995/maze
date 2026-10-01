export const randInt = (from, to) => {
  return Math.ceil(Math.random() * (to - from + 1)) + from - 1;
};

export const randFromArray = (arr) => {
  return arr.length ? arr[randInt(0, arr.length - 1)] : undefined;
};
