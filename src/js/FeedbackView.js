import comment from "url:../icons/comment.svg";

class FeedbackView {
  // new Feedback
  _feedbackTitle = document.getElementById("feedback-title");
  _feedbackCategory = document.getElementById("category");
  _feedbackDetails = document.getElementById("feedback-details");
  //
  _editFeedbackTitle = document.getElementById("edit-feedback-title");
  _editFeedbackCategory = document.getElementById("edit-feedback-category");
  _editFeedbackDetails = document.getElementById("edit-feedback-details");
  //
  _submitFeedback = document.getElementById("submit-feedback");
  _cancelFeedback = document.getElementById("cancel-feedback");
  
  _feedbackContainer = document.querySelector(".feedback");
  _displayFeedbackBack = document.getElementById("display-feedback__back");
  _editFeedback = document.getElementById("edit-feedback");
  _editFeedbackWindow = document.getElementById("edit-feedback-window");
  _displayUserFeedback = document.querySelector(".display-feedback__user");
  _displayFeedbackComments = document.querySelector(".feedback-user-comments");

  addFeedbackHandler(handler) {
    this._submitFeedback.addEventListener(
      "click",
      handler.bind(this._submitFeedback, {
        title: this._feedbackTitle,
        category: this._feedbackCategory,
        details: this._feedbackDetails,
      })
    );
  }

  addCancelFeedbackHandler(handler) {
    const parentElement = this._cancelFeedback.closest(".new-feedback");

    this._cancelFeedback.addEventListener("click", handler.bind(parentElement));
  }

  addBackToMainHandler(handler) {
    const parentElement = this._displayFeedbackBack.closest(".display-feedback");

    this._displayFeedbackBack.addEventListener("click", handler.bind(parentElement));
  }

  addUserFeedback(data) {
    const { id, title, description, tag, likes, comments } = data;
    const feedbackTag =
      tag.length === 2 ? tag.toUpperCase() : tag.replace(tag[0], tag[0].toUpperCase());

    return `            
    <div class="feedback-user" data-id="${id}" id="feedback-user" data-category="${feedbackTag}">
      <div class="feedback-content">
        <h1 class="feedback-content__title">${title}</h1>
        <p class="feedback-content__para">
          ${description.substr(0, 80)}...<span class="hidden">${description.substr(80)}</span> 
        </p>
        <div class="feedback-content__tag">${feedbackTag}</div>
      </div>
      <button type="button" class="feedback-user__button" id="feedback-likes-btn" data-likes=${likes}>
        <svg xmlns="http://www.w3.org/2000/svg" class="button__icons" width="44" height="44" viewBox="0 0 24 24" stroke-width="2.5" stroke="#6a71c4" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <polyline points="6 15 12 9 18 15" />
        </svg>
        <span>${likes}</span>
      </button>
      <button type="button" class="feedback-user__button" id="feedback-comments-btn" data-comments=${comments}>
        <img src="${comment}" class="button__icons" alt="comments" />
        <span>${comments}</span>
      </button>
    </div>`;
  }

  addUserComments(icon, username, comment) {
    return `
    <div class="user-comments">
      <img src="${icon}" alt="user" class="user-img" />
      <div>
        <h1 class="user-comments__user">${username}</h1>
        <p class="user-comments__comment">${comment}</p>
      </div>
    </div>
    `;
  }

  addFeedbackListeners(handlerLikes, handlerComments) {
    this._feedbackContainer.addEventListener("click", (e) => {
      if (e.target.id === "feedback-likes-btn") handlerLikes(e.target);
      if (e.target.id === "feedback-user") handlerComments(e.target);
      else return;
    });

    this._displayUserFeedback.addEventListener("click", (e) => {
      if (e.target.id === "feedback-likes-btn") handlerLikes(e.target);
      else return;
    });
  }

  addEditFeedbackHandler(handlerEdit, handlerBack, handlerPost) {

    const data = {
      title: this._editFeedbackTitle,
      category: this._editFeedbackCategory,
      details: this._editFeedbackDetails,
    };

    this._editFeedback.addEventListener(
      "click",
      handlerEdit.bind(this._editFeedback, this._editFeedbackWindow)
    );

    this._editFeedbackWindow.addEventListener("click", function (e) {
      // go back to comment window
      if (e.target.id === "edit-form__back" || e.target.id === "edit-cancel-feedback")
        handlerBack.call(this);
      // update the feedback on submit
      else if (e.target.id === "edit-submit-feedback") handlerPost.call(this,data, e);
      else return;
    });
  }

  get feedbackContainer() {
    return this._feedbackContainer;
  }

  get displayFeedbackEle() {
    return [this._displayUserFeedback, this._editFeedback];
  }

  get feedbackComment() {
    return this._displayFeedbackComments;
  }
}

export default new FeedbackView();
