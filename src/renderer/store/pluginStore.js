import { defineStore } from 'pinia';
import { randomTextWithinAlphabetNums, toTrimString } from '../../common/Utils';



export const usePluginStore = defineStore('plugins', {
    state: () => ({
        ignoreErrorPlugins: false,
        isReplaceMode: false,
        plugins: []
    }),
    actions: {
        toggleIgnoreErrorPlugins() {
            this.ignoreErrorPlugins = !this.ignoreErrorPlugins
        },
        toggleReplaceMode() {
            this.isReplaceMode = !this.isReplaceMode
        },
        pluginIndex(plugin) {
            if(!plugin) return -1
            const { id, name, version, author } = plugin
            if(id) return this.plugins.findIndex(item => (item.id == id))
            if(name && version) {
                return this.plugins.findIndex(item => {
                    return item.name == name 
                        && item.author == author
                        && item.version == version
                })
            }
            return -1
        },
        getPlugin(id) {
            const index = this.pluginIndex({ id })
            if(index < 0) return
            return this.plugins[index]
        },
        addPlugin(plugin) {
            if(!plugin) return { id: null, index: null }
            const { name, version, author } = plugin
            const index = this.plugins.findIndex(item => {
                return item.name == name 
                    && item.author == author
                    && item.version == version
            })
            if(index > -1) return { id: this.plugins[index].id, index }
            const id = randomTextWithinAlphabetNums(10)
            const created = Date.now()
            Object.assign(plugin, { id, created })
            this.plugins.push(plugin)
            return { id, index }
        },
        updatePlugin(plugin, changes) {
            const index = this.pluginIndex(plugin)
            if(index < 0) return
            if(!changes || typeof changes != 'object') return 
            const updatableKeys = 'about|repository|state|path|main|mainModule|alias'.split('|')
            for(const [key, value] of Object.entries(changes)) {
                if(!updatableKeys.includes(key)) continue
                this.plugins[index][key] = value
            }
            const updated = Date.now()
            Object.assign(this.plugins[index], { updated })
        },
        removePlugin(plugin) {
            const index = this.pluginIndex(plugin)
            if(index > -1) return this.plugins.splice(index, 1)
        }
    },
    persist: {
        enabled: true,
        strategies: [
            {
                storage: localStorage,
            }
        ]
    }
})