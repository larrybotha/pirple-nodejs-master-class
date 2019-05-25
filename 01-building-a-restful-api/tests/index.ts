import * as assert from 'assert';

const getANumber = () => 1;

interface Tests {
  [key: string]: {
    [key: string]: any;
  };
}
const tests: Tests = {
  unit: {},
};

type Done = () => void;

tests.unit['getANumber should return a number'] = (done: Done) => {
  const result = getANumber();

  assert.equal(typeof result, 'number');
  done();
};

tests.unit['getANumber should returns 1'] = (done: Done) => {
  const result = getANumber();

  assert.equal(result, 1);
  done();
};

tests.unit['getANumber should returns 2'] = (done: Done) => {
  const result = getANumber();

  assert.equal(result, 2);
  done();
};

const run = () => {
  let counter = 0;
  let errors: object[] = [];
  let limit = countTests();
  let successes = 0;

  Object.keys(tests).map(testType => {
    Object.keys(tests[testType]).map(testName => {
      const test = tests[testType][testName];

      try {
        test(() => {
          console.log('\x1b[32m%s\x1b[0m', testName);
          successes++;
        });
      } catch (error) {
        errors = errors.concat({
          name: testName,
          error,
        });
        console.log('\x1b[31m%s\x1b[0m', testName);
      } finally {
        counter++;

        if (counter === limit) {
          produceTestReport(limit, successes, errors);
        }
      }
    });
  });
};

const countTests = (): number => {
  return Object.keys(tests).reduce((acc, testType) => {
    return acc + Object.keys(tests[testType]).length;
  }, 0);
};

const produceTestReport = (
  limit: number,
  successes: number,
  errors: any[] = []
) => {
  console.log('\n-----------test report---------------\n');
  console.log('Total tests:', limit);
  console.log('Pass:', successes);
  console.log('Fail:', errors.length);

  if (errors.length) {
    console.log('\n-----------begin errors---------------\n');

    errors.map(error => {
      console.log('\x1b[31m%s\x1b[0m', error.name);
      console.log(error.error);
    });

    console.log('\n-----------end errors---------------\n');
  }

  console.log('\n-----------end test report---------------\n');
};

const testRunner = {
  run,
};

testRunner.run();

export {testRunner};
