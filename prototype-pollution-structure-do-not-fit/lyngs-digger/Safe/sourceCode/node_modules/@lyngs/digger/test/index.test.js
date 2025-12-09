
import { expect } from 'chai';
import digger from '../dist';

const usage = {
  current: 0,
  people: [
    { name: 'shook' },
    { name: 'oral' },
  ],
};

describe('get by digger()', () => {
  it('get value normally', () => {
    expect(digger(usage, 'people[0].name')).to.equal('shook');
  });
  it(`get value by passing a path that doesn't exist`, () => {
    expect(digger(usage, 'people[2].name')).to.equal(void 0);
  });
});

describe('set by digger()', () => {
  it(`set value normally`, () => {
    expect(digger(usage, 'people[0].name', 'shook-edited')).to.equal('shook-edited');
  });

  it(`set value by passing update(), with no extra setting`, () => {
    console.log(digger(usage, 'people[0].name', () => 'shook-edited-2'));
    expect(digger(usage, 'people[0].name', () => 'shook-edited-2')).to.be.a('function');
  });

  it(`set value by passing update(), and pass param 'untie' as true`, () => {
    expect(digger(usage, 'people[0].name', () => 'shook-edited-3', {
      untie: true
    })).to.equal('shook-edited-3');
  });

  it(`set value by passing a path that doesn't exist`, () => {
    expect(digger(usage, 'people[2].name', 'undefined-edited')).to.equal(void 0);
  });

  it(`set value by passing a path that doesn't exist, and pass param 'extend' as true`, () => {
    expect(digger(usage, 'people[2].name', 'undefined-edited', {
      extend: true,
    })).to.equal('undefined-edited');
  });
});