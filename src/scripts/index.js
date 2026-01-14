/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import { addNewCard, getCardList, getUserInfo, setUserInfo, setUserAvatar, deleteCard, changeLikeCardStatus } from "./components/api.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

// Попап статы
const infoPopup = document.querySelector(".popup_type_info");
const infoList = infoPopup.querySelector(".popup__info");
const infoUsersList = infoPopup.querySelector(".popup__list");
const logo = document.querySelector(".logo");

const infoDefinitionTemplate = document
  .querySelector("#popup-info-definition-template")
  .content;

const infoUserTemplate = document
  .querySelector("#popup-info-user-preview-template")
  .content;


// Айди текущего пользователя
let currentUserId;

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const renderLoading = (button, isLoading, defaultText) => {
  button.textContent = isLoading ? "Сохранение..." : defaultText;
};

const renderCreating = (button, isLoading, defaultText) => {
  button.textContent = isLoading ? "Создание..." : defaultText;
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(evt.submitter, true);
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
  .then((userData) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    closeModalWindow(profileFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    renderLoading(evt.submitter, false, "Сохранить");
  });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(evt.submitter, true);
  setUserAvatar({
    avatar: avatarInput.value,
  })
  .then((userData) => {
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    closeModalWindow(avatarFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    renderLoading(evt.submitter, false, "Сохранить");
  });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderCreating(evt.submitter, true);
  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
  .then((cardData) => {
    placesWrap.prepend(
      createCardElement(cardData, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCard,
        userId: currentUserId,
      })
    );
    closeModalWindow(cardFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    evt.submitter.textContent = "Создать";
  });
};

const addInfoItem = (title, value) => {
  const item = infoDefinitionTemplate.cloneNode(true);
  item.querySelector(".popup__info-term").textContent = title;
  item.querySelector(".popup__info-description").textContent = value;
  infoList.append(item);
};

const handleOpenInfoPopup = () => {
  infoList.innerHTML = "";
  infoUsersList.innerHTML = "";

  getCardList()
  .then((cards) => {
    // пользователи
    const usersMap = {};
    cards.forEach((card) => {
      usersMap[card.owner._id] = card.owner.name;
    });

    const totalUsers = Object.keys(usersMap).length;
    // лайки
    let totalLikes = 0;
    let maxLikes = 0;
    let champion = "";
    cards.forEach((card) => {
      const likesCount = card.likes.length;
      totalLikes += likesCount;
      if (likesCount > maxLikes) {
        maxLikes = likesCount;
        champion = card.owner.name;
      }
    });

    // вывод статистики
    addInfoItem("Всего пользователей:", totalUsers);
    addInfoItem("Всего лайков:", totalLikes);
    addInfoItem("Максимально лайков от одного:", maxLikes);
    addInfoItem("Чемпион лайков:", champion || "—");

    // популярные карточки
    const popularCards = [...cards]
      .sort((a, b) => b.likes.length - a.likes.length)
      .slice(0, 3);

    popularCards.forEach((card) => {
      const userItem = infoUserTemplate.cloneNode(true);
      const li = userItem.querySelector("li");
      li.textContent = card.name;
      infoUsersList.append(li);
    });

    openModalWindow(infoPopup);
  })
  .catch(console.log);
};



// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);
logo.addEventListener("click", handleOpenInfoPopup);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

const handleDeleteCard = (cardId, cardElement) => {
  deleteCard(cardId)
  .then(() => {
    cardElement.remove();
  })
  .catch((err) => {
    console.log(err); // В случае возникновения ошибки выводим её в консоль
  });
};

const handleLikeCard = (cardId, likeButton, likeCounter) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle("card__like-button_is-active");
      likeCounter.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log(err);
    });
};


// отображение карточек
//initialCards.forEach((data) => {
//  placesWrap.append(
//    createCardElement(data, {
//      onPreviewPicture: handlePreviewPicture,
//      onLikeIcon: likeCard,
//      onDeleteCard: deleteCard,
//    })
//  );
//});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Создание объекта с настройками валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// включение валидации вызовом enableValidation
// все настройки передаются при вызове
enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
.then(([cards, userData]) => {
  currentUserId = userData._id;
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

  cards.forEach((cardData) => {
    placesWrap.append(
      createCardElement(cardData, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeCard,
        onDeleteCard: handleDeleteCard,
        userId: currentUserId,
      })
    );
  });
})
.catch((err) => {
  console.log(err); // В случае возникновения ошибки выводим её в консоль
});
