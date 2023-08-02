export default function initAvatar(onChange) {
  const pickImageButton = document.getElementById("btn-pick-image");
  const filePicker = document.getElementById("file-avatar");
  const avatarImg = document.getElementById("img-avatar");

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
