# Eval in VM

Eval js code in `vm` (`vm` is only available in node.js).

## Thanks

- [safe-eval](https://github.com/hacksparrow/safe-eval)

## Install

```bash
npm i @zhaoyao91/eval-in-vm
```

## Usage

```
const eval = require('@zhaoyao91/eval-in-vm')

const result = eval('1 + 2') // 3

const result = eval('a + 2', {a: 1}) // 3

const result = eval('b + 2') // Error !!!
```

## License

MIT
