"use strict";

import uniqid from "uniqid";
import "core-js/stable";
import "regenerator-runtime/runtime";

import * as model from "./Model";
import feedbackView from "./FeedbackView";
import view from "./View";

/////////////////////////////////////////////////////////
//! View --LOGIC--

const localStorageLoginStatus = () => +localStorage.getItem("loginStatus");
const getUserInfo = () => JSON.parse(localStorage.getItem("userInfo"));
const getCommentId = () => JSON.parse(localStorage.getItem("commentID"));

const checkUserLoginStatus = function (toggleWindowArr) {
  const loginStatus = localStorageLoginStatus();
  const [feedbackWindow, mainWindow] = toggleWindowArr;

  if (!loginStatus) return;
  feedbackWindow.classList.remove("hidden");
  mainWindow.classList.add("hidden");
};

function scrollBehaviour(bool = true) {
  return bool
    ? (document.body.style.overflow = "hidden")
    : (document.body.style.overflow = "visible");
}

const viewFeedbackHandler = function (loginWindow, feedbackWindow, mainWindow) {
  const loginStatus = localStorageLoginStatus();

  if (loginStatus) checkUserLoginStatus([feedbackWindow, mainWindow]);
  else {
    loginWindow.classList.remove("hidden");
    // turning off the scroll behavior
    scrollBehaviour(true);
  }

  // scroll back to top
  scrollTo();
};

const loginHandler = function (e, form, id) {
  if (e.target.id === "close") {
    this.parentElement.classList.add("hidden");
    // turning on the scroll behaviour
    scrollBehaviour(false);
  }
  // toggle between login and create component
  if (e.target.id === id) {
    this.classList.add("hidden");
    form.classList.remove("hidden");
  }
};

const viewLoginFormHandler = function (createAcc, e) {
  e.preventDefault();
  loginHandler.call(this, e, createAcc, "create-user");
};

const viewCreateFormHandler = function (loginAcc, e) {
  e.preventDefault();
  loginHandler.call(this, e, loginAcc, "login-user");
};

const viewBackToMainWindow = function () {
  const [mainWindow, _] = view.feedbackElements;
  // target elements parent
  this.classList.add("hidden");
  // main content
  mainWindow.classList.remove("hidden");

  // scroll back to top
  scrollTo();
};

// logout user

const viewLogoutUserHandler = function () {
  customErrorSuccessPrompt("Logged out!");
  model.logoutUser();
};

// logout user mini-prompt
function customErrorSuccessPrompt(text) {
  const loginStatus = localStorageLoginStatus();
  if (!loginStatus) return;
  const prompt = document.getElementById("error-prompt");
  const TIME = 2500;

  prompt.innerText = "";
  prompt.innerText = text;
  prompt.classList.remove("hidden");
  setTimeout(() => prompt.classList.add("hidden"), TIME);
}

function scrollTo() {
  //scroll back to top
  if (window.scrollY) window.scroll(0, 0);
}

const viewCommentHandler = function (textarea) {
  const commentText = textarea.value.trim();
  const id = uniqid();
  const userInfo = getUserInfo();
  const userID = getCommentId();
  const { photo } = getUserInfo();
  const loginStatus = localStorageLoginStatus();

  if (!loginStatus) return;

  // error handling on invalid comment
  if (commentText.length < 10) {
    textarea.nextElementSibling.classList.remove("hidden");
    textarea.classList.add("error");

    return;
  } else {
    textarea.nextElementSibling.classList.add("hidden");
    textarea.classList.remove("error");

    // storing the comment in DB
    model.commentsDB(
      {
        comment: commentText,
        commentBy: userInfo.user,
        photo,
      },
      `${userID}-${id}`
    );

    textarea.value = "";

    // live updating comment into the dom;
    readCommentData(userID);
    // updating the commetn count in DB
    model.commentsUpdater(userID, 1);
  }
};

const viewKeyCountHandler = function (commentCount, e) {
  let value = +commentCount.innerText;
  // comment character increment feature
  if (e.keyCode === 8) return !(value >= 250) ? (commentCount.innerText = ++value) : "";
  else return !(value <= 0) ? (commentCount.innerText = --value) : "";
};

