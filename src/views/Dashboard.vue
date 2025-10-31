<template>
  <div class="dashboard">
    <h1>TaskFlow</h1>
    <button @click="showCreate = true" class="create-btn">
      + New Board
    </button>

    <!-- বোর্ড লিস্ট -->
    <div class="boards" v-if="boardStore.boards && boardStore.boards.length > 0">
      <div
        v-for="board in boardStore.boards"
        :key="board.id"
        class="board-card"
        @click="$router.push(`/board/${board.id}`)"
      >
        <h3>{{ board.name }}</h3>
        <p>{{ board.description || 'No description' }}</p>
        <small>Created: {{ formatDate(board.createdAt) }}</small>
      </div>
    </div>
    <p v-else>No boards yet. Create one!</p>

    <!-- মোডাল -->
    <div v-if="showCreate" class="modal-overlay" @click="showCreate = false">
      <div class="modal-content" @click.stop>
        <h2>Create Board</h2>
        <input v-model="newBoard.name" placeholder="Board Name" />
        <textarea v-model="newBoard.description" placeholder="Description"></textarea>
        <div class="modal-actions">
          <button @click="createBoard" :disabled="!newBoard.name.trim()">Create</button>
          <button @click="showCreate = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBoardStore } from '@/stores/useBoardStore';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const boardStore = useBoardStore();
const showCreate = ref(false);
const newBoard = ref({ name: '', description: '' });

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      boardStore.fetchBoards(user.uid);
    }
  });
});

const createBoard = () => {
  if (newBoard.value.name.trim() && auth.currentUser) {
    boardStore.createBoard(auth.currentUser.uid, newBoard.value);
    showCreate.value = false;
    newBoard.value = { name: '', description: '' };
  }
};

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : 'Unknown';
};
</script>

<style scoped>
.dashboard { max-width: 800px; margin: 40px auto; padding: 20px; }
.create-btn { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
.boards { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px; }
.board-card { padding: 15px; background: #f9f9f9; border-radius: 8px; cursor: pointer; }
.board-card:hover { background: #f0f0f0; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
.modal-content { background: white; padding: 20px; border-radius: 8px; width: 400px; }
.modal-content input, .modal-content textarea { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
</style>
