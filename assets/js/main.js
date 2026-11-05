// Page interactions: scroll spy, reveal-on-scroll, spotlight cards, cursor halo.

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll spy: highlight the nav link of the section crossing the viewport's upper third.
  const links = [...document.querySelectorAll(".nav-link")];
  const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  function setActive(id) {
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  if (sections.length) {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((section) => spy.observe(section));
    // Near the bottom the last section may never reach the trigger band.
    window.addEventListener("scroll", () => {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) setActive(sections.at(-1).id);
    }, { passive: true });
    setActive(sections[0].id);
  }

  // Reveal on scroll with a small stagger among siblings.
  const revealables = document.querySelectorAll("[data-reveal]");
  revealables.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.hasAttribute("data-reveal"));
    el.style.setProperty("--delay", `${siblings.indexOf(el) * 90}ms`);
  });
  const revealer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealables.forEach((el) => revealer.observe(el));

  // Spotlight that follows the cursor inside cards.
  document.querySelectorAll(".glass-card, .pillar").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });

  // Soft page-wide halo under the cursor.
  const halo = document.querySelector(".cursor-halo");
  if (halo && !reducedMotion) {
    window.addEventListener("pointermove", (e) => {
      halo.style.setProperty("--cx", `${e.clientX}px`);
      halo.style.setProperty("--cy", `${e.clientY}px`);
    }, { passive: true });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
