import { pp, ppRef, pComputed } from "../index.js";

test("pp proxy is ok", () => {
    const data = pp({ a: 1 });
    expect(data.a).toBe(1);
    data.a = { b: 2 };
    expect(data.a.b).toBe(2);
});

test("ppRef proxy is ok", () => {
    const data = ppRef(1);
    expect(data.value).toBe(1);
    data.value = { b: 2 };
    expect(data.value.b).toBe(2);
});

test("pComputed proxy is ok", () => {
    const data = ppRef(1);
    const cData = pComputed(() => data.value + 1);
    data.value = 2;
    expect(cData.value).toBe(3);
});

test("array push is  ok", () => {
    const data = ppRef([1, 2]);

    data.value.push(3);
    expect(data.value[2]).toBe(3);

    data.value.length = 2;
    expect(data.value[0]).toBe(1);
    expect(data.value[1]).toBe(2);
    expect(data.value.length).toBe(2);
});

test("array splice is  ok", () => {
    const data = ppRef([1, 2, 3, 4]);

    data.value.splice(2, 1);
    expect(data.value.length).toBe(3);

    expect(data.value[0]).toBe(1);
    expect(data.value[1]).toBe(2);
    expect(data.value[2]).toBe(4);
});
