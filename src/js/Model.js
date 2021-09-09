import "firebase/auth";
import "firebase/analytics";
import "firebase/firestore";
import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCiXLF-g5ooZf1EGfBI6B7E3_IZHKpj9IM",
  authDomain: "feedback-app-e1aad.firebaseapp.com",
  projectId: "feedback-app-e1aad",
  storageBucket: "feedback-app-e1aad.appspot.com",
  messagingSenderId: "158315436943",
  appId: "1:158315436943:web:b2025a9548d52cff4fc9fa",
  measurementId: "G-XNVR3BGMC2",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// to signup new user

function avtar() {
  const random = Math.random().toFixed(5);
  const url = `https://avatars.dicebear.com/api/bottts/${random}.svg`;
  return url;
}

export const userSignUp = async function (email, password, userName) {
  const avtarr = avtar();
  try {
    if (!email && !password) return;
    const promise = await firebase.auth().createUserWithEmailAndPassword(email, password);

    await promise.user.updateProfile({
      displayName: userName,
      photoURL: avtarr,
    });

    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        user: promise.user.displayName,
        id: promise.user.uid,
        photo: promise.user.photoURL,
      })
    );

    await promise.user.sendEmailVerification({
      url: "https://feedback-application.netlify.app/path?confirm_email=true",
    });
    redirectedEmail();
  } catch (err) {
    throw err;
  }
};

const redirectedEmail = function () {
  const urlParams = new URLSearchParams(window.location.search);
  const isConfirmingEmail = urlParams.get("confirm-email");

  firebase
    .auth()
    .currentUser.getIdToken(!!isConfirmingEmail)
    .then(() => {
      console.log("email verified");
    });
};

// to login user

export const userLogin = async function (email, password) {
  try {
    if (!email && !password) return;
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (err) {
    throw err;
  }
};

// to logout user

export const logoutUser = async function () {
  try {
    await firebase.auth().signOut();
  } catch (err) {
    throw err;
  }
};

function databseInitializer() {
  const DB = firebase.firestore();
  // getting user id
  const { id } = JSON.parse(localStorage.getItem("userInfo")) || false;

  return [DB, id];
}

// create a database

const createDB = function (collectionName, docID, data) {
  const [DB, userID] = databseInitializer();

  // if user is not logged in return;
  if (!userID) return false;

  DB.collection(collectionName)
    .doc(docID || userID)
    .set(data, { merge: true })
    .catch((err) => err);
};

// users personel database to perform CRUD
export const createUserDB = function (userFeedbackData, uniqid) {
  const userDB = createDB("users", null, {
    [uniqid]: {
      ...userFeedbackData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    },
  });

  if (userDB === false) return new Error("Please log in first!");
};

// global database for all users to perform read
export const createGlobalDB = function (userFeedbackData, uniqid) {
  const [, userID] = databseInitializer();
  const userDB = createDB("global-users", "global-read", {
    [`${userID}-${uniqid}`]: {
      ...userFeedbackData,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    },
  });

  if (userDB === false) return new Error("Please log in first!");
};

// READ THE DATA FROM DATABSE

export const readUserDB = async function (collectionName, docID, field = "") {
  const [DB, userID] = databseInitializer();
  // if user is not logged in return;
  if (!userID) return;
  try {
    // getting realitme user data
    const doc = await DB.collection(collectionName)
      .doc(docID || userID)
      .get(field);

    // if no data, return
    if (!doc.data()) return false;
    // else return the data
    return doc.data();
  } catch (err) {
    throw err;
  }
};

const DBUpdater = function () {
  const [DB, userID] = databseInitializer();
  // if user is not logged in return;
  if (!userID) return false;

  const updater = DB.collection("global-users").doc("global-read");

  return updater;
};

export const likesUpdater = async function (id, incrementValue = 1) {
  const updater = DBUpdater();

  try {
    if (!DBUpdater) return;
    // incrementing the likes counter by 1
    await updater.update({
      [`${id}.likes`]: firebase.firestore.FieldValue.increment(incrementValue),
    });
  } catch (err) {
    console.error(err);
  }
};

export const commentsUpdater = async function (id, incrementValue = 1) {
  const updater = DBUpdater();

  try {
    if (!DBUpdater) return;
    // incrementing the comment counter by 1
    await updater.update({
      [`${id}.replies`]: firebase.firestore.FieldValue.increment(incrementValue),
    });
  } catch (err) {
    console.error(err);
  }
};

export const editUpdater = function (userData, id) {
  const updater = DBUpdater();

  const { title, category, details } = userData;

  if (!DBUpdater) return;

  // updating the database
  updater.update({
    [`${id}.category`]: category,
    [`${id}.details`]: details,
    [`${id}.title`]: title,
  });
};

// db for comments
export const commentsDB = function (data, id) {
  const commentDB = createDB("user-comments", "comments", {
    [id]: {
      ...data,
    },
  });

  if (commentDB === false) return new Error("Please log in first!");
};

////////////////////////////////////////////////////////////////
// on application state changes, whether user logs in or logout
export const userVerificationStatus = function () {
  firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (firebaseUser && firebaseUser.emailVerified) {
      // storing user login status
      localStorage.setItem("loginStatus", "1");
    } else localStorage.setItem("loginStatus", "0");
  });
};

userVerificationStatus();
