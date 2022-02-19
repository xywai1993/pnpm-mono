const { template2Set, createSetupString } = require('../template-dynamic-var.cjs');

test('template2Set: <div>{{hello}}</div> is ok', () => {
    const template = `<div :class="[ani,'p'+index]">{{hello}}</div>`;
    const data = template2Set(template);
    expect(data.has('hello')).toBe(true);
    expect(data.has('ani')).toBe(true);
    expect(data.has('index')).toBe(true);
});

test('template2Set: v-for index is ok', () => {
    const data = template2Set(`<div v-for="li in list"></div>`);
    const data2 = template2Set(`<div v-for="(li,index) in list">{{index}}</div>`);
    const data3 = template2Set(`<div v-for="(li,index) in list"><i v-if="index">{{li.id}}</i></div>`);

    [data, data2, data3].forEach((item) => {
        expect(item.has('list')).toBe(true);
        expect(item.has('index')).toBe(false);
        expect(item.has('li')).toBe(false);
    });
});

test('createSetupString: <div>{{hello}}</div> is ok', () => {
    const oldCode = `const a = pp({b:1})`;
    const data = createSetupString(oldCode, ['a']);
    expect(data).toMatch('__SETUP__');
    expect(data).toMatch('const a = pp({b:1})');
    expect(data).toMatch('a:');
});
