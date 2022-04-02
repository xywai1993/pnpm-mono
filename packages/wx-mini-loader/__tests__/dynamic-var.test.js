const { template2Set, createSetupString } = require("../template-dynamic-var.cjs");

test("template2Set: <div>{{hello}}</div> is ok", () => {
    const template = `<div :class="[ani,'p'+index]">{{hello}} {{!show}}</div>`;
    const data = template2Set(template);
    expect(data.has("hello")).toBe(true);
    expect(data.has("ani")).toBe(true);
    expect(data.has("index")).toBe(true);
    expect(data.has("show")).toBe(true);

    const t2 = `<div>{{ audioPlayerData.play ? "暂停" : "试听" }}</div>`;
    const d2 = template2Set(t2);
    expect(d2.has("audioPlayerData")).toBe(true);
});

test("template2Set: v-if is ok", () => {
    const template = `<div v-if="!show" ></div>`;
    const data = template2Set(template);
    expect(data.has("show")).toBe(true);
});

test("template2Set: v-for index is ok", () => {
    const data = template2Set(`<div v-for="li in list"></div>`);
    const data2 = template2Set(`<div v-for="(li,index) in list">{{index}}</div>`);
    const data3 = template2Set(`<div v-for="(li,index) in list"><i v-if="index">{{li.id}}</i></div>`);

    [data, data2, data3].forEach((item) => {
        expect(item.has("list")).toBe(true);
        expect(item.has("index")).toBe(false);
        expect(item.has("li")).toBe(false);
    });
});

test("template2Set: 非循环组件含有index等特殊变量 is ok", () => {
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

    expect(data.has("index")).toBe(true);
    expect(data.has("li")).toBe(true);
    expect(data2.has("index")).toBe(true);
    expect(data2.has("li")).toBe(true);
});

test("template2Set: 循环组件嵌套组件 is ok", () => {
    const data = template2Set(`
    <div v-for="li in petList" :key="li.id"  >
    <div class="pet-avatar">
        <img :src="li.avatar" class="g-img" alt />
    </div> 
    <p class="mt-5 fs-12 fsw-6em">{{ li.nickname }}</p>
</div>`);

    expect(data.has("li")).toBe(false);
});

test("模板字符串 is OK", () => {
    const template = '<div :style="{backgroundColor:`${color}`}">      \n{{!show}}\n</div>';
    const data = template2Set(template);
    expect(data.has("color")).toBe(true);
});

test("v-model is ok ", () => {
    const template = '<input v-model="ddd">';
    const data = template2Set(template);
    expect(data.has("ddd")).toBe(true);

    const template2 = '<textarea v-model="text"></textarea>';
    const data2 = template2Set(template2);
    expect(data2.has("text")).toBe(true);
});

test("createSetupString: 补全setup is ok", () => {
    const oldCode = `const a = pp({b:1})`;
    const data = createSetupString(oldCode, ["a"]);
    expect(data).toMatch("__SETUP__");
    expect(data).toMatch("const a = pp({b:1})");
    expect(data).toMatch("a:");
});
