<template>
    <div>
        <div v-if="!hasUserInfo" class="g-flex-start-center header">
            <div class="default-avatar"></div>
            <div class="ml-15" @click="getUserInfo">
                <div class="nickname">登录授权</div>
                <div class="city mt-5">登录后创建你的小宠空间</div>
            </div>
        </div>
        <div
            v-if="hasUserInfo"
            class="g-flex-start-center header"
            @click="goTo('user-info', '', '')"
        >
            <div class="default-avatar">
                <img :src="userInfo.avatar" class="g-img img-fill" />
            </div>
            <div class="ml-15">
                <div class="nickname">{{ userInfo.nickname }}</div>
                <div class="city">我的城市:{{ userInfo.city }}</div>
            </div>
        </div>
        <div>
            <h2 class="pet-column">我的宠物</h2>
            <div class="g-flex pet-list">
                <div v-for="li in petList" :key="li.id" class="pet-item" @click="goPetHome(li.id)">
                    <div class="pet-avatar">
                        <img :src="li.avatar" class="g-img" alt />
                    </div>
                    <p class="mt-5 fs-12 fsw-6em">{{ li.nickname }}</p>
                </div>
                <div v-if="petList.length < 3">
                    <div class="pet-avatar pet-create-btn" @click="goAddPet('add-pet')">+</div>
                    <p class="mt-5">创建新宠物</p>
                </div>
            </div>
        </div>

        <div class="body">
            <!-- <div class="adviser-info">创建你的宠物档案</div> -->
            <ul class="menu">
                <li class="g-flex-start-center menu-item" @click="goPage('pet-record')">
                    <div class="menu-title doc-icon">宠物档案</div>
                </li>
                <li class="g-flex-start-center menu-item" @click="goPage('mine-list')">
                    <div class="menu-title list-icon">我的清单</div>
                </li>
                <li class="g-flex-between-center menu-item" @click="goPage('visitor')">
                    <div class="menu-title visitor-icon">最近访客</div>
                    <div class="num">{{ userCenterData.new_visitor }}</div>
                </li>
                <li class="g-flex-between-center menu-item" @click="goPage('message-record')">
                    <div class="menu-title tips-icon">消息通知</div>
                    <div class="num">{{ userCenterData.new_message }}</div>
                </li>
            </ul>
        </div>
        <div>{{ li }}</div>

        <nav-nav hover="d"></nav-nav>
    </div>
</template>

<config lang="json">
{
    "backgroundColor": "#fff",
    "usingComponents": { },
    "navigationStyle": "custom"
}
</config>
<script  setup>
import { pp, ppRef, onPageLoad, onPageLifetimes } from "@yiper.fan/wx-mini-runtime";

const li = ppRef(111);
const goTo = () => { };
const { hasPet, getHasPet } = {
    hasPet: true,
    getHasPet: () => { }
};
const petList = ppRef([]);
const hasUserInfo = ppRef(false);
const userInfo = ppRef({ nickname: '', avatarUrl: '' })
const userCenterData = ppRef({
    "new_message": 0,			//新消息数量
    "new_visitor": 0
})



const getUserInfo = () => {
    wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {

            if (!res.userInfo.avatarUrl) {
                res.userInfo.avatarUrl = 'https://image.douba.cn/xiaomaitong/img/default-avatar@2x.ad344.png'
            }
            UpdateUserInfo(res.userInfo).then(() => {
                hasUserInfo.value = true;
                userInfo.value = res.userInfo;
                wx.setStorageSync(constant.hasUserInfo, true);
            })
        }
    })

}

onPageLoad((options) => {
    console.log(options, '回调函数');
})

onPageLoad(options => {
    console.log('回调函数2222');
})

onPageLifetimes('onShow', () => {
    console.log('onPageShow');
})

onPageLifetimes('onShareAppMessage', (options) => {
    console.log(options, 'onPageShow22222');
    return {
        title: 'Nihao',
        path: '/pages/index/main'
    }
})

const goPage = (page) => {

    if (!hasPet.value) {
        showToast('请先创建宠物档案')
        return;
    }

    goTo(page)
}

const goAddPet = (page) => {
    if (page == 'add-pet' && !hasUserInfo.value) {
        showToast('请先授权登录')
        return;
    } else {
        goTo(page)

    }
}

const goPetHome = (id) => {
    goTo('pet-home', { id })
}

</script>

<style lang="less">
.nickname {
    font-size: 15px;
    font-family: PingFang SC;
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
    font-family: PingFang SC;
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
    font-family: PingFang SC;
    font-weight: 600;
    color: #191919;
    opacity: 1;
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
    border: 5rpx solid #191919;
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
    font-family: PingFang SC;
    font-weight: 500;
    color: #ffffff;
    opacity: 1;
}
.city {
    font-size: 12px;
    font-family: PingFang SC;
    font-weight: 400;
    color: #999999;
    opacity: 1;
}
</style>
