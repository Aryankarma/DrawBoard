import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  // signOut,
} from "firebase/auth";
import ErrorMessage from "../components/ErrorMessage";
import "./styles.css";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_ApiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectID,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appID,
  measurementId: import.meta.env.VITE_measurementID,
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
auth.useDeviceLanguage();

const Home = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [authState, setAuthState] = useState(auth);
  const [error, setError] = useState("");
  const [errorCount, setErrorCount] = useState(0);
  const [loginSignupStatus, setLoginSignupStatus] = useState("login");

  const navigate = useNavigate();

  const googleSignin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential!.accessToken;
        // The signed-in user info.
        const user = result.user;
        // as auth state has now changed
        console.log(user);
        setAuthState(auth);
        navigate("/secured");
      })
      .catch((error) => {
        // Handle Errors here.

        const errorMessage = error.message;
        const showError = errorMessage.replace("Firebase: ", "").trim();
        setError(showError);
        setErrorCount(errorCount + 1);
        // const email = error.customData.email;
        // const credential = GoogleAuthProvider.credentialFromError(error);
      });
  };

  useEffect(() => {
    // console.log("auth state change")
    getRedirectResult(auth)
      .then((_) => {})
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  }, [authState]);

  const handleSignup = () => {
    createUserWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        // as auth state has now changed
        setAuthState(auth);
        // console.log(auth)
        // console.log(user)
        // to navigate
        console.log(user);
        navigate("/secured");
      })
      .catch((error) => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        const showError = errorMessage.replace("Firebase: ", "").trim();
        setError(showError);
        setErrorCount(errorCount + 1);
      });
  };

  const handleLogin = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, pass)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log(user);
        navigate("/secured");
      })
      .catch((error) => {
        // const errorCode = error.code;
        const errorMessage = error.message;
        const showError = errorMessage.replace("Firebase: ", "").trim();
        setError(showError);
        setErrorCount(errorCount + 1);
      });
  };

  return (
    <div>
      <ErrorMessage message={error} count={errorCount} />

      <div className="homeContainer">
        <h4 className="welcomeLine text-green-800 text-4xl mt-5 text-center">
          Welcome to Collaboard!
        </h4>
        <div className="authContainer">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            name="pass"
            id="pass"
            placeholder="Password"
            onChange={(e) => setPass(e.target.value)}
          />
          {loginSignupStatus == "login" ? (
            <div>
              <button type="submit" className="mainbtn" onClick={handleLogin}>
                Log in
              </button>
              <hr />
              <button className="btn-center" onClick={googleSignin}>
                {" "}
                <FaGoogle /> Continue with Google
              </button>
              <button onClick={() => setLoginSignupStatus("signup")}>
                Sign up
              </button>
            </div>
          ) : (
            <div>
              <button type="submit" className="mainbtn" onClick={handleSignup}>
                Sign up
              </button>
              <hr />
              <button className="btn-center" onClick={googleSignin}>
                {" "}
                <FaGoogle /> Continue with Google
              </button>
              <button onClick={() => setLoginSignupStatus("login")}>
                Log in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
