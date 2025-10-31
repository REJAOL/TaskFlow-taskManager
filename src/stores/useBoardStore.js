import { db } from "@/firebase";
import { addDoc, collection, onSnapshot, query } from "firebase/firestore";
import { defineStore } from "pinia";
import { ref } from "vue";



export const useBoardStore = defineStore('board', ()=>{
  const boards = ref([])
  const unsubscribes =[]

  const fetchBoards = (userId)=>{
    const q = query(collection(db, 'users', userId, 'boards'))
    const unsubscribe = onSnapshot(q,(snapShot)=>{
      boards.value = snapShot.docs.map(doc=>({id:doc.id, ...doc.data()}))
    })

    unsubscribes.push(unsubscribe)
    return unsubscribe
  }
  const createBoard = async (userId, boardData)=>{
    try {
    const docRef = await addDoc(collection(db,'users', userId, 'boards'),{
      ...boardData,
      createdAt: new Date(),
      members:[userId]
    })
    console.log('Board created with ID: ', docRef.id);
    } catch (error) {
      console.error('Error creating board: ', error)
    }
  }
  const cleanup = () => {
    unsubscribes.forEach(unsub => unsub());
    unsubscribes.length = 0;
  };

  return { boards, fetchBoards, createBoard, cleanup };
})
