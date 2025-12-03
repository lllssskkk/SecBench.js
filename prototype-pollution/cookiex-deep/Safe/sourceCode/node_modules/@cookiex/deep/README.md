# CX. Deep

Deep is a library for joining object recursive in one target

---

## Install

```sh
yarn add @cookiex/deep
# or
npm install --save @cookiex/deep
```

---

## Usage

```js
import deep from '@cookiex/deep'

const target = { a: 'some string', b: 102, c: { g: true } }

deep( target, { f: false, c: { h: Symbol( 'property c.h' ) }, a: 'another string' } )
// => target

target
// => { a: 'another string', b: 102, c: { g: true, h: Symbol( 'property c.h' ), f: false } }

```

### Register custom method

```js
import deep from '@cookiex/deep'

const customDeep = deep.register( 'custom', ( a: any, b: any ) => {
  if ( typeof b === 'object' || typeof a === 'object' )
    if ( Array.isArray( a ) )
      if ( Array.isArray( b ) ) return [ ...a, ...b ]

      else if ( Object.keys( b ).every( key => typeof key === 'number' ) )
        return customDeep( a, b )

      else return [ ...a, b ]

    else if ( Array.isArray( b ) )
      return [ a, ...b ]

    else if ( typeof b === 'object' && typeof a === 'object' )
      return customDeep( a, b )

  return b
} )
```
### Using typescript
```ts
declare global {
  /**
   * properties in this interface are the registered methods.
   * If you use typescript and don't register the methods here, you will receive an error!
   */
  export interface DeepMethods<L, R> {
    custom: L extends any[] | readonly any[]
      ? R extends any[] | readonly any[] ? [ ...L, ...R ] : [ ...L, R ]
      : R extends any[] | readonly any[] ? [ L, ...R ] :
        L extends { [key: string]: any }
          ? R extends { [key: string]: any } ?
            & { [K in keyof L]: K extends keyof R ? methods<L[K], R[K]>['custom'] : L[K] }
            & { [K in keyof R]: K extends keyof L ? methods<L[K], R[K]>['custom'] : R[K] }
            : R
          : R
  }
}
```


