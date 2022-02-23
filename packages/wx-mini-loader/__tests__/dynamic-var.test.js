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

test('template2Set: 非循环组件含有index等特殊变量 is ok', () => {
    const data = template2Set(`
    <div>
        {{li}}
        <div>{{index}}</div>
        <div v-for="(li,index) in list"></div>
    </div>
    `);
    const data2 = template2Set(`
    <div>      
        <div v-for="(li,index) in list"></div>
        <div>{{index}}</div>
        {{li}}
    </div>
    `);

    expect(data.has('index')).toBe(true);
    expect(data.has('li')).toBe(true);
    expect(data2.has('index')).toBe(true);
    expect(data2.has('li')).toBe(true);
});

test('template2Set: 循环组件嵌套组件 is ok', () => {
    const data = template2Set(`
    <div v-for="li in petList" :key="li.id" class="pet-item" @click="goPetHome(li.id)">
    <div class="pet-avatar">
        <img :src="li.avatar" class="g-img" alt />
    </div> 
</div>`);

    expect(data.has('li')).toBe(false);
});

test('createSetupString: <div>{{hello}}</div> is ok', () => {
    const oldCode = `const a = pp({b:1})`;
    const data = createSetupString(oldCode, ['a']);
    expect(data).toMatch('__SETUP__');
    expect(data).toMatch('const a = pp({b:1})');
    expect(data).toMatch('a:');
});
