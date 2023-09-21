export default function initAvatar(onChange, id = "avatar") {
  const pickImageButton = document.getElementById(`btn-pick-${id}`);
  const filePicker = document.getElementById(`file-${id}`);
  const avatarImg = document.getElementById(`img-${id}`);

  pickImageButton.addEventListener("click", function () {
    filePicker.click();
  });

  filePicker.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file) {
      avatarImg.src = URL.createObjectURL(file);
    }

    if (onChange) {
      onChange(file);
    }
  });
}
