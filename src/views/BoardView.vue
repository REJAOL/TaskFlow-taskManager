<!-- src/views/BoardView.vue -->
<template>
  <div class="board-container" v-if="board">
    <h2>{{ board.name }}</h2>
    <p class="description">{{ board.description || 'No description' }}</p>

    <div class="columns">
      <div
        v-for="column in boardStore.columns"
        :key="column.id"
        class="column"
        :data-column-id="column.id"
      >
        <h3>{{ column.name }}</h3>

        <draggable
          :list="column.tasks"
          group="tasks"
          item-key="id"
          @end="onDragEnd"
          class="task-list"
        >
          <template #item="{ element }">
            <div class="task-card">
              {{ element.title }}
            </div>
          </template>
        </draggable>

        <button @click="addTask(column.id)" class="add-task-btn">
          + Add Task
        </button>
      </div>
    </div>
  </div>

  <div v-else class="loading">
    <p>Loading board...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBoardStore } from '@/stores/useBoardStore';
import draggable from 'vuedraggable';
import { auth, db } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

const route = useRoute();
const boardId = route.params.id;
const boardStore = useBoardStore();

const board = ref(null);
let unsubscribe = null;

onMounted(async () => {
  // Find board from store
  board.value = boardStore.boards.find(b => b.id === boardId);

  if (!board.value) {
    console.error('Board not found');
    return;
  }

  // Create default columns if not exist
  const defaultColumns = [
    { id: 'todo', name: 'To Do', order: 0 },
    { id: 'doing', name: 'Doing', order: 1 },
    { id: 'done', name: 'Done', order: 2 }
  ];

  for (const col of defaultColumns) {
    const colRef = doc(db, 'users', auth.currentUser.uid, 'boards', boardId, 'columns', col.id);
    await setDoc(colRef, col, { merge: true });
  }

  // Start real-time listening
  unsubscribe = boardStore.fetchColumns(boardId);
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const addTask = async (columnId) => {
  const title = prompt('Enter task title:');
  if (title?.trim()) {
    await boardStore.addTask(boardId, columnId, title.trim());
  }
};

const onDragEnd = (evt) => {
  const taskElement = evt.item;
  const taskId = taskElement.__draggable_context.element.id;
  const newColumnElement = evt.to.closest('.column');
  const newColumnId = newColumnElement.dataset.columnId;

  if (newColumnId && taskId) {
    boardStore.moveTask(boardId, taskId, newColumnId);
  }
};
</script>

<style scoped>
.board-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.columns {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding: 10px 0;
}

.column {
  background: #ebecf0;
  border-radius: 8px;
  padding: 12px;
  min-width: 300px;
  max-width: 300px;
}

.column h3 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  text-transform: uppercase;
  color: #333;
  font-weight: 600;
}

.task-list {
  min-height: 50px;
}

.task-card {
  background: white;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-size: 0.95rem;
  cursor: grab;
}

.task-card:active {
  cursor: grabbing;
}

.add-task-btn {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: none;
  text-align: left;
  color: #5e6c84;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 8px;
}

.add-task-btn:hover {
  background: rgba(0,0,0,0.05);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
