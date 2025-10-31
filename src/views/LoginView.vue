<!-- src/views/LoginView.vue -->
<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>TaskFlow</h2>
      <p class="subtitle">{{ isSignup ? 'Create your account' : 'Log in to continue' }}</p>

      <form @submit.prevent="handleAuth" class="auth-form">
        <input
          v-model="email"
          type="email"
          placeholder="Email address"
          required
          class="input"
          autocomplete="email"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password (min 6 chars)"
          required
          minlength="6"
          class="input"
          autocomplete="current-password"
        />

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Log In') }}
        </button>
      </form>

      <p class="toggle-auth">
        {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
        <a href="#" @click.prevent="isSignup = !isSignup" class="link">
          {{ isSignup ? 'Log In' : 'Sign Up' }}
        </a>
      </p>

      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const isSignup = ref(false);
const error = ref('');
const loading = ref(false);

const handleAuth = async () => {
  error.value = '';
  loading.value = true;

  try {
    if (isSignup.value) {
      await createUserWithEmailAndPassword(auth, email.value, password.value);
    } else {
      await signInWithEmailAndPassword(auth, email.value, password.value);
    }
    router.push('/');
  } catch (err) {
    error.value = err.code === 'auth/email-already-in-use'
      ? 'This email is already registered. Try logging in.'
      : err.code === 'auth/weak-password'
      ? 'Password should be at least 6 characters.'
      : err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
      ? 'Invalid email or password.'
      : 'Authentication failed. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.auth-card h2 {
  margin: 0 0 8px;
  font-size: 2.2rem;
  font-weight: 700;
  color: #1a73e8;
}

.subtitle {
  color: #5f6368;
  margin-bottom: 24px;
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input {
  padding: 14px 16px;
  font-size: 1rem;
  border: 1px solid #dadce0;
  border-radius: 8px;
  transition: border 0.2s;
}

.input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.btn-primary {
  padding: 14px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #1557b0;
}

.btn-primary:disabled {
  background: #a9c9ff;
  cursor: not-allowed;
}

.toggle-auth {
  margin-top: 20px;
  font-size: 0.9rem;
  color: #5f6368;
}

.link {
  color: #1a73e8;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

.error-msg {
  color: #d93025;
  margin-top: 16px;
  font-size: 0.9rem;
  background: #fce8e6;
  padding: 10px;
  border-radius: 6px;
}
</style>
