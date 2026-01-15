const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (data, { onPreviewPicture, onLikeIcon, onDeleteCard, userId }) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  if (data.likes.length > 0) {
    likeCounter.textContent = data.likes.length;
  }

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  if (data.owner._id !== userId) {
    deleteButton.remove();
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      onLikeIcon(data._id, likeButton, likeCounter);
    });
  }


  if (onDeleteCard && deleteButton) {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(data._id, cardElement);
    });
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: data.name, link: data.link })
    );
  }

  return cardElement;
};

