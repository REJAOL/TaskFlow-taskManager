<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <header class="header">
      <h1>TaskFlow</h1>
      <button v-if="user" @click="auth.signOut()" class="logout-btn">Logout</button>
    </header>

    <button @click="showCreate = true" class="create-btn">
      + Create New Board
    </button>

    <div class="boards" v-if="boardStore.boards.length > 0">
      <div
        v-for="board in boardStore.boards"
        :key="board.id"
        class="board-card"
        @click="$router.push(`/board/${board.id}`)"
      >
        <h3>{{ board.name }}</h3>
        <p>{{ board.description || 'No description' }}</p>
        <small>Created: {{ formatDate(board.createdAt) }}</small>

        <div class="board-actions">
          <button @click.stop="openInviteModal(board.id)" class="invite-btn">
            Invite
          </button>
        </div>
      </div>
    </div>
    <p v-else class="no-boards">No boards yet. Create one!</p>

    <!-- Create Board Modal -->
    <div v-if="showCreate" class="modal-overlay" @click="showCreate = false">
      <div class="modal-content" @click.stop>
        <h2>Create New Board</h2>
        <input v-model="newBoard.name" placeholder="Board Name" required />
        <textarea v-model="newBoard.description" placeholder="Description (optional)"></textarea>
        <div class="modal-actions">
          <button @click="createBoard" :disabled="!newBoard.name.trim()">Create</button>
          <button @click="showCreate = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="showInvite" class="modal-overlay" @click="showInvite = false">
      <div class="modal-content" @click.stop>
        <h3>Invite to Board</h3>
        <input v-model="inviteEmail" placeholder="Enter email address" />
        <div class="modal-actions">
          <button @click="sendInvite" :disabled="!isValidEmail">
            Send Invite
          </button>
          <button @click="showInvite = false">Cancel</button>
        </div>
        <p v-if="inviteSent" class="success">Invite sent!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useBoardStore } from '@/stores/useBoardStore';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion
} from 'firebase/firestore';

const boardStore = useBoardStore();
const showCreate = ref(false);
const showInvite = ref(false);
const newBoard = ref({ name: '', description: '' });
const inviteEmail = ref('');
const inviteBoardId = ref('');
const inviteSent = ref(false);
const user = auth;

onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      boardStore.fetchBoards(currentUser.uid);
      listenForInvites(currentUser.email);
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

const openInviteModal = (boardId) => {
  inviteBoardId.value = boardId;
  inviteEmail.value = '';
  inviteSent.value = false;
  showInvite.value = true;
};

const isValidEmail = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.value);
});

const sendInvite = async () => {
  if (!isValidEmail.value || !auth.currentUser) return;

  const inviteId = `${inviteBoardId.value}_${inviteEmail.value}`;
  const inviteRef = doc(db, 'invites', inviteId);

  await setDoc(inviteRef, {
    boardId: inviteBoardId.value,
    email: inviteEmail.value,
    invitedBy: auth.currentUser.uid,
    createdAt: new Date()
  });

  inviteSent.value = true;
  setTimeout(() => {
    showInvite.value = false;
    inviteSent.value = false;
  }, 1500);
};

const listenForInvites = (userEmail) => {
  const q = query(collection(db, 'invites'), where('email', '==', userEmail));
  onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === 'added') {
        const invite = change.doc.data();
        const userId = auth.currentUser.uid;

        // Add board to user's collection
        const userBoardRef = doc(db, 'users', userId, 'boards', invite.boardId);
        await setDoc(userBoardRef, { invited: true }, { merge: true });

        // Add user to board members
        const ownerBoardRef = doc(db, 'users', invite.invitedBy, 'boards', invite.boardId);
        await updateDoc(ownerBoardRef, {
          members: arrayUnion(userId)
        });

        // Delete invite
        await deleteDoc(change.doc.ref);
      }
    });
  });
};

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : 'Unknown';
};
</script>

<style scoped>
.dashboard { max-width: 1000px; margin: 0 auto; padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.logout-btn { padding: 8px 16px; background: #d93025; color: white; border: none; border-radius: 6px; cursor: pointer; }
.create-btn { padding: 12px 24px; background: #1a73e8; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
.boards { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px; }
.board-card { position: relative; padding: 16px; background: #f8f9fa; border-radius: 12px; cursor: pointer; transition: transform 0.2s; }
.board-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.board-actions { position: absolute; top: 12px; right: 12px; }
.invite-btn { padding: 6px 12px; background: #34a853; color: white; border: none; border-radius: 6px; font-size: 0.8rem; cursor: pointer; }
.no-boards { text-align: center; color: #666; margin-top: 40px; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: white; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; }
.modal-content input, .modal-content textarea { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
.modal-actions button { padding: 10px 16px; border-radius: 6px; cursor: pointer; }
.modal-actions button:first-child { background: #1a73e8; color: white; border: none; }
.modal-actions button:last-child { background: #eee; border: 1px solid #ddd; }
.success { color: #34a853; margin-top: 12px; font-weight: 600; }
</style>
