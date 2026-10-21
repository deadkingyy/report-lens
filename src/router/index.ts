import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from '@/features/home/HomePage.vue';
import AnalysisPage from '@/features/analysis/AnalysisPage.vue';
import AboutPage from '@/features/home/AboutPage.vue';

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/analyze', name: 'analyze', component: AnalysisPage },
    { path: '/about', name: 'about', component: AboutPage },
  ],
});
