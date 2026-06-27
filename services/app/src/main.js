import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { appConfig } from './services/config'

document.title = appConfig.creatorName || 'Songstash'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
