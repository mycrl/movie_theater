import { createApp } from 'vue'
import App from './App.vue'
import router from './route'
import { Store } from './store'

createApp(App)
    .use(router)
    .provide('store', Store)
    .mount('#app')
