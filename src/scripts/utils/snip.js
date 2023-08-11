import { Spinner } from "spin.js";

const spinner = new Spinner({
  scale: 3,
  animation: "spinner-line-shrink",
  color: "gray",
}).spin();

export default spinner;
