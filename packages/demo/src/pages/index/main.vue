<template>
    <div>
        <textarea v-model="text.b" type="text"></textarea>

        <div @click="text.b = true" style="height: 50px;background: #191919">11111</div>

        <div v-if="text.b">22222</div>
    </div>
</template>

<config lang="json">
{
    "backgroundColor": "#fff",
    "usingComponents": {
        "hello-world":"/components/hello-world/main"
     }
}
</config>
<script  setup>
import {pp, ppRef, onPageLoad, onPageLifetimes, pComputed, watchEffect} from "@yiper.fan/wx-mini-runtime";
import { goTo } from "@yiper.fan/wx-mini-utils";

const show = ppRef(false);
const text=pp({a:['你好',false],b:false})



</script>

<style lang="less">
.nickname {
    font-size: 15px;
    font-weight: 600;
    color: #191919;
    opacity: 1;
}
.pet-column {
    border-top: 10px solid #f6f6f6;
    padding: 15px 0 0 20px;
    font-weight: bold;
}

.pet-item {
    margin: 0 5px;
    text-align: center;
}
.pet-list {
    padding: 20px;
}
.pet-avatar {
    margin: 0 auto;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    > .g-img {
        object-fit: fill;
        height: 50px;
    }
}
.pet-create-btn {
    line-height: 45px;
    height: 48px;
    font-size: 30px;
    text-align: center;
    font-weight: bold;
    border: 1px solid #ededed;
}

.menu-title {
    padding-left: 35px;
    font-size: 15px;
    font-weight: 500;
    color: #191919;
    opacity: 1;
}
.menu-item {
    height: 60px;

    border-bottom: 1px solid #f6f6f6;
}

.body {
    border-top: 10px solid #f6f6f6;
    padding: 0 15px;
}
.adviser-info {
    margin: 20px auto 0;
    width: 331px;
    height: 54px;
    line-height: 54px;
    background: #ffffff;
    border: 2px solid #191919;
    box-shadow: 0px 9px 0px rgba(0, 0, 0, 0.06);
    opacity: 1;
    border-radius: 20px;
    font-size: 15px;
    font-weight: 600;
    color: #191919;
    text-align: center;
}

.avatar {
    width: 80px;
    height: 80px;
    box-shadow: 0px 3px 22px rgba(0, 0, 0, 0.16);
    opacity: 1;
    border-radius: 40px;
    overflow: hidden;
}
.default-avatar {
    width: 65px;
    height: 65px;
    box-shadow: 0px 3px 22px rgba(0, 0, 0, 0.16);
    opacity: 1;
    border-radius: 40px;
    border: 5px solid #191919;
    overflow: hidden;

    > .g-img {
        height: 60px;
    }
}

.header {
    // margin-top: calc(-44px - env(safe-area-inset-top));
    width: 100%;
    padding: 20px;
    opacity: 1;
    overflow: hidden;
    box-sizing: border-box;
}
.num {
    margin-right: 20px;
    width: 18px;
    height: 18px;
    line-height: 18px;
    background: #ff3333;
    border-radius: 50%;
    opacity: 1;
    text-align: center;
    font-size: 10px;
    font-weight: 500;
    color: #ffffff;
}
.city {
    font-size: 12px;
    font-weight: 400;
    color: #999999;
    opacity: 1;
}
</style>
