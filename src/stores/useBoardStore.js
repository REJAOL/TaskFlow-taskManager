import { defineStore } from 'pinia';
import { collection, addDoc, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { ref } from 'vue';

export const useBoardStore = defineStore('board', () => {
  const boards = ref([]);  // এটা থাকবে

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

  const createBoard = async (userId, boardData) => {
    await addDoc(collection(db, 'users', userId, 'boards'), {
      ...boardData,
      createdAt: new Date(),
      members: [userId]
    });
  };


  return { boards, fetchBoards, createBoard };
});
