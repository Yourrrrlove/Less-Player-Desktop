<script>
//定义名称，方便用于<keep-alive>
export default {
    name: 'UserInfoEditView'
}
</script>

<script setup>
import { storeToRefs } from 'pinia';
import { onMounted, onActivated, ref, reactive, watch } from 'vue';
import { useMainViewStore } from '../store/mainViewStore';
import { useUserProfileStore } from '../store/userProfileStore';
import SvgTextButton from '../components/SvgTextButton.vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    id: String
})

const ipcRenderer = electronAPI.ipcRenderer
const route = useRouter()

const { showToast } = useMainViewStore()
const titleRef = ref(null)
const aboutRef = ref(null)
const coverRef = ref(null)
const invalid = ref(false)

//TODO
const { user } = storeToRefs(useUserProfileStore())
const { updateUser } = useUserProfileStore()

const checkValid = () => {
    let title = titleRef.value.value
    invalid.value = (!title || title.trim().length < 1)
}

const submit = () => {
    let nickname = titleRef.value.value.trim()
    let about = aboutRef.value.value.trim()
    let cover = coverRef.value.src
    checkValid()
    if(invalid.value) {
        return 
    }
    updateUser(nickname, about, cover)
    showToast("用户信息已更新", () => route.push("/userhome"))
}

const cancel = () => {
    route.push("/userhome")
}

//TODO 使用本地文件图片，不利于迁移共享
const updateCover = async () => {
    const result = await ipcRenderer.invoke('open-image')
    if(result.length > 0) { 
        const cover = "file:///" + result[0]
        coverRef.value.src = cover
    }
}
</script>

<template>
    <div id="user-info-edit">
        <div class="header">
            <span class="title">编辑用户信息</span>
        </div>
        <div class="center">
            <div>
                <img class="cover" v-lazy="user.cover" ref="coverRef"/>
                <div class="cover-eidt-btn" @click="updateCover">编辑封面</div>
            </div>
            <div class="right">
                <div class="form-row">
                    <div>
                        <span>用户昵称</span>
                        <span class="required"> *</span>
                    </div>
                    <div @keydown.stop="">
                        <input type="text" :value="user.nickname" ref="titleRef" :class="{ invalid }" maxlength="20" placeholder="请输入用户昵称，最多允许输入20个字符哦">
                    </div>
                </div>
                <div class="form-row">
                    <div><span>简介 / 说说</span></div>
                    <div @keydown.stop="">
                        <textarea :value="user.about" ref="aboutRef" maxlength="99" placeholder="今天想要对自己说些什么呀~ 最多允许输入99个字符哦"></textarea>
                    </div>
                </div>
                <div class="action">
                    <SvgTextButton :leftAction="submit" text="保存"></SvgTextButton>
                    <SvgTextButton :leftAction="cancel" text="取消" class="spacing"></SvgTextButton>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
#user-info-edit {
    display: flex;
    flex-direction: column;
    padding: 25px 33px 15px 33px;
    flex: 1;
    overflow: auto;
}

#user-info-edit .header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;
}

#user-info-edit .header .title {
    text-align: left;
    margin-top: 5px;
    font-size: 25px;
    font-weight: bold;
}

#user-info-edit .center {
    display: flex;
    flex-direction: row;
    flex: 1;
}

#user-info-edit .center .cover {
    width: 175px;
    height: 175px;
    border-radius: 6px;
    border: 1px solid var(--main-left-border-color);
}

#user-info-edit .center .cover-eidt-btn {
    background-color: var(--main-left-border-color);
    padding: 5px;
    border-radius: 3px;
    cursor: pointer;
}

#user-info-edit .center .right {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-left: 20px;
}

#user-info-edit .center .form-row {
    margin-bottom: 15px;
}

#user-info-edit .center .form-row div {
    display: flex;
    flex-direction: row;
    align-items: center;
}

#user-info-edit .center .form-row span {
    font-size: 16px;
    color: var(--text-color);
    margin-bottom: 8px;
}

#user-info-edit .center .form-row input,
#user-info-edit .center .form-row textarea {
    flex: 1;
    border: 1px solid var(--main-left-border-color);
    outline: none;
    padding: 3px 6px;
    border-radius: 2px;
    background-color: var(--searchbar-bg);
    color: var(--searchbar-text-color);
    font-size: 15px;
}

#user-info-edit .center .form-row input {
    height: 25px;
}

#user-info-edit .center .form-row textarea {
    height: 256px;
    padding: 8px;
}

#user-info-edit .center .action {
    display: flex;
    flex-direction: row;
}

#user-info-edit .spacing {
    margin-left: 20px;
}

#user-info-edit .required {
    color: var(--hl-color) !important;
    font-weight: bold;
    font-size: 20px;
}

#user-info-edit .invalid {
    border-color: var(--error-color) !important;
    border-width: 3px;
}
</style>