(() => {
  const images = Array.from(document.querySelectorAll(".category-image"));

  images.forEach((img) => {
    img.addEventListener("load", () => {
      img.classList.remove("image-placeholder");
    });

    img.addEventListener("error", () => {
      if (img.dataset.retryAttempted !== "true") {
        img.dataset.retryAttempted = "true";
        const separator = img.src.includes("?") ? "&" : "?";
        img.src = `${img.currentSrc || img.src}${separator}retry=${Date.now()}`;
        return;
      }

      if (img.dataset.fallbackUsed === "true") {
        img.classList.add("image-placeholder");
        return;
      }

      const fallbackSrc = img.dataset.fallbackSrc;
      if (fallbackSrc) {
        img.dataset.fallbackUsed = "true";
        img.src = fallbackSrc;
        return;
      }

      img.classList.add("image-placeholder");
    });
  });
})();

(() => {
  const cards = Array.from(document.querySelectorAll(".category-card"));
  if (!cards.length) return;

  document.body.classList.add("reveal-enabled");

  const revealCard = (card) => {
    card.classList.add("is-visible");
  };

  if (!("IntersectionObserver" in window)) {
    cards.forEach(revealCard);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealCard(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  cards.forEach((card) => observer.observe(card));
})();
