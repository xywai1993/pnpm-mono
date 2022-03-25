const t2w = require("../vue.cjs");

test("<div>{{hello}}</div> is ok", () => {
    const template = `<div>{{hello}}</div>`;
    const data = t2w(template);
    expect(data).toMatch("<view>{{hello}}</view>");
});

test("v-if is ok", () => {
    const template = `<div v-if="show"></div>`;
    const data = t2w(template);
    expect(data).toMatch('<view wx:if="{{show}}"></view>');
});

test("v-for is ok", () => {
    const template = `<div v-for="li in list"></div>`;
    const data = t2w(template);
    expect(data).toMatch('<view wx:for="{{list}}" wx:for-item="li" wx:for-index="index"></view>');
});

test("动态class is ok", () => {
    let template = `<div :class="[item,item2+'1',item3+item4]"></div>`;
    let data = t2w(template);
    expect(data).toMatch("{{item}}");
    expect(data).toMatch(`{{item2+'1'}}`);
    expect(data).toMatch(`{{item3+item4}}`);

    template = `<div :class="{item:true,item2:item2+'1',item3:item3+item4}"></div>`;
    data = t2w(template);
    expect(data).toMatch(`{{(true)?'item':''}}`);
    expect(data).toMatch(`{{(item2+'1')?'item2':''}}`);
    expect(data).toMatch(`{{(item3+item4)?'item3':''}}`);
});

test("动态style is ok", () => {
    let template = `<div :style="{backgroundColor:color}"></div>`;
    let data = t2w(template);
    expect(data).toMatch(`background-color:{{color}}`);
});

test("模板字符串 is OK", () => {
    const template = '<div :style="{backgroundColor:`${color}`}"></div>';
    const data = t2w(template);
    expect(data).toMatch(`background-color:{{color}}`);
});

test("v-mdoel is ok ", () => {
    const template = '<input v-model="demo"/>';
    const data = t2w(template);
    expect(data).toMatch(`bindinput="__vModelEventResponses"`);
    expect(data).toMatch(`value="{{demo}}"`);
    expect(data).toMatch(`data-vmodel-params="demo"`);

    const template2 = '<textarea v-model="demo"></textarea>';
    const data2 = t2w(template2);
    expect(data2).toMatch(`bindinput="__vModelEventResponses"`);
    expect(data2).toMatch(`value="{{demo}}"`);
    expect(data2).toMatch(`data-vmodel-params="demo"`);
});
