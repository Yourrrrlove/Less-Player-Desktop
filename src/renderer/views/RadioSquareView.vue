<script setup>
import { onActivated, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Back2TopBtn from '../components/Back2TopBtn.vue';
import { useAppCommonStore } from '../store/appCommonStore';
import RadioCategoryBar from '../components/RadioCategoryBar.vue';
import { useRadioSquareStore } from '../store/radioSquareStore';
import PlaylistsControl from '../components/PlaylistsControl.vue';
import PlaylistCategoryFlowBtn from '../components/PlaylistCategoryFlowBtn.vue';
import { useSettingStore } from '../store/settingStore';
import { onEvents, emitEvents, offEvents } from '../../common/EventBusWrapper';



const squareContentRef = ref(null)
const back2TopBtnRef = ref(null)
const playlistCategoryFlowBtnRef = ref(null)

//全部分类
const categories = reactive([])
const orders = reactive([])
const radios = reactive([])
const pagination = { offset: 0, limit: 35, page: 1 }
let markScrollTop = 0

const { currentPlatformCode, currentCategoryCode,
    currentOrder, multiSelectMode,
    currentCategoryItems } = storeToRefs(useRadioSquareStore())
const { currentVender, currentPlatformCategories, putCategories,
    putOrders, currentPlatformOrders, setMultiSelectMode,
    currentPlatformWhiteWrap, putWhiteWrap, } = useRadioSquareStore()
const { isRadioMode } = storeToRefs(useAppCommonStore())
const { getPaginationStyleIndex } = storeToRefs(useSettingStore())

const isLoadingCategories = ref(true)
const isLoadingContent = ref(true)
const isWhiteWrap = ref(false)
const setWhiteWrap = (value) => isWhiteWrap.value = value || false
const setLoadingCategories = (value) => isLoadingCategories.value = value
const setLoadingContent = (value) => isLoadingContent.value = value

const resetPagination = () => {
    radios.length = 0
    pagination.offset = 0
    pagination.page = 1
}

const nextPage = () => {
    pagination.offset = pagination.page * pagination.limit
    pagination.page = pagination.page + 1
}

//TODO
const loadCategories = async () => {
    categories.length = 0
    orders.length = 0
    setWhiteWrap(false)
    setLoadingCategories(true)
    setLoadingContent(true)
    
    let cachedCates = currentPlatformCategories()
    let cachedOrders = currentPlatformOrders()
    let cachedWhiteWrap = currentPlatformWhiteWrap() || false
    if (!cachedCates) {
        const vendor = currentVender()
        if (!vendor || !vendor.radioCategories) return
        const result = await vendor.radioCategories()
        if (!result) return

        const { data, platform, orders, multiMode, isWhiteWrap } = result
        if (currentPlatformCode.value != platform || !data) return

        const multiSelectMode = (multiMode === true)
        cachedCates = { data, multiSelectMode }
        cachedOrders = orders
        cachedWhiteWrap = isWhiteWrap

        putCategories(platform, cachedCates)
        if (cachedOrders) putOrders(platform, cachedOrders)
        putWhiteWrap(platform, isWhiteWrap)
    }

    setMultiSelectMode(cachedCates.multiSelectMode)
    categories.push(...cachedCates.data)
    if (cachedOrders) orders.push(...cachedOrders)
    setWhiteWrap(cachedWhiteWrap)
    emitEvents('radioCategory-update')
    setLoadingCategories(false)
}

const loadContent = async (noLoadingMask, offset, limit, page) => {
    const vendor = currentVender()
    if (!vendor || !vendor.radioSquare) return
    if (!noLoadingMask) setLoadingContent(true)
    let cate = multiSelectMode.value ? currentCategoryItems.value : currentCategoryCode.value
    /*
    const offset = pagination.offset
    const limit = pagination.limit
    const page = pagination.page
    */
    const order = currentOrder.value.value
    const result = await vendor.radioSquare(cate, offset, limit, page, order)
    if (!result) return
    if (currentPlatformCode.value != result.platform) return
    //重新再获取一次，确保没有变更
    cate = multiSelectMode.value ? currentCategoryItems.value : currentCategoryCode.value
    if (cate != result.cate) return
    radios.push(...result.data)
    setLoadingContent(false)

    return { data: result.data, total: result.total, limit }
}


const loadMoreContent = () => {
    nextPage()
    loadContent(true)
}

const nextPagePendingMark = ref(0)
const scrollToLoad = () => {
    if (isLoadingContent.value) return
    if (!squareContentRef.value) return
    const scrollTop = squareContentRef.value.scrollTop
    const scrollHeight = squareContentRef.value.scrollHeight
    const clientHeight = squareContentRef.value.clientHeight
    markScrollState()
    if ((scrollTop + clientHeight) >= scrollHeight) {
        //loadMoreContent()
        nextPagePendingMark.value = Date.now()
    }
}

const loadPageContent = async ({ offset, page, limit }) => {
    const isNormalType = (getPaginationStyleIndex.value === 0)
    if (isNormalType) resetScrollState()
    return loadContent((!isNormalType && page > 1), offset, limit, page)
}

const onScroll = () => {
    scrollToLoad()
}

const markScrollState = () => {
    if (squareContentRef.value) markScrollTop = squareContentRef.value.scrollTop
}

const resetScrollState = () => {
    markScrollTop = 0
    if (!squareContentRef.value) return
    squareContentRef.value.scrollTop = markScrollTop
    resetFlowBtns()
}

const restoreScrollState = () => {
    //emitEvents("imageTextTiles-update")
    if (markScrollTop < 1) return
    if (!squareContentRef.value) return
    squareContentRef.value.scrollTop = markScrollTop
}

const resetFlowBtns = () => {
    if (playlistCategoryFlowBtnRef.value) playlistCategoryFlowBtnRef.value.setScrollTarget(squareContentRef.value)
    if (back2TopBtnRef.value) back2TopBtnRef.value.setScrollTarget(squareContentRef.value)
}

//TODO 后期需要梳理优化
const resetCommom = () => {
    resetPagination()
    resetScrollState()
    //resetBack2TopBtn()
    resetFlowBtns()
}

const refreshAllPendingMark = ref(0)
const refreshData = () => {
    resetCommom()
    refreshAllPendingMark.value = Date.now()
    //loadContent()
}


/* 生命周期、监听 */
watch(currentPlatformCode, (nv, ov) => {
    if (!isRadioMode.value) return
    resetCommom()
    loadCategories()
})

const eventsRegistration = {
    'radioSquare-refresh': refreshData,
}
onMounted(() => {
    onEvents(eventsRegistration)
    resetCommom()
    loadCategories()
})

onActivated(() => restoreScrollState())
onUnmounted(() => offEvents(eventsRegistration))
</script>

<template>
    <div class="radio-square-view" ref="squareContentRef" @scroll="onScroll">
        <RadioCategoryBar :data="categories" :loading="isLoadingCategories" :isWhiteWrap="isWhiteWrap">
        </RadioCategoryBar>
        <PlaylistsControl :loading="isLoadingCategories || isLoadingContent" 
            :playable="true"
            :favorable="true"
            :loadPage="loadPageContent" 
            :limit="35"
            :paginationStyleType="getPaginationStyleIndex" 
            :nextPagePendingMark="nextPagePendingMark"
            :refreshAllPendingMark="refreshAllPendingMark">
        </PlaylistsControl>
        <PlaylistCategoryFlowBtn ref="playlistCategoryFlowBtnRef" prefix="radio">
        </PlaylistCategoryFlowBtn>
        <Back2TopBtn ref="back2TopBtnRef"></Back2TopBtn>
    </div>
</template>

<style scoped>
.radio-square-view {
    padding: 20px 33px 15px 33px;
    overflow: scroll;
    overflow-x: hidden;
}
</style>