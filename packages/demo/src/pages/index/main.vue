<template>
    <div class="body">
        <div class="g-flex-start-center pd-rl mt-30">
            <h1 class="c-main fs-20">标签</h1>
            <p class="c-999 fs-12 ml-5">最多添加6个</p>
        </div>

        <ul class="g-flex flex-wrap tag-box border-bottom info">
            <li class="tag" v-for="(li, index) in tags" :key="li.id">
                <div>{{ li.title }}</div>
                <div class="remove" @click="remove(index)"></div>
            </li>
        </ul>
        <div class="g-flex pd-rl mt-30">
            <div class="flex-1">
                <textarea class="input" v-model="text"></textarea>
            </div>
            <div class="add-btn" @click="add">添加</div>
        </div>
        <div class="btn" @click="submit">提交修改</div>

    </div>
</template>
<config lang="json">
{
"backgroundColor": "#fff",
"navigationBarTitleText": "编辑个性标签",
"usingComponents": {}
}
</config>
<script setup>
import { ppRef, watchEffect } from "@yiper.fan/wx-mini-runtime";
const tags = ppRef([{id:1,title:11},{id:2,title:22}]);
const text = ppRef("");



const remove = (index) => {
    tags.value.splice(index, 1);
};

const submit = () => {



    console.log(tags.value);

    // tags.value.forEach(item=>{
    //     console.log(item.title);
    // })

    tags.value[2].title = '123'

};

const add = () => {
    if (text.value) {

        // const _data = [...tags.value];

        tags.value.push({
            id:3,
            title: text.value,
        });


    }
};


</script>

<style lang="less" scoped>
.body {
    padding: 0 0 calc(10px + env(safe-area-inset-bottom));
    min-height: 100vh;
}
.info {
    padding: 0 20px;
}

.border-top {
    border-top: 1px solid #f6f6f6;
}
.border-bottom {
    border-bottom: 1px solid #f6f6f6;
}

.tips {
    color: #c4c4c4;
    font-size: 10px;
}
.btn {
    margin: 30px auto 0;
    width: 242px;
    height: 43px;
    background: linear-gradient(90deg, #3d3dfc 0%, #6884ff 100%);
    border-radius: 8px 8px 8px 8px;
    opacity: 1;
    text-align: center;
    line-height: 43px;
    color: #ffffff;
}
.tag-box {
    padding: 20px;
}
.tag {
    position: relative;
    margin: 10px;
    padding: 0 20px;
    font-size: 13px;
    font-weight: 400;
    color: #f84235;
    opacity: 1;
    height: 29px;
    line-height: 29px;
    background: rgba(248, 66, 53, 0.08);
    border-radius: 30px;
}
.remove {
    position: absolute;
    right: -10px;
    top: -10px;
    width: 25px;
    height: 25px;
}
.action-btn {
    width: 39px;
    height: 39px;
}

.fs-20 {
    font-size: 20px;
}
.input {
    padding: 10px 20px;
    width: 100%;
    box-sizing: border-box;
    height: 93px;
    background: #f9f9f9;
    border-radius: 8px 8px 8px 8px;
    border: 1px solid #e3e3e3;
}
.add-btn {
    margin-left: 10px;
    width: 68px;
    height: 44px;
    background: #ffffff;
    border-radius: 8px 8px 8px 8px;
    opacity: 0.8;
    border: 1px solid #e3e3e3;
    line-height: 44px;
    text-align: center;
}
</style>