const filterHandler = function (tag) {
  const feedbackContainer = [...feedbackView.feedbackContainer.children];

  feedbackContainer.forEach((child) => {
    if (child.dataset.category !== tag) child.classList.add("hidden");
    else child.classList.remove("hidden");
  });

  return function () {
    const hidden = feedbackContainer.every((child) => child.classList.contains("hidden"));
    const child = [...document.querySelectorAll(".no-feedback")] || null;

    // removing no-feedback message
    if (!hidden) {
      return child && child.forEach((item) => feedbackView.feedbackContainer.removeChild(item));
    } else {
      // displaying no-feedback
      feedbackView.feedbackContainer.insertAdjacentHTML(
        "beforeend",
        '<span class="no-feedback">No Feedback</span>'
      );
    }

    // return feedbackView.feedbackContainer.children.length;
  };
};

const viewFilterAllHandler = function () {
  const feedbackContainer = [...feedbackView.feedbackContainer.children];

  feedbackContainer.forEach((child) =>
    child.classList.contains("hidden") ? child.classList.remove("hidden") : ""
  );

  viewUpdateSuggestions();
};

const viewFilterUiHandler = function () {
  filterHandler("UI")();
  viewUpdateSuggestions();
};

const viewFilterUxHandler = function () {
  filterHandler("UX")();
  viewUpdateSuggestions();
};

const viewFilterBugHandler = function () {
  filterHandler("Bug")();
  viewUpdateSuggestions();
};

const viewFilterFeatureHandler = function () {
  filterHandler("Feature")();
  viewUpdateSuggestions();
};

const viewFilterEnhanceHandler = function () {
  filterHandler("Enhancement")();
  viewUpdateSuggestions();
};

function viewUpdateSuggestions() {
  const container = [...feedbackView.feedbackContainer.children];
  const children = container.filter(
    (child) => !child.classList.contains("no-feedback") && !child.classList.contains("hidden")
  );
  // updating the suggestions result
  suggestions.innerText = children.length || 0;
}

const insertElements = function (feedbackHTML) {
  const feedbackContainer = feedbackView.feedbackContainer;
  if (feedbackContainer.innerHTML) feedbackContainer.innerHTML = "";
  // inserting feedback in to the DOM
  feedbackHTML.forEach((ele) => feedbackContainer.insertAdjacentElement("beforeend", ele));
};

function sort(value, sortBy) {
  const feedback = [...feedbackView.feedbackContainer.children].filter(
    (ele) => !ele.classList.contains("hidden")
  );

  if (feedback.length === 0) return;

  if (
    (value === "Most Upvotes" && sortBy === "likes") ||
    (value === "Most Comments" && sortBy === "comments")
  ) {
    const arr = feedback.sort(
      (a, b) =>
        +b.querySelector(`#feedback-${sortBy}-btn`).dataset[`${sortBy}`] -
        +a.querySelector(`#feedback-${sortBy}-btn`).dataset[`${sortBy}`]
    );
    insertElements(arr);
  }

  if (
    (value === "Least Upvotes" && sortBy === "likes") ||
    (value === "Least Comments" && sortBy === "comments")
  ) {
    const arr = feedback.sort(
      (a, b) =>
        +a.querySelector(`#feedback-${sortBy}-btn`).dataset[`${sortBy}`] -
        +b.querySelector(`#feedback-${sortBy}-btn`).dataset[`${sortBy}`]
    );
    insertElements(arr);
  }
}

function viewSortBy() {
  const { value } = this;

  if (value === "select") return;
  if (value === "Most Upvotes") sort(value, "likes");
  if (value === "Least Upvotes") sort(value, "likes");
  if (value === "Most Comments") sort(value, "comments");
  if (value === "Least Comments") sort(value, "comments");
}

// helper class for form validation

class FormLogic {
  static _LOGIN_ERROR = document.querySelector(".login-error-msg");
  static _CREATE_ERROR = document.querySelector(".create-error-msg");

  // trim input values for spaces

  static inputValueTrimmer(inputVal) {
    return inputVal.value.trim();
  }

  // render error message on false user input
  static errorMessage(msg, formType) {
    let auth;

    if (!formType) return;

    if (formType === "login") auth = this._LOGIN_ERROR;
    else auth = this._CREATE_ERROR;

    auth.classList.remove("hidden");
    auth.innerText = "";
    auth.innerText = msg.replace("auth/", "");
  }

  // reset error msg when given input is true

  static resetErrorMsg() {
    this._LOGIN_ERROR.innerText = "";
    this._CREATE_ERROR.innerText = "";
  }
}

class FormValidation {
  // user creates new account validation form

