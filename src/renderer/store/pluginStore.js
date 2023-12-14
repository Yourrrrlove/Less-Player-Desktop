import { defineStore } from 'pinia';
import { randomTextWithinAlphabetNums, toTrimString } from '../../common/Utils';



export const usePluginStore = defineStore('plugins', {
    state: () => ({
        ignoreErrorPlugins: false,
        plugins: []
    }),
    actions: {
        toggleIgnoreErrorPlugins() {
            this.ignoreErrorPlugins = !this.ignoreErrorPlugins
        },
        pluginIndex({ id, name, version, author }) {
            if(id) return this.plugins.findIndex(item => (item.id == id))
            if(title && version) {
                return this.plugins.findIndex(item => {
                    return item.name == name 
                        && item.version == version
                        && item.author == author
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
            if(!plugin) return 
            const { name, version, author } = plugin
            const index = this.plugins.findIndex(item => {
                return item.name == name 
                    && item.version == version
                    && item.author == author
            })
            if(index > -1) return
            const id = randomTextWithinAlphabetNums(10)
            Object.assign(plugin, { id })
            this.plugins.push(plugin)
            return id
        },
        updatePlugin(plugin, changes) {
            const index = this.pluginIndex(plugin)
            if(index < 0) return
            if(!changes || typeof changes != 'object') return 
            const updatableKeys = 'state|path|main|mainModule|alias'.split('|')
            for(const [key, value] of Object.entries(changes)) {
                if(!updatableKeys.includes(key)) continue
                this.plugins[index][key] = value
            }
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