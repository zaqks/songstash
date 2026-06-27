import { createRouter, createWebHistory } from 'vue-router';
import Submit from './components/Submit.vue';
import Admin from './components/Admin.vue';

const routes = [
  {
    path: '/',
    component: Submit,
  },
  {
    path: '/admin',
    component: Admin,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