  async validateNewCreateUser(userData, siblings, e) {
    e.preventDefault();
    try {
      let nameValid = false,
        passValid = false,
        mailValid = false;

      const [userNameEle, userEmailEle, userPassEle, userRepeatPassEle] = userData;

      const userName = FormLogic.inputValueTrimmer(userData[0]);
      const userEmail = FormLogic.inputValueTrimmer(userData[1]);
      const userPass = FormLogic.inputValueTrimmer(userData[2]);
      const userRepeatPass = FormLogic.inputValueTrimmer(userData[3]);

      // regex for validating email
      const validateEmail = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail+.com$/g;

      if (userPass !== userRepeatPass || (userPass.length <= 0 && userRepeatPass.length <= 0)) {
        userPassEle.classList.add("error");
        userRepeatPassEle.classList.add("error");
        passValid = false;
      } else {
        passValid = true;
        userPassEle.classList.remove("error");
        userRepeatPassEle.classList.remove("error");
      }

      if (!validateEmail.test(userEmail)) {
        userEmailEle.classList.add("error");
        mailValid = false;
      } else {
        mailValid = true;
        userEmailEle.classList.remove("error");
      }

      if (userName.length < 5) {
        userNameEle.classList.add("error");
        nameValid = false;
      } else {
        nameValid = true;
        userNameEle.classList.remove("error");
      }

      if (nameValid && passValid && mailValid) {
        // loader
        loader(5000);
        //
        await model.userSignUp(userEmail, userPass, userName);
        // opening gmail app for verification
        window.open("https://gmail.com", "_blank");
        // checking login status
        checkUserLoginStatus(siblings);
        //resetting the error message
        FormLogic.resetErrorMsg();
        //default scroll behaviour
        scrollBehaviour(false);
        // reset singup form input fields
        userNameEle.value = userEmailEle.value = userPassEle.value = userRepeatPassEle.value = "";
      } else return;
    } catch (err) {
      FormLogic.errorMessage(err.code, "create");
    }
  }

  // user login form
  async validateLoggedUser(userData, siblings, e) {
    e.preventDefault();

    // loader
    loader(3000);

    try {
      const email = FormLogic.inputValueTrimmer(userData[0]);
      const password = FormLogic.inputValueTrimmer(userData[1]);

      // validate user email and password
      if (!email.length <= 0 && !password.length <= 0) await model.userLogin(email, password);
      //hiding the login component
      this.classList.add("hidden");
      //default scroll behaviour
      scrollBehaviour(false);
      // checking login status
      checkUserLoginStatus(siblings);
      //resetting the error message
      FormLogic.resetErrorMsg();
      //resetting login form  input fields
      userData[0].value = userData[1].value = "";
    } catch (err) {
      FormLogic.errorMessage(err.code, "login");
    }
  }
}

const validateForm = new FormValidation();

// feeback view

const upperCaseConverter = (val) => {
  // converting the user feedback data first letter to upper case
  const newValue = val.toLowerCase();
  return newValue.replace(newValue[0], newValue[0].toUpperCase());
};

const feedbackErrorHandler = function (title, details) {
  const titleError = title.closest("label").lastElementChild.classList;
  const detailsError = details.closest("label").lastElementChild.classList;

  if (title.value.length < 10 && details.value.length < 25) {
    title.classList.add("error");
    titleError.remove("hidden");
    detailsError.remove("hidden");
    details.classList.add("error");
    return false;
  } else {
    title.classList.remove("error");
    titleError.add("hidden");
    detailsError.add("hidden");
    details.classList.remove("error");
    return true;
  }
};

const feedbackViewHandler = function (data, e) {
  e.preventDefault();

  const { title, category, details } = data;

  const ID = uniqid();
  // if feedback field is empty || < required then error
  const feedbackErrorStatus = feedbackErrorHandler(title, details);

  if (!feedbackErrorStatus) return;

  // adding the values to the databse;
  const userData = {
    title: upperCaseConverter(title.value.trim()),
    category: category.value.trim(),
    details: upperCaseConverter(details.value.trim()),
  };

  // global users data
  model.createGlobalDB({ ...userData, likes: 0, replies: 0 }, ID);

  // resetting the values
  title.value = details.value = "";
  // closing the window
  viewBackToMainWindow.call(this);
  // reading and displaying feedback
  readFeedbackUserData();
};

function loader(time = 2000) {
  const loader = document.querySelector(".loader");
  loader.classList.remove("hidden");

  setTimeout(() => loader.classList.add("hidden"), time);
}

