// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Loginview.vue')
    },
    {
      path: '/board/:id',
      name: 'board',
      component: () => import('../views/BoardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

// Auth Guard
router.beforeEach((to, from, next) => {
  const auth = getAuth();

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe(); // Run once

    if (to.meta.requiresAuth && !user) {
      next('/login');
    } else if (to.name === 'login' && user) {
      next('/');
    } else {
      next();
    }
  });
});

export default router;
