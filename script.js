document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".page-progress");
  const backToTop = document.querySelector(".back-to-top");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const navLinks = [...document.querySelectorAll(".main-nav a")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll progress, compact header and back-to-top control.
  const onScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progress.style.width = `${percentage}%`;
    header.classList.toggle("scrolled", window.scrollY > 20);
    backToTop.classList.toggle("visible", window.scrollY > 550);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile navigation.
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open", !expanded);
  });
  navLinks.forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  // Reveal sections as they enter the viewport.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index % 4, 3) * 75}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Highlight navigation according to the current section.
  const sections = [...document.querySelectorAll("main section[id], main section.hero")];
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id || "top";
        navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Interactive export map: hovering a market highlights the route network and changes the label.
  const mapWrap = document.querySelector(".map-wrap");
  const mapTooltip = document.querySelector(".map-tooltip");
  const mapTooltipTitle = mapTooltip.querySelector("strong");
  const mapTooltipSubtitle = mapTooltip.querySelector("small");
  const marketButtons = [...document.querySelectorAll(".market")];
  const marketLabels = {
    "Asia": "Asia", "Africa": "Africa", "Middle East": "Middle East",
    "Europe": "Europe", "North America": "North America", "South America": "South America"
  };
  marketButtons.forEach(button => {
    button.addEventListener("mouseenter", () => setMarket(button));
    button.addEventListener("focus", () => setMarket(button));
    button.addEventListener("click", () => setMarket(button));
  });
  function setMarket(button) {
    marketButtons.forEach(item => item.classList.toggle("active", item === button));
    const market = button.dataset.market;
    mapTooltipTitle.textContent = marketLabels[market] || market;
    mapTooltipSubtitle.textContent = market === "Asia" ? "Regional export routes" : "International export market";
    mapWrap.classList.add("market-highlight");
    mapWrap.dataset.activeMarket = market;
  }
  mapWrap.addEventListener("mouseleave", () => {
    mapWrap.classList.remove("market-highlight");
  });

  // Animated counters when the impact strip comes into view.
  const stats = document.querySelectorAll(".stat strong[data-count]");
  const countUp = element => {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || "";
    const duration = 1300;
    const start = performance.now();
    const format = n => n.toLocaleString("en-US");
    const step = now => {
      const progressValue = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = `${format(Math.round(target * eased))}${suffix}`;
      if (progressValue < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !reduceMotion) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    stats.forEach(stat => statsObserver.observe(stat));
  }

  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  document.querySelector("#year").textContent = new Date().getFullYear();

  // Friendly fallback for unavailable remote images.
  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => {
      img.style.background = "linear-gradient(135deg, #d8c8aa, #eee5d4)";
      img.alt = `${img.alt} (image unavailable)`;
    }, { once: true });
  });
});
