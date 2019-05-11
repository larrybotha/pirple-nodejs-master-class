type HorizontalLine = () => void;
const horizontalLine: HorizontalLine = () => {
  const {columns: width} = process.stdout;
  const line = Array.from({length: width})
    .fill('-')
    .join('');

  // tslint:disable-next-line
  console.log(line);
};

type CentereText = (s: string) => void;
const centeredText: CentereText = str => {
  const normalizedStr = str.trim();
  const {columns: width} = process.stdout;
  const leftPadding = Array.from({
    length: Math.floor((width - normalizedStr.length) / 2),
  })
    .fill(' ')
    .join('');

  // tslint:disable-next-line
  console.log(`${leftPadding}${normalizedStr}`);
};

type VerticalSpace = (n?: number) => void;
const verticalSpace: VerticalSpace = (n = 1) => {
  // tslint:disable-next-line
  Array.from({length: n}).map(() => console.log(''));
};

type LogObjectToStdOut = (
  obj: {[key: string]: string | number},
  title?: string
) => void;
const logObjectToStdOut: LogObjectToStdOut = (obj, title) => {
  if (title) {
    horizontalLine();
    centeredText(title);
    horizontalLine();
  }

  const longestKeyLength = Object.keys(obj)
    .sort((a, b) => (a.length > b.length ? -1 : 1))
    .find(Boolean).length;

  Object.entries(obj).map(([key, value]) => {
    const line = `\x1b[33m${key}\x1b[0m`;
    const padding = Array.from({length: longestKeyLength - key.length + 3})
      .fill(' ')
      .join('');

    // tslint:disable-next-line
    console.log([line, padding, value].join(''));
  });
};

export {centeredText, horizontalLine, logObjectToStdOut, verticalSpace};
