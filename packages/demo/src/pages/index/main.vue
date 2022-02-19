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
import { setup, pp, ppRef, onPageLoad } from "@yiper.fan/wx-mini-runtime";

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

onPageLoad(() => {

})

const onShow = () => {
    // GetPetList().then(data => hasPet.value = !!data.length)

    hasPet.value = getHasPet();

    GetPetList().then(data => {
        petList.value = data;
    })


    if (!wx.getStorageSync(constant.hasUserInfo)) {
        GetUserInfo().then(data => {
            hasUserInfo.value = !!data.nickname
            userInfo.value = data;
            wx.setStorageSync(constant.hasUserInfo, true);
        })
    }



    GetUserCenter().then(data => {
        userCenterData.value = data;
    })
}

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
.body {
    margin-top: 100px;
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
    background-color: #f2f2f2;
    min-height: 100vh;
    overflow: hidden;
}
.header {
    // margin-top: calc(-44px - env(safe-area-inset-top));
    width: 100%;
    height: 252px;
    background: url("./static/souyebg@2x.png") left top no-repeat;
    background-size: contain;
    opacity: 1;
    overflow: hidden;
}
.search {
    margin-top: 10px;
    padding-left: 35px;
    width: 312px;
    height: 40px;
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.13);
    opacity: 1;
    border-radius: 27px;
    background: #fff url("./static/search-icon@2x.png") 10px center/18px auto
        no-repeat;
}
.top-search {
    width: 210px;
    padding-left: 30px;
    height: 32px;
    border: 1px solid rgba(247, 243, 245, 1);
    border-radius: 17px;
    color: #333;
    // background: #fff url('./static/search-icon@2x.png') 10px center/18px auto no-repeat;
}

.grid {
    margin: -65rpx auto 0;
    width: 96%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
    box-sizing: border-box;
    gap: 10rpx;
}
.list-wrap {
    // margin-top: -40px;
    // padding: 0 10px;
    // column-count: 2;
    > .item {
        // break-inside: avoid;
        // padding: 0 10px;
        margin-bottom: 10px;
        box-sizing: border-box;
        box-shadow: 0px 3px 30px rgba(0, 0, 0, 0.06);
        opacity: 1;
        border-radius: 6rpx;
    }
}
</style>
