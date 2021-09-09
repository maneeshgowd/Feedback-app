class View {
  _addFeedback = document.getElementById("add-feedback");
  _userAuth = document.getElementById("user-auth");
  _userLogin = document.getElementById("user-login");
  _createAccount = document.getElementById("create-account");
  _feedbackWindow = document.getElementById("feedback-window");
  _mainWindow = document.getElementById("main-content");
  _backToMainWindow = document.getElementById("feedback-form__back");
  _displayFeedback = document.getElementById("display-feedback");

  ///

  _suggestions = document.getElementById("suggestions");
  _tagByFilter = document.getElementById("tag-filter");
  _menuFilter = document.getElementById("filter-menu");
  _sortBy = document.getElementById("sortby");

  // new user
  _createUser = document.getElementById("verify-new-user");
  _newEmail = document.getElementById("new-email");
  _newUserName = document.getElementById("new-username");
  _newPassword = document.getElementById("new-password");
  _newRepeatPassword = document.getElementById("new-repeat-password");

  // existing user
  _existingEmail = document.getElementById("existing-email");
  _existingPassword = document.getElementById("existing-password");
  _loginUser = document.getElementById("login-existing-user");

  // menu bar
  _menuBar = document.getElementById("menu-bars");
  _menuWindow = document.getElementById("menu-window");
  _menuWindowClose = document.getElementById("menu-window-close");

  // logout
  _logout = document.getElementById("logout");
  _menuLogout = document.getElementById("menu-logout");

  // comments
  _comment = document.getElementById("comment");
  _commentsCount = document.getElementById("comments-counter");
  _postComment = document.getElementById("post-comment");

  constructor() {
    this._menuBar.addEventListener("click", this._addMenuHandler.bind(this));
    this._menuWindowClose.addEventListener("click", this._addMenuCloseHandler.bind(this));
  }

  _addMenuHandler() {
    this._menuWindow.classList.remove("menu-slider");
    document.body.style.overflow = "hidden";
  }

  _addMenuCloseHandler() {
    document.body.style.overflow = "visible";
    this._menuWindow.classList.add("menu-slider");
  }

  addFeedbackHandler(handler) {
    this._addFeedback.addEventListener(
      "click",
      handler.bind(this._addFeedback, this._userAuth, this._feedbackWindow, this._mainWindow)
    );
  }

  addFormHandler(loginHandler, createHandler) {
    this._userLogin.addEventListener(
      "click",
      loginHandler.bind(this._userLogin, this._createAccount)
    );
    this._createAccount.addEventListener(
      "click",
      createHandler.bind(this._createAccount, this._userLogin)
    );
  }

  addCreateUserHandler(handler) {
    this._createUser.addEventListener(
      "click",
      handler.bind(
        this._createUser,
        [this._newUserName, this._newEmail, this._newPassword, this._newRepeatPassword],
        [this._feedbackWindow, this._mainWindow]
      )
    );
  }

  addLoginUserHandler(handler) {
    this._loginUser.addEventListener(
      "click",
      handler.bind(
        this._userAuth,
        [this._existingEmail, this._existingPassword],
        [this._feedbackWindow, this._mainWindow]
      )
    );
  }

  addBackToFeedbackFormHandler(handler) {
    const parentElement = this._backToMainWindow.closest(".new-feedback");

    this._backToMainWindow.addEventListener("click", handler.bind(parentElement));
  }

  addLogoutUserHandler(handler) {
    this._logout.addEventListener("click", handler);
    this._menuLogout.addEventListener("click", () => {
      handler();
      this._addMenuCloseHandler();
    });
  }

  addCommentHandler(handlerComment, decHandlerCount) {
    this._postComment.addEventListener(
      "click",
      handlerComment.bind(this._postComment, this._comment)
    );

    this._comment.addEventListener(
      "keydown",
      decHandlerCount.bind(this._comment, this._commentsCount)
    );
  }

  // filters:

  addFilterByTagHandler(
    hashtagAllHandler,
    hashtagUiHandler,
    hashtagUxHandler,
    hashtagBugHandler,
    hashtagFeatureHandler,
    hashtagEnhHandler
  ) {
    function filterHelper(e) {
      e.preventDefault();
      if (e.target.id === "hashtag-all") hashtagAllHandler(e);
      if (e.target.id === "hashtag-ui") hashtagUiHandler(e);
      if (e.target.id === "hashtag-ux") hashtagUxHandler(e);
      if (e.target.id === "hashtag-bug") hashtagBugHandler(e);
      if (e.target.id === "hashtag-feature") hashtagFeatureHandler(e);
      if (e.target.id === "hashtag-enhancement") hashtagEnhHandler(e);
      else return;
    }

    this._tagByFilter.addEventListener("click", (e) => {
      filterHelper(e);
    });

    this._menuFilter.addEventListener("click", (e) => {
      filterHelper(e);
      this._addMenuCloseHandler();
    });
  }

  addSelectHandler(handler){
    this._sortBy.addEventListener('change',handler);
  }

  get feedbackElements() {
    return [this._mainWindow, this._displayFeedback];
  }

  get suggestions() {
    return this._suggestions;
  }

  get sortBy(){
    return this._sortBy;
  }
}

export default new View();
