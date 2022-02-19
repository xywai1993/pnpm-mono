const t2w = require('../vue.cjs');

test('<div>{{hello}}</div> is ok', () => {
    const template = `<div>{{hello}}</div>`;
    const data = t2w(template);
    expect(data).toMatch('<view>{{hello}}</view>');
});

test('v-if is ok', () => {
    const template = `<div v-if="show"></div>`;
    const data = t2w(template);
    expect(data).toMatch('<view wx:if="{{show}}"></view>');
});

test('v-for is ok', () => {
    const template = `<div v-for="li in list"></div>`;
    const data = t2w(template);
    expect(data).toMatch('<view wx:for="{{list}}" wx:for-item="li" wx:for-index="index"></view>');
});

test('动态class is ok', () => {
    let template = `<div :class="[item,item2+'1',item3+item4]"></div>`;
    let data = t2w(template);
    expect(data).toMatch('{{item}}');
    expect(data).toMatch(`{{item2+'1'}}`);
    expect(data).toMatch(`{{item3+item4}}`);

    template = `<div :class="{item:true,item2:item2+'1',item3:item3+item4}"></div>`;
    data = t2w(template);
    expect(data).toMatch(`{{(true)?'item':''}}`);
    expect(data).toMatch(`{{(item2+'1')?'item2':''}}`);
    expect(data).toMatch(`{{(item3+item4)?'item3':''}}`);
});
