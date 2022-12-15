import React from "react";

export default function Spinner({ blue }) {
  blue = blue || false;

  return (
    <div
      className={`inline-block animate-spin spinner-border w-4 h-4 border-b-2 -mb-0.5 ${
        blue ? "border-blue-500" : ""
      } rounded-full`}
    ></div>
  );
}
