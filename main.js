(() => {
  const showPage = () => {
    document.body.classList.add("page-ready");
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showPage();
    return;
  }

  window.addEventListener("load", () => {
    window.setTimeout(showPage, 1500);
  });
})();

(() => {
  const images = Array.from(document.querySelectorAll(".category-image"));

  images.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("is-loaded");
      img.classList.remove("image-placeholder");
    }

    img.addEventListener("load", () => {
      img.classList.add("is-loaded");
      img.classList.remove("image-placeholder");
    });

    img.addEventListener("error", () => {
      if (img.dataset.retryAttempted !== "true") {
        img.dataset.retryAttempted = "true";
        const separator = img.src.includes("?") ? "&" : "?";
        img.src = `${img.currentSrc || img.src}${separator}retry=${Date.now()}`;
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

  const isMobile = window.matchMedia("(max-width: 619px)").matches;

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
      threshold: isMobile ? 0.08 : 0.18,
      rootMargin: isMobile ? "0px 0px -2% 0px" : "0px 0px -8% 0px",
    }
  );

  cards.forEach((card) => observer.observe(card));
})();
