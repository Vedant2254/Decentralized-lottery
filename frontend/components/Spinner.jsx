import React from "react";

export default function Spinner({ size, blue }) {
  size = size || "4";
  blue = blue || false;

  return (
    <div
      className={`inline-block animate-spin spinner-border w-${size} h-${size} border-b-2 -mb-0.5 ${
        blue ? "border-blue-500" : ""
      } rounded-full`}
    ></div>
  );
}
