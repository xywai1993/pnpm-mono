# 渐进式小程序框架

## 项目背景

因为使用的第三方小程序框架说不更新就不更新了，旧项目饱受折磨。因此决定写一个可插拔语法增强的渐进式小程序框架，保证小程序在官方更新功能后可以第一时间使用而无需等待第三方框架更新。

## 介绍

本框架采用静态模板编译+少量的runtime注入的方案，只做静态编译，尽量不做运行时更改。静态编译方案的好处是编译目标明确，bug少，易维护；坏处是小程序不支持的地方编译后也同样难以支持。

本框架非大而全，而是低耦合，可以使用任何你想使用的工具，如scss,less,typescript等，适合有一定webpack配置经验以及熟悉小程序语法的人使用，当然如果直接clone demo使用也是没有问题的。


## 框架目标

本框架的最低目标—— 在保持小程序语法的前提下改善单页面开发体验，即可继续使用小程序语法，但是开发页面变成了类似vue的单页面组件开发模式，避免wxml wxss js 频繁切换的痛苦

本框架的最高目标——可插拔的类vue3语法增强，即可实现类vue3的setup的开发方式。


## 快速开始

克隆模板项目即可快速开始

```shell
git clone https://github.com/xywai1993/wx-mini-demo.git 
```


## 使用说明 

请参照demo项目


## api

如果使用类vue3的方式开发项目的话，有必要了解一下下列api

```javascript
import {pp, ppRef, pComputed, watchEffect, onPageLoad, onPageLifetimes} from '@yiper.fan/wx-mini-runtime';


const pageData = pp({
    msg: '点我变红',
    color: '#000'
});

const num = ppRef(0);

watchEffect(()=>{
    console.log(num.value,'num变化了');
})

const num2 = pComputed(() => num.value + 100);

const handle = () => {
    num.value++;
};

onPageLifetimes('onLoad',(options)=>{
    console.log('这里是 onLoad回调')
})

onPageLoad(()=>{
    console.log('onLoad回调的快捷方式')
})

```


- pp  类似 vue3 的 reactive
- ppRef类似 vue3 的 ref
- pComputed类似 vue3 的 computed
- watchEffect 类似 vue3 watchEffect
- onPageLifetimes 小程序生命周期回调
- onPageLoad   因小程序onLoad 生命周期使用频繁，特添加此快捷方式



## 欢迎提pr