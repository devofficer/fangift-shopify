import { Spinner } from "spin.js";

const spinner = new Spinner({
  scale: 3,
  animation: "spinner-line-shrink",
  color: "gray",
});

export const overlay = () => {
  $("body").addClass("blur-sm fixed overflow-hidden inset-0");
  const bodySpinner = spinner.spin(document.getElementsByTagName("body")[0]);
  return () => {
    $("body").removeClass("blur-sm fixed overflow-hidden inset-0");
    bodySpinner.stop();
  };
};

export default spinner;
