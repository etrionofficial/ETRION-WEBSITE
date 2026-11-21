// ETRION website interactions
document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById("header");
  const toTop = document.getElementById("toTop");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("menuToggle");

  // Sticky header + back-to-top
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    toggle.classList.toggle("open");
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.classList.remove("open");
    })
  );

  // Reveal on scroll
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    io.observe(el);
  });

  // Active nav link
  const sections = document.querySelectorAll("section[id]");
  const links = nav.querySelectorAll("a:not(.btn)");
  const navIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === `#${e.target.id}`));
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navIO.observe(s));

  // Contact form — opens the visitor's email app with the details filled in.
  // To receive submissions directly, connect a form service (e.g. Formspree) — see README.
  const CONTACT_EMAIL = "etrionofficial@gmail.com";
  const form = document.getElementById("contactForm");
  const note = document.getElementById("formNote");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    form.querySelectorAll("[required]").forEach((f) => {
      const bad = !f.value.trim() || (f.type === "email" && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) {
      note.textContent = "Please fill in your name, a valid email and project details.";
      note.className = "form-note err";
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const subject = `New project enquiry: ${d.service} — ${d.name}`;
    const body = `Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone || "-"}\nService: ${d.service}\nBudget: ${d.budget}\n\nProject details:\n${d.message}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Thanks! Your email app should open now with your message ready to send.";
    note.className = "form-note ok";
    form.reset();
  });

  // Team roster display (managed from backend data/team.json)
  const teamGrid = document.getElementById("teamGrid");
  const teamEmpty = document.getElementById("teamEmpty");
  const teamToolbar = document.getElementById("teamToolbar");
  const teamFilters = document.getElementById("teamFilters");

  let teamMembers = [];
  let activeDept = "All";

  const getInitials = (name) => {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "ET";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isSafeImageSrc = (src) => {
    if (!src || typeof src !== "string") return false;
    const trimmed = src.trim();
    if (trimmed.startsWith("/") || trimmed.startsWith("assets/") || trimmed.startsWith("data:image/")) {
      return true;
    }
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isSafeHttpUrl = (url) => {
    if (!url) return false;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const createLinkedInIcon = () => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("aria-hidden", "true");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute(
      "d",
      "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
    );
    svg.appendChild(path);
    return svg;
  };

  const renderTeam = () => {
    teamGrid.innerHTML = "";
    teamFilters.innerHTML = "";

    if (!teamMembers.length) {
      teamToolbar.hidden = true;
      teamEmpty.hidden = false;
      return;
    }

    teamEmpty.hidden = true;
    const depts = ["All", ...new Set(teamMembers.map((m) => m.department || "Engineering"))];
    if (!depts.includes(activeDept)) activeDept = "All";

    if (depts.length > 2) {
      teamToolbar.hidden = false;
      depts.forEach((dept) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `filter-btn${dept === activeDept ? " active" : ""}`;
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", dept === activeDept ? "true" : "false");
        btn.textContent = dept;
        btn.addEventListener("click", () => {
          activeDept = dept;
          renderTeam();
        });
        teamFilters.appendChild(btn);
      });
    } else {
      teamToolbar.hidden = true;
    }

    const filtered =
      activeDept === "All"
        ? teamMembers
        : teamMembers.filter((m) => (m.department || "Engineering") === activeDept);

    filtered.forEach((member) => {
      const hasLinkedin = isSafeHttpUrl(member.linkedin);
      const card = document.createElement(hasLinkedin ? "a" : "article");
      card.className = hasLinkedin ? "team-card team-card-link" : "team-card";

      if (hasLinkedin) {
        card.href = member.linkedin;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.setAttribute("aria-label", `Contact ${member.name || "team member"} on LinkedIn`);
      }

      const photoBox = document.createElement("div");
      photoBox.className = "team-photo";
      const initialsSpan = document.createElement("span");
      initialsSpan.textContent = getInitials(member.name);

      if (isSafeImageSrc(member.photo)) {
        const img = document.createElement("img");
        img.src = member.photo;
        img.alt = member.name || "Team member";
        img.referrerPolicy = "no-referrer";
        img.addEventListener("error", () => {
          img.remove();
          photoBox.appendChild(initialsSpan);
        });
        photoBox.appendChild(img);
      } else {
        photoBox.appendChild(initialsSpan);
      }

      const infoBox = document.createElement("div");
      infoBox.className = "team-info-box";

      const identity = document.createElement("div");
      identity.className = "team-identity";

      const nameEl = document.createElement("h3");
      nameEl.className = "team-name";
      nameEl.textContent = member.name || "";

      const roleEl = document.createElement("p");
      roleEl.className = "team-role";
      roleEl.textContent = member.role || "";

      identity.append(nameEl, roleEl);

      const linkedinBadge = document.createElement("span");
      linkedinBadge.className = hasLinkedin
        ? "team-linkedin-btn"
        : "team-linkedin-btn inactive";
      linkedinBadge.setAttribute("aria-hidden", "true");
      linkedinBadge.appendChild(createLinkedInIcon());

      infoBox.append(identity, linkedinBadge);
      card.append(photoBox, infoBox);
      teamGrid.appendChild(card);
    });
  };

  const loadTeam = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          teamMembers = data;
          renderTeam();
          return;
        }
      }
    } catch {
      // Leave empty state if backend is unreachable
    }
    teamMembers = [];
    renderTeam();
  };

  loadTeam();

  document.getElementById("year").textContent = new Date().getFullYear();
});
