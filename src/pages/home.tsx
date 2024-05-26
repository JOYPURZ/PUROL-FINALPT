// Import statements...
import { IonAlert, IonButton, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { signOut } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { create, trash } from 'ionicons/icons'; // Import icons
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { auth, db } from './firebase';
import './home.css'; // Import the CSS file

interface ToDoItem {
  id: string;
  text: string;
}

const ToDoList: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [showLogoutAlert, setShowLogoutAlert] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [userName, setUserName] = useState<string>("");
  const history = useHistory();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        // User is not logged in, redirect to login page
        history.push('/login');
      } else {
        // Fetch todos for the logged-in user
        fetchToDos(user.uid);
        // Fetch user name
        fetchUserName(user.uid);
      }
    });

    return unsubscribe;
  }, [history]);

  const fetchToDos = async (userId: string) => {
    const q = query(collection(db, 'todos'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosList: ToDoItem[] = [];
      querySnapshot.forEach((doc) => {
        todosList.push({ id: doc.id, text: doc.data().text });
      });
      setTodos(todosList);
    });
    return unsubscribe;
  };

  const fetchUserName = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserName(userData.name);
      }
    } catch (error) {
      console.error('Error fetching user name: ', error);
    }
  };

  const handleAddToDo = async () => {
    if (text.trim() === '') return;

    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = await addDoc(collection(db, 'todos'), { text, userId: user.uid });
        setTodos([...todos, { id: docRef.id, text }]);
        setText('');
      }
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const handleDeleteToDo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'todos', id));
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  const handleEditToDo = async (id: string, text: string) => {
    setEditMode(id);
    setEditedText(text);
  };

  const handleSaveEditedToDo = async (id: string) => {
    try {
      await updateDoc(doc(db, 'todos', id), { text: editedText });
      setEditMode(null);
      setEditedText('');
      fetchToDos(auth.currentUser!.uid); // Fetch updated todos
    } catch (error) {
      console.error('Error updating document: ', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      history.push('/login');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>ToDo List</IonTitle>
          <IonButton slot="end" onClick={() => setShowLogoutAlert(true)} className="custom-button">Logout</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">New ToDo</IonLabel>
          <IonInput
            value={text}
            onIonChange={(e) => setText(e.detail.value!)}
            placeholder="Enter ToDo item"
          />
        </IonItem>
        <IonButton expand="block" onClick={handleAddToDo} className="custom-button">Add ToDo</IonButton>
        <IonList>
          {todos.map(todo => (
            <IonItem key={todo.id}>
              {editMode === todo.id ? (
                <>
                  <IonInput
                    value={editedText}
                    placeholder="Edit ToDo"
                    onIonChange={(e) => setEditedText(e.detail.value!)}
                  />
                  <IonButton slot="end" onClick={() => handleSaveEditedToDo(todo.id)} className="custom-button">Save</IonButton>
                </>
              ) : (
                <>
                  <IonLabel>{todo.text}</IonLabel>
                  <IonButton slot="end" onClick={() => handleEditToDo(todo.id, todo.text)} className="custom-button">
                    <IonIcon icon={create} />
                  </IonButton>
                  <IonButton slot="end" onClick={() => handleDeleteToDo(todo.id)} className="custom-button">
                    <IonIcon icon={trash} />
                  </IonButton>
                </>
              )}
            </IonItem>
          ))}
        </IonList>
      </IonContent>
      <IonAlert
        isOpen={showLogoutAlert}
        onDidDismiss={() => setShowLogoutAlert(false)}
        header={`Confirm Logout`}
        message={`Are you sure you want to logout, ${userName}?`}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setShowLogoutAlert(false);
            }
          },
          {
            text: 'Logout',
            handler: handleLogout,
            cssClass: 'custom-button-blue'
          }
        ]}
      />
      {/* Footer */}
    </IonPage>
  );
};

export default ToDoList;

