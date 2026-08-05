// Plays the ingredient-select click sound. A fresh Audio instance per call
// so rapid clicks don't cut each other off.
export const playClickSound = () => {
  try {
    const audio = new Audio('/assets/click.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Autoplay can be blocked before the user has interacted with the
      // page at all — safe to ignore, it's a nice-to-have, not critical.
    });
  } catch {
    // no-op if Audio isn't available
  }
};
