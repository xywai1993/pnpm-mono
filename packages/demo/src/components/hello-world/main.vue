<template>
    <div class="item">
        <div>下面是组件内容</div>
        <div @click="add">点我，{{ msg }}</div>
        <div class="center">{{ demo.a }}~</div>
    </div>
</template>
<config lang="json">
{
    "component": true
}
</config>
<script>
import { componentSetup, componentLifetimes, pp } from "../../wx-runtime/setup-component";


componentSetup(() => {

    const demo = pp({ a: 1 })

    componentLifetimes('created', function () {
        console.log(this, 'nihao');
    });

    const add = () => {
        demo.a++;
    }

    return {
        demo,
        add
    }

})

</script>

