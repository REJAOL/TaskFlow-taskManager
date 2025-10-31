<template>
  <div class="dashboard">
    <h1>TaskFlow Dashboard</h1>
    <button @click="showCreate = true" class="create-btn">
      + Create New Board
    </button>

    <div class="boards" v-if="boards.length > 0">
      <div
        v-for="board in boards"
        :key="board.id"
        class="board-card"
        @click="$router.push(`/board/${board.id}`)"
      >
        <h3>{{ board.name }}</h3>
        <p>{{ board.description || 'No description' }}</p>
        <small>Created: {{ new Date(board.createdAt.seconds * 1000).toLocaleDateString() }}</small>
      </div>
    </div>
    <p v-else>No boards yet. Create one!</p>

    <!-- Create Board Modal -->
    <div v-if="showCreate" class="modal-overlay" @click="showCreate = false">
      <div class="modal-content" @click.stop>
        <h2>Create New Board</h2>
        <input v-model="newBoard.name" placeholder="Board Name (required)" />
        <textarea v-model="newBoard.description" placeholder="Description (optional)"></textarea>
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
const userId = ref(null);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId.value = user.uid;
      boardStore.fetchBoards(user.uid);
    } else {
      console.log('No user logged in');
    }
  });
});

const createBoard = () => {
  if (newBoard.value.name.trim() && userId.value) {
    boardStore.createBoard(userId.value, newBoard.value);
    showCreate.value = false;
    newBoard.value = { name: '', description: '' };
  }
};
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.create-btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

.boards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.board-card {
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.board-card:hover {
  background-color: #e0e0e0;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 8px 16px;
  cursor: pointer;
}

.modal-actions button:disabled {
  background-color: #ccc;
}
</style>
