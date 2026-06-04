import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 初始化主题
const savedDark = localStorage.getItem('feiman_theme_dark')
if (savedDark === 'true' || (!savedDark && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}

const app = createApp(App)
app.use(router)
app.mount('#app')
