import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/',
      name:'dashboard',
      component:()=>import ('../views/Dashboard.vue')
    },
    {
      path:'/board/:id',
      name:'board',
      component:()=>import ('../views/BoardView.vue')
    }
  ],
})

export default router
