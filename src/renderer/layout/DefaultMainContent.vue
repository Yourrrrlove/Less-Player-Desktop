<script setup>

const excludes = [
    'CustomPlaylistEditView',
    'UserInfoEditView', 'BatchActionView',
    'DataBackupView', 'DataRestoreView',
    'LocalPlaylistEditView', 'FreeFMEditView',
    'FreeVideoEditView', 'WebDavSessionEditView',
    'WebDavSessionDetailView', 'NavidromeSessionEditView',
    'JellyfinSessionEditView', 'GenreDetailView', 
    'EmbySessionEditView', 'SavedPlaybackQueueEditView'
]

/*
const { visitPlaylistSquare, visitLocalMusic } = inject('appRoute')

const { activePlatforms } = storeToRefs(usePlatformStore())
const { isLocalMusic } = usePlatformStore()

const visitFirstActivePlatform = () => {
const platform = activePlatforms.value('playlists')[0].code
if (isLocalMusic(platform)) {
    visitLocalMusic()
} else {
    visitPlaylistSquare(platform)
}
}

onActivated(visitFirstActivePlatform)*/
</script>

<template>
    <div id="default-main-content">
        <router-view v-slot="{ Component }">
            <keep-alive :exclude="excludes" :max="6">
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>

<style>
#default-main-content {
    display: flex;
    flex: 1;
    overflow: auto;
    overflow-x: hidden;
}
</style>