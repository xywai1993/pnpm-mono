<template></template>
<script>
//app.js

App({
    onLaunch: function () {
        this.globalData = {};
    },
});
</script>
<style lang="less">
@import url("@yiper.fan/wx-mini-utils/style/layout.less");
::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    color: transparent;
}
.container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}
#body {
    width: 100%;
    /*padding-top: 80px;*/
    box-sizing: border-box;
}
.nav-bar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100000;
}
.nav-bar .weui-navigation-bar__center {
    font-weight: bold;
}
page {
    color: #333;
    font-size: 14px;
}

.shadow {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 11000;
}

.g-shadow {
    position: fixed;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 11000;
}

@font-face {
    font-family: "number";
    src: url("https://image.douba.cn/kaimaizhushou/123456789.ttf");
}

.price-num {
    font-family: number;
}
.c-red {
    color: #ff495a;
}

.c-999 {
    color: #999999;
}
.c-666 {
    color: #666;
}
.f-12 {
    font-size: 12px;
}

.text-lh {
    text-decoration: line-through;
}
.lh-0 {
    line-height: 0;
}
.fs-0 {
    font-size: 0;
}
.fs-13 {
    font-size: 13px;
}

.mt-10 {
    margin-top: 10px;
}
.mt-15 {
    margin-top: 15px;
}
.mt-20 {
    margin-top: 20px;
}
.mt-30 {
    margin-top: 30px;
}
.ml-5 {
    margin-left: 5px;
}
.ml-10 {
    margin-left: 10px;
}
.ml-15 {
    margin-left: 15px;
}
.ml-20 {
    margin-left: 20px;
}
.pd-rl {
    padding: 0 20px;
}

.w-100 {
    width: 100%;
}
.w-75 {
    width: 75%;
}

.g-flex,
.flex {
    display: flex;
}
.g-flex-1,
.flex-1 {
    flex: 1;
}
.box-size-100 {
    box-sizing: border-box;
    width: 100%;
}
.g-flex-center,
.g-flex-center-center {
    display: flex;
    justify-content: center;
    align-items: center;
}
.g-flex-between,
.g-flex-between-center {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.g-flex-start-center {
    display: flex;
    align-items: center;
}
.flex-row {
    flex-direction: row;
}

.flex-column {
    flex-direction: column;
}

.flex-row-reverse {
    flex-direction: row-reverse;
}

.flex-column-reverse {
    flex-direction: column-reverse;
}

.flex-wrap {
    flex-wrap: wrap;
}

.flex-nowrap {
    flex-wrap: nowrap;
}

.flex-wrap-reverse {
    flex-wrap: wrap-reverse;
}

.flex-fill {
    flex: 1 1 auto;
}

.flex-grow-0 {
    flex-grow: 0;
}

.flex-grow-1 {
    flex-grow: 1;
}

.flex-shrink-0 {
    flex-shrink: 0;
}

.flex-shrink-1 {
    flex-shrink: 1;
}

.justify-content-start {
    justify-content: flex-start;
}

.justify-content-end {
    justify-content: flex-end;
}

.justify-content-center {
    justify-content: center;
}

.justify-content-between {
    justify-content: space-between;
}

.justify-content-around {
    justify-content: space-around;
}

.align-items-start {
    align-items: flex-start;
}

.align-items-end {
    align-items: flex-end;
}

.align-items-center {
    align-items: center;
}

.align-items-baseline {
    align-items: baseline;
}

.align-items-stretch {
    align-items: stretch;
}

.align-content-start {
    align-content: flex-start;
}

.align-content-end {
    align-content: flex-end;
}

.align-content-center {
    align-content: center;
}

.align-content-between {
    align-content: space-between;
}

.align-content-around {
    align-content: space-around;
}

.align-content-stretch {
    align-content: stretch;
}

.align-self-auto {
    align-self: auto;
}

.align-self-start {
    align-self: flex-start;
}

.align-self-end {
    align-self: flex-end;
}

.align-self-center {
    align-self: center;
}

.align-self-baseline {
    align-self: baseline;
}

.align-self-stretch {
    align-self: stretch;
}

.g-hr {
    width: 100%;
    height: 10px;
    background: rgba(242, 242, 245, 1);
}
.g-img {
    width: 100%;
}
</style>
