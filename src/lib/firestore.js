import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase.js';

export const collectionPath = (userId, key) => ['users', userId, key];

export function subscribeUserCollection(userId, key, callback) {
  const q = query(collection(db, ...collectionPath(userId, key)), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    },
    (error) => {
      console.warn(`Unable to subscribe to ${key}. Firestore may be offline or blocked.`, error);
      callback([]);
    },
  );
}

export async function listUserCollection(userId, key) {
  const q = query(collection(db, ...collectionPath(userId, key)), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function createUserItem(userId, key, data) {
  return addDoc(collection(db, ...collectionPath(userId, key)), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserItem(userId, key, id, data) {
  return updateDoc(doc(db, ...collectionPath(userId, key), id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function upsertUserDoc(userId, data) {
  return setDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function deleteUserItem(userId, key, id) {
  return deleteDoc(doc(db, ...collectionPath(userId, key), id));
}

export async function uploadUserFile(userId, key, file) {
  const path = `users/${userId}/${key}/${Date.now()}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return { url, path, name: file.name, type: file.type, size: file.size };
}

export async function deleteStoredFile(path) {
  if (!path) return;
  await deleteObject(ref(storage, path));
}
