import { pp, ppRef } from '../index.js';

test('pp proxy is ok', () => {
    const data = pp({ a: 1 });
    expect(data.a).toBe(1);
});

test('ppRef proxy is ok', () => {
    const data = ppRef(1);
    expect(data.value).toBe(1);
});
