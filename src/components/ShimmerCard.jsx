import React from "react";
import "./shimmer.css"; // We'll make shimmer effect here

export default function ShimmerCard() {
  return (
    <div className="shimmer-card">
      <div className="shimmer-img"></div>
      <div className="shimmer-line short"></div>
      <div className="shimmer-line"></div>
    </div>
  );
}