////////////////////////////////////////////////////////////////

const readFeedbackUserData = async function () {
  loader();

  try {
    const data = await model.readUserDB("global-users", "global-read");
    if (!data) return;

    const feedbackData = Object.entries(data);
    const feedbackContainer = feedbackView.feedbackContainer;

    // Displaying data on the UI

    const feedbackHTML = feedbackData.map((dataItem) => {
      const [id, dataItems] = dataItem;

      return feedbackView.addUserFeedback({
        id: id,
        title: dataItems.title,
        description: dataItems.details,
        likes: dataItems.likes,
        comments: dataItems.replies,
        tag: dataItems.category,
      });
    });

    if (feedbackContainer.innerHTML) feedbackContainer.innerHTML = "";
    // inserting feedback in to the DOM
    feedbackContainer.insertAdjacentHTML("beforeend", feedbackHTML.join(""));
    // toggling the overflow class
    feedbackContainer.children.length >= 3
      ? feedbackContainer.classList.add("overflow")
      : feedbackContainer.classList.remove("overflow");
    // loading liked buttons
    viewUpdateSuggestions();
    LikesFeedback.loadLikes(feedbackContainer);
  } catch (err) {
    console.error(err);
  }
};

readFeedbackUserData();

async function readCommentData(id) {
  const feedbackElement = feedbackView.feedbackComment;

  if (feedbackElement.innerHTML) feedbackElement.innerHTML = "";

  try {
    const comments = await model.readUserDB("user-comments", "comments");
    if (!comments) return;

    const data = [];
    const dataArr = Object.entries(comments);

    // filtering invalid comments
    const newArr = dataArr
      .map((data) => (data[0].includes(id) ? data[1] : null))
      .filter((data) => data);

    newArr.forEach((ele) => {
      const { comment, commentBy, photo } = ele;
      data.push(feedbackView.addUserComments(photo, commentBy, comment));
    });

    feedbackElement.previousElementSibling.innerText = `${data.length} Comments`;
    setTimeout(() => feedbackElement.insertAdjacentHTML("beforeend", data.join("")), 1000);
  } catch (err) {
    console.error(err);
  } finally {
    loader(1000);
  }
}

// feedback likes feature

class LikesFeedback {
  static setLocalStorage(data) {
    return localStorage.setItem("feedbackLikes", JSON.stringify(data));
  }

  static getLocalStorage() {
    return JSON.parse(localStorage.getItem("feedbackLikes"));
  }

  static addLikes(element) {
    // add likes
    element.classList.add("likes-background", "likes-counter");
    element.firstElementChild.style.stroke = "#fff";
  }

  static removeLikes(element) {
    // remove likes
    element.classList.remove("likes-background", "likes-counter");
    element.firstElementChild.style.stroke = "#6a71c4";
  }

  static loadLikes(feedbackContainer) {
    const likesData = LikesFeedback.getLocalStorage();
    if (!likesData) return;

    const feedbackChild = [...feedbackContainer.children];

    feedbackChild.forEach((child) => {
      if (likesData.includes(child.dataset.id)) {
        // selecting the child of btn element
        const childBtn = child.querySelector("#feedback-likes-btn");
        // adding liked classes
        LikesFeedback.addLikes(childBtn);
      } else return;
    });
  }
}

const likedUserFeedbacks = function (feedback, status) {
  if (status) {
    const getData = LikesFeedback.getLocalStorage();
    if (!getData) LikesFeedback.setLocalStorage([feedback]);
    // adding the new feedback
    else {
      getData.push(feedback);
      // updating the localstorage
      const filteredLocalData = getData.filter((items) => items);
      LikesFeedback.setLocalStorage(filteredLocalData);
    }
  } else {
    // removing like from localstorage
    const getData = LikesFeedback.getLocalStorage();
    const index = getData.indexOf(feedback);
    getData[index] = 0;
    // updating the localstorage when user remove like
    LikesFeedback.setLocalStorage(getData);
  }
};

