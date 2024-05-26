import {
  IonAlert,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { auth, db } from "./firebase";
import "./login.css"; // Import the CSS file

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null); // State for welcome message
  const history = useHistory();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if user exists in Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // User exists, navigate to home page
        const userData = docSnap.data();
        setWelcomeMessage(`Welcome ${userData.name}`);
        setShowAlert(true);
        // Redirect to home page after showing the alert
        setTimeout(() => {
          history.push("/home");
        }, 3000); // Redirect after 3 seconds
      } else {
        // User does not exist, show alert
        setShowAlert(true);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSignup = () => {
    history.push("/signup");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="form-container">
          <IonItem className={`animated-placeholder ${email && "ion-focused"}`}>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              value={email}
              type="email"
              placeholder=""
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
          </IonItem>
          <IonItem className={`animated-placeholder ${password && "ion-focused"}`}>
            <IonLabel position="floating">Password</IonLabel>
            <IonInput
              value={password}
              type="password"
              placeholder=""
              onIonChange={(e) => setPassword(e.detail.value!)}
            />
          </IonItem>
          {error && <p className="error-message">{error}</p>}
          <div className="button-group">
            <IonButton className="login-button" onClick={handleLogin}>
              Login
            </IonButton>
          </div>
          <div className="signup-text">
            Don't have an account? <span onClick={handleSignup}>Sign Up</span>
          </div>
        </div>
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={"Purol"}
          message={welcomeMessage || "User does not exist"} // Display welcome message or default message
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
