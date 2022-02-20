import { pp, ppRef } from '../index.js';

test('pp proxy is ok', () => {
    const data = pp({ a: 1 });
    expect(data.a).toBe(1);
    data.a = { b: 2 };
    expect(data.a.b).toBe(2);
});

test('ppRef proxy is ok', () => {
    const data = ppRef(1);
    expect(data.value).toBe(1);
    data.value = { b: 2 };
    expect(data.value.b).toBe(2);
});
