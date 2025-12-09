import { expect } from 'chai';
import { merge } from '../dist';

describe(`merge <Object/Array>`, () => {
  it('[ number, string ]', () => {
    const target   = { name: 'shook', 1: 16 },
          compare  = { name: 'oral' },
          compare2 = { 1: 17 },
          result   = { name: 'oral', 1: 17 };

    expect(merge(target, compare, compare2)).to.eql(result);
  });

  it('[ symbol ]', () => {
    const symbol   = Symbol('symbol'),
          target   = { [symbol]: 'shook' },
          compare  = { [symbol]: 'oral' },
          result   = { [symbol]: 'oral' };
    expect(merge(target, compare)).to.eql(result);
  });

  it('[ object, array, number, string ]', () => {
    const target   = { family: {} },
          compare  = { family: { children: [ { name: 'LL', age: 0 } ] } },
          compare2 = { family: { children: [ { age: 1 } ] } },
          result   = { family: { children: [ { name: 'LL', age: 1 } ] } };
    expect(merge(target, compare, compare2)).to.eql(result);
  });

  // TODO - fix the circular problem
  /*it('[ loop calling ]', () => {
    let   target  = { name: 'shook' },
          compare = { target };

    target.compare = compare;

    const result  = { name: 'shook', target, compare };

    expect(merge(target, compare)).to.eql(result);
  });*/
});

describe(`merge <Set>`, () => {
  it('[ number ]', () => {
    const target  = new Set([ 1, 2, 3 ]),
          compare = new Set([ 2, 3, ]),
          result  = new Set([ 2, 3 ]);
    expect(merge(target, compare)).to.eql(result);
  });

  it('[ symbol, number, string ]', () => {
    const symbol   = Symbol('symbol'),
          target   = new Set([ symbol ]),
          compare  = new Set([ symbol, 1, '3' ]),
          compare2 = new Set([ symbol, 2 ]),
          result   = [ symbol, 2, '3' ];
    expect([ ...merge(target, compare, compare2) ]).to.eql(result);
  });
});

describe(`merge <Map>`, () => {
  it('[ string, number ]', () => {
    const target   = new Map([ [ 'name', 'shook' ], [ 'age', 16 ] ]),
          compare  = new Map([ [ 'name', 'oral' ] ]),
          compare2 = new Map([ [ 'age', 17 ] ]),
          result   = new Map([ [ 'name', 'oral' ], [ 'age', 17 ] ]);
    expect(merge(target, compare, compare2)).to.eql(result);
  });

  it('[ symbol ]', () => {
    const symbol   = Symbol('symbol'),
          target   = new Map([ [ symbol, 'shook' ] ]),
          compare  = new Map([ [ symbol, 'oral' ] ]),
          result   = new Map([ [ symbol, 'oral' ] ]);
    expect(merge(target, compare)).to.eql(result);
  });
});