// src/stores/useBoardStore.js
import { defineStore } from 'pinia';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '@/firebase';
import { ref } from 'vue';

export const useBoardStore = defineStore('board', () => {
  const boards = ref([]);
  const columns = ref([]);

  // Fetch all boards
  const fetchBoards = (userId) => {
    const q = query(collection(db, 'users', userId, 'boards'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      boards.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
    });
    return unsubscribe;
  };

  // Create a new board
  const createBoard = async (userId, boardData) => {
    await addDoc(collection(db, 'users', userId, 'boards'), {
      ...boardData,
      createdAt: new Date(),
      members: [userId]
    });
  };

  // Fetch columns and tasks for a board
  const fetchColumns = (boardId) => {
    const colRef = collection(db, 'users', auth.currentUser.uid, 'boards', boardId, 'columns');
    const taskRef = collection(db, 'users', auth.currentUser.uid, 'boards', boardId, 'tasks');

    const unsubCol = onSnapshot(colRef, (colSnap) => {
      const colsMap = {};
      colSnap.docs.forEach(doc => {
        colsMap[doc.id] = { id: doc.id, ...doc.data(), tasks: [] };
      });

      const unsubTask = onSnapshot(taskRef, (taskSnap) => {
        taskSnap.docs.forEach(tdoc => {
          const task = { id: tdoc.id, ...tdoc.data() };
          if (colsMap[task.columnId]) {
            // Avoid duplicates
            const exists = colsMap[task.columnId].tasks.some(t => t.id === task.id);
            if (!exists) {
              colsMap[task.columnId].tasks.push(task);
            }
          }
        });
        columns.value = Object.values(colsMap).sort((a, b) => (a.order || 0) - (b.order || 0));
      });

      return unsubTask;
    });

    return () => {
      unsubCol();
    };
  };

  // Add a new task
  const addTask = async (boardId, columnId, title) => {
    await addDoc(collection(db, 'users', auth.currentUser.uid, 'boards', boardId, 'tasks'), {
      title,
      columnId,
      createdAt: new Date()
    });
  };

  // Move task to new column
  const moveTask = async (boardId, taskId, newColumnId) => {
    const taskRef = doc(db, 'users', auth.currentUser.uid, 'boards', boardId, 'tasks', taskId);
    await updateDoc(taskRef, { columnId: newColumnId });
  };

  return {
    boards,
    columns,
    fetchBoards,
    createBoard,
    fetchColumns,
    addTask,
    moveTask
  };
});
