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
  const CONTACT_EMAIL = "hello@etrion.in";
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

  document.getElementById("year").textContent = new Date().getFullYear();
});
