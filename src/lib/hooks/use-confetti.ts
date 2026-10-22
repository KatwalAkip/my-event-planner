"use client";

import confetti from "canvas-confetti";

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#C25E42", "#2D5A46", "#E3A857", "#8E7D6B"],
    });
  } catch (err) {
    // Canvas confetti silent fallback
  }
}
