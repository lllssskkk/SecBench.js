const vm = require("vm");

module.exports = function safeEval(code, context, options) {
  const sandbox = { ...context };

  const resultKey =
    "EVAL_RESULT_" + Math.floor(Number.MAX_SAFE_INTEGER * Math.random());

  const finalCode = resultKey + "=" + code;

  vm.runInNewContext(finalCode, sandbox, options);

  return sandbox[resultKey];
};