const feedbackViewLikesHandler = function (btnElement) {
  const feedbackId = btnElement.parentElement.dataset.id;
  const btnLastChild = btnElement.lastElementChild;

  if (
    btnElement.classList.contains("likes-background") &&
    btnElement.classList.contains("likes-counter")
  ) {
    LikesFeedback.removeLikes(btnElement);
    // removing the like from localstorage
    likedUserFeedbacks(feedbackId, 0);
    // decerementing the likes counter once firebase
    (function likesUpdater(id) {
      model.likesUpdater(id, -1);
      btnElement.firstElementChild.classList.remove("arrow-up-anim");
      // decrementing the DOM like value
      btnLastChild.innerText = +btnLastChild.textContent - 1;
    })(feedbackId);
  } else {
    LikesFeedback.addLikes(btnElement);
    // adding the like from localstorage
    likedUserFeedbacks(feedbackId, 1);

    // incrementing the like counter once in firebase
    (function likesUpdater(id) {
      model.likesUpdater(id, 1);
      btnElement.firstElementChild.classList.add("arrow-up-anim");
      // incrementing the DOM like value
      btnLastChild.innerText = +btnLastChild.textContent + 1;
    })(feedbackId);
  }
};

const feedbackEditHandler = function (editWindow) {
  const [_, parentEle] = view.feedbackElements;
  parentEle.classList.add("hidden");
  editWindow.classList.remove("hidden");
};

const feedbackBackToComment = function () {
  const [_, commentWindow] = view.feedbackElements;
  this.classList.add("hidden");
  commentWindow.classList.remove("hidden");
};

const updateFeedbackHandler = function (data, e) {
  e.preventDefault();

  const { title, category, details } = data;

  // if feedback field is empty || < required then error
  const feedbackErrorStatus = feedbackErrorHandler(title, details);

  if (!feedbackErrorStatus) return;

  const commentID = getCommentId();

  // transforming the user input
  const userData = {
    title: upperCaseConverter(title.value.trim()),
    category: category.value.trim(),
    details: upperCaseConverter(details.value.trim()),
  };

  // global users data
  model.editUpdater(userData, commentID);
  title.value = details.value = "";
  // closing the window
  viewBackToMainWindow.call(this);
  // reading and displaying feedback
  readFeedbackUserData();
};

const feedbackViewCommentsHandler = function (feedbackEle) {
  const [mainWindow, displayFeedback] = view.feedbackElements;
  const [feedbackUser, editFeedback] = feedbackView.displayFeedbackEle;
  const newNode = feedbackEle.cloneNode(true);
  const paragraph = newNode.querySelector(".feedback-content__para");
  const ID = feedbackEle.dataset.id;
  const [datasetId] = ID.split("-");
  const { id: userID } = getUserInfo();

  localStorage.setItem("commentID", JSON.stringify(ID));

  // scroll back to top
  scrollTo();
  // displaying the comments on feedback
  readCommentData(ID);

  datasetId === userID
    ? editFeedback.classList.remove("hidden")
    : editFeedback.classList.add("hidden");

  paragraph.lastElementChild.classList.remove("hidden");
  paragraph.innerText = paragraph.innerText.replace("...", "").trim();

  mainWindow.classList.add("hidden");
  displayFeedback.classList.remove("hidden");

  // inserting clone of selected feedback
  feedbackUser.innerHTML = "";
  feedbackUser.insertAdjacentElement("beforeend", newNode);
};

/////////////////////////////////////////////////////

const init = function () {
  view.addFeedbackHandler(viewFeedbackHandler);
  view.addCreateUserHandler(validateForm.validateNewCreateUser);
  view.addLoginUserHandler(validateForm.validateLoggedUser);
  view.addBackToFeedbackFormHandler(viewBackToMainWindow);
  view.addLogoutUserHandler(viewLogoutUserHandler);
  view.addFormHandler(viewLoginFormHandler, viewCreateFormHandler);
  view.addCommentHandler(viewCommentHandler, viewKeyCountHandler);
  view.addFilterByTagHandler(
    viewFilterAllHandler,
    viewFilterUiHandler,
    viewFilterUxHandler,
    viewFilterBugHandler,
    viewFilterFeatureHandler,
    viewFilterEnhanceHandler
  );

  view.addSelectHandler(viewSortBy);

  ////////////////////////////////////////////////////////////////
  feedbackView.addCancelFeedbackHandler(viewBackToMainWindow);
  feedbackView.addFeedbackHandler(feedbackViewHandler);
  feedbackView.addFeedbackListeners(feedbackViewLikesHandler, feedbackViewCommentsHandler);
  feedbackView.addBackToMainHandler(viewBackToMainWindow);
  feedbackView.addEditFeedbackHandler(
    feedbackEditHandler,
    feedbackBackToComment,
    updateFeedbackHandler
  );
};

init();
