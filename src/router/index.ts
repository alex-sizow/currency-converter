import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Convert from '../pages/Convert.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/convert',
            name: 'convert',
            component: Convert
        }
    ]
})

export default router 