import * as vm from 'vm';

/*
 * create a context against which the vm will run
 */
const context = {
  foo: 2,
};

/*
 * create a script to run within the context
 */
const script = new vm.Script(`
  foo = foo * 2;
  var bar = foo + 1;
  var fizz = 52
`);

/*
 * run the context
 */
script.runInNewContext(context);

console.log(context);
