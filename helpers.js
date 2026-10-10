export const randInt = (from, to) => {
  return Math.ceil(Math.random() * (to - from + 1)) + from - 1;
};

export const randFromArray = (arr) => {
  const randIdx = randInt(0, arr.length - 1);
  return arr.length ? { el: arr[randIdx], idx: randIdx } : {};
};

export const minMax = (val, minMaxArr) => {
  const minVal = Math.min(...minMaxArr);
  const maxVal = Math.max(...minMaxArr);

  return Math.min(maxVal, Math.max(minVal, val));
};
