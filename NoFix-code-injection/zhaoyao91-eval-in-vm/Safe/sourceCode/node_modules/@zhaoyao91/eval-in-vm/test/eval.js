const tap = require("tap");

const eval = require("../index");

tap.test("eval a math expression", async t => {
  const expression = "1 + 2";
  const result = eval(expression);
  t.equal(result, 3);
});

tap.test("eval a function", async t => {
  const expression = `
    (a, b) => {
      return a + b
    }
  `;
  const fn = eval(expression);
  const result = fn(1, 2);
  t.equal(result, 3);
});

tap.test("eval with context", async t => {
  const context = {
    a: 1,
    b: 2
  };
  const expression = "a + b + 3";
  const result = eval(expression, context);
  t.equal(result, 6);
});

tap.test("eval in sandbox", async t => {
  const a = 1;
  const expression = "a + 2";
  t.throw(() => eval(expression));
});
