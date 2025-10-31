

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import { auth } from './firebase';
import { signInAnonymously } from 'firebase/auth';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');

signInAnonymously(auth)
  .then(() => {
    console.log('Signed in anonymously');
  })
  .catch((error) => {
    console.error('Anonymous auth error: ', error);
  });
