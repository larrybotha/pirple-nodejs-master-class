import * as assert from 'assert';

type Done = () => void;

interface Unit {
  [key: string]: any;
}

const unit: Unit = {};

const getANumber = () => 1;

console.log('-=========');

console.log(require.main);
console.log(module);

console.log('-=========');

unit['getANumber should return a number'] = (done: Done) => {
  const result = getANumber();

  assert.equal(typeof result, 'number');
  done();
};

unit['getANumber should returns 1'] = (done: Done) => {
  const result = getANumber();

  assert.equal(result, 1);
  done();
};

unit['getANumber should returns 2'] = (done: Done) => {
  const result = getANumber();

  assert.equal(result, 2);
  done();
};

export {unit};
