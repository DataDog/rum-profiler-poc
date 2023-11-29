import React from "react";
import { computeHeavyThings } from "../computeHeavyThings";

export function HeavyComputation() {
  function handleClick() {
    computeHeavyThings();
  }

  return <button onClick={handleClick}>Do heavy computation</button>;
}
