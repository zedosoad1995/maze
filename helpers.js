export const randInt = (from, to) => {
  return Math.ceil(Math.random() * (to - from + 1)) + from - 1;
};

export const randFromArray = (arr) => {
  const randIdx = randInt(0, arr.length - 1);
  return arr.length ? { el: arr[randIdx], idx: randIdx } : {};
};
