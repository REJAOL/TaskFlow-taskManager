<template>
  <div class="board" v-if="board">
    <h2>{{ board.name }}</h2>
    <p>{{ board.description }}</p>

    <div class="columns">
      <div
        v-for="column in columns"
        :key="column.id"
        class="column"
      >
        <h3>{{ column.name }}</h3>
        <draggable
          :list="column.tasks"
          group="tasks"
          item-key="id"
          @end="onDragEnd"
        >
          <template #item="{ element }">
            <div class="task-card">
              {{ element.title }}
            </div>
          </template>
        </draggable>
        <button @click="addTask(column.id)" class="add-task">
          + Add Task
        </button>
      </div>
    </div>
  </div>
  <p v-else>Loading board...</p>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useBoardStore } from '@/stores/useBoardStore';
import draggable from 'vuedraggable';

const route = useRoute();
const boardId = route.params.id;
const boardStore = useBoardStore();

const board = ref(null);
const columns = ref([
  { id: 'todo', name: 'To Do', tasks: [] },
  { id: 'doing', name: 'Doing', tasks: [] },
  { id: 'done', name: 'Done', tasks: [] }
]);

onMounted(() => {
  // সিম্পলি লোড করি (পরে Firebase থেকে)
  board.value = boardStore.boards.find(b => b.id === boardId);
});

const addTask = (columnId) => {
  const column = columns.value.find(c => c.id === columnId);
  column.tasks.push({
    id: Date.now(),
    title: 'New Task'
  });
};

const onDragEnd = () => {
  // পরে Firebase এ সেভ করবো
  console.log('Task moved!');
};
</script>

<style scoped>
.board { padding: 20px; }
.columns { display: flex; gap: 20px; overflow-x: auto; }
.column {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 8px;
  min-width: 300px;
}
.task-card {
  background: white;
  padding: 10px;
  margin: 8px 0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.add-task {
  width: 100%;
  padding: 8px;
  background: transparent;
  border: none;
  text-align: left;
  color: #666;
  cursor: pointer;
}
</style>
