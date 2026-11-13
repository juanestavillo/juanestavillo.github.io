// Spanish lives in index.html. This file holds the English text and swaps languages.
// Link with ?lang=en or ?lang=es to force a language.

(() => {
  const hl = (text) => `<span class="hl">${text}</span>`;
  const strong = (text) => `<strong>${text}</strong>`;

  const EN = {
    skip: "Skip to content",
    tagline: "Building scalable software, from Java back ends to reactive Angular 22 interfaces and data analysis.",
    navAbout: "About me",
    navProjects: "Experience / Projects",
    navArch: "Architecture &amp; Data",
    navContact: "Contact",
    cv: "Download CV",
    titleAbout: "About me",
    about1: `I'm a ${hl("Full-Stack developer")} with a hybrid profile: I build ${hl("robust APIs in Java and Spring Boot")} and connect them to ${hl("reactive interfaces in Angular 22")}, taking care of the architecture end to end.`,
    about2: `I'm studying at ${hl("UTN")}, with training in software management and data analysis. It helps me think beyond code: modeling systems, estimating MVPs, prioritizing deliverables, and turning data into ${hl("actionable metrics")}.`,
    about3: `I can work in English without any trouble thanks to my ${hl("fluent level (C1)")}. I'm motivated by products where technical precision and user experience go hand in hand.`,
    aboutAi: `I use AI to move faster, but ${hl("I understand and review what I deliver")}.`,
    titleProjects: "Experience / Projects",
    featured: "Featured project",
    foodiesSub: "Complete Reservation System &amp; Restaurant Dashboard",
    repoBack: "Backend repo (Spring Boot)",
    repoFront: "Frontend repo (Angular 22)",
    foodies1: `${strong("Layered RESTful architecture")} with Spring Boot 3 and MySQL.`,
    foodies2: `${strong("Role-based JWT authentication")} (customer, restaurant, admin) with Spring Security.`,
    foodies3: `${strong("Signals in Angular 22")} and Standalone Components for reactive, predictable state.`,
    foodies4: `${strong("UI with Tailwind CSS v4")}, responsive and accessible.`,
    foodies5: `${strong("Interactive map (Leaflet)")} to discover nearby restaurants.`,
    foodies6: `${strong("Metrics dashboard (Chart.js)")} with new users, ratings, reservations, and reviews.`,
    ptdeLabel: "Freelance work · In progress",
    ptdeSub: "Teaching-plan system for the School of Psychology (UNMdP)",
    ptde1: `${strong("Built on my own")}, from back end to front end.`,
    ptde2: `${strong("Approval workflow")}: teachers submit plans, students read them, and the academic office audits and approves them.`,
    ptde3: `${strong("Role-based JWT authentication")} and PDF generation.`,
    ipsibatLabel: "Internship · Since November 2026",
    ipsibatSub: "Institute of Basic, Applied and Technological Psychology (CONICET – UNMdP)",
    ipsibat1: `${strong("Internal AI assistant")} (Claude API) to query data and build reports, with role-based access.`,
    ipsibat2: `${strong("Sensitive data")} protected under Argentina's Personal Data Protection Law 25.326.`,
    ipsibat3: `${strong("Institutional website")} (WordPress) updated and connected to Instagram, with approval before publishing.`,
    more: "See more projects on GitHub",
    titleArch: "Architecture &amp; Data",
    archIntro: "Skills organized into five pillars: from stored data to business decisions.",
    pillarFront: "Modern Frontend",
    pillarData: "Data Analysis &amp; Metrics",
    pillarMgmt: "Management &amp; SW Architecture",
    pillarAi: "AI-Assisted Development",
    aiAgents: "Agents and MCP",
    aiSpec: "Specification and planning",
    aiReview: "Review of generated code",
    sql: "Advanced SQL (CTEs, Triggers)",
    dashboards: "Interactive dashboards",
    c4: "C4 model",
    diagrams: "Sequence and state diagrams",
    mvp: "MVP estimation",
    moscow: "MoSCoW prioritization",
    titleContact: "Contact",
    contactTitle: `Got a project or job opening in mind? <span class="glow-text block">Let's connect.</span>`,
    contactText: "I'm open to Full-Stack roles, freelance projects, and collaborations. I reply quickly.",
    footerBuilt: "Designed and built by Juan Estavillo ·",
    footerStack: "HTML · Tailwind CSS v4 · Canvas API — deployed on GitHub Pages.",
  };

  const ARIA_EN = {
    "Conocimientos y arquitectura de software": "Skills and software architecture",
    "Contacto": "Contact",
    "Enviar email": "Send email",
    "Experiencia y proyectos": "Experience and projects",
    "GitHub (abre en una pestaña nueva)": "GitHub (opens in a new tab)",
    "Inicio": "Home",
    "LinkedIn (abre en una pestaña nueva)": "LinkedIn (opens in a new tab)",
    "Redes sociales": "Social links",
    "Secciones": "Sections",
    "Sobre mí": "About me",
    "Tecnologías utilizadas": "Technologies used",
    "Idioma": "Language",
  };

  const META_EN = {
    description: "Juan Estavillo — Full-Stack Developer (Java & Angular) | Data & Software Architecture. Scalable software, from Java back ends to reactive Angular 22 interfaces.",
  };

  const textNodes = [...document.querySelectorAll("[data-i18n]")];
  const ariaNodes = [...document.querySelectorAll("[aria-label]")];
  const description = document.querySelector('meta[name="description"]');
  const cvLink = document.querySelector("[data-cv]");
  const buttons = [...document.querySelectorAll("[data-lang]")];

  const spanish = new Map(textNodes.map((node) => [node, node.innerHTML]));
  const spanishAria = new Map(ariaNodes.map((node) => [node, node.getAttribute("aria-label")]));
  const spanishDescription = description ? description.content : "";

  const store = {
    get() {
      try { return localStorage.getItem("lang"); } catch { return null; }
    },
    set(value) {
      try { localStorage.setItem("lang", value); } catch { /* Storage may be blocked. */ }
    },
  };

  function apply(lang) {
    const english = lang === "en";
    document.documentElement.lang = lang;
    textNodes.forEach((node) => {
      node.innerHTML = english ? EN[node.dataset.i18n] ?? spanish.get(node) : spanish.get(node);
    });
    ariaNodes.forEach((node) => {
      const original = spanishAria.get(node);
      node.setAttribute("aria-label", english ? ARIA_EN[original] ?? original : original);
    });
    if (description) description.content = english ? META_EN.description : spanishDescription;
    if (cvLink) cvLink.href = `./assets/cv/Juan-Estavillo-CV-${lang.toUpperCase()}.pdf`;
    buttons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
  }

  function initialLanguage() {
    const requested = new URLSearchParams(location.search).get("lang");
    if (requested === "en" || requested === "es") return requested;
    const saved = store.get();
    if (saved === "en" || saved === "es") return saved;
    return (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en";
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      store.set(button.dataset.lang);
      apply(button.dataset.lang);
    });
  });

  apply(initialLanguage());
})();
