(function () {
  const site = window.STAFF_SITE;

  if (!site) {
    return;
  }

  const body = document.body;
  const page = body.dataset.page || "home";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const galleryItems = site.galleryItems || [];
  const courseOptions = [...site.musicCourses, ...site.danceCourses].map((course) => course.name);
  let currentLightboxIndex = 0;
  let lightboxLastFocused = null;

  function resolvePath(source, path) {
    return path.split(".").reduce((value, key) => (value && key in value ? value[key] : undefined), source);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return replacements[char];
    });
  }

  function isPlaceholder(value) {
    if (typeof value !== "string") {
      return false;
    }

    return value.trim() === "" || value.trim() === "#" || /REPLACE|YOUR-|owner update required|placeholder/i.test(value);
  }

  function icon(name, className = "icon") {
    return `<svg class="${className}" aria-hidden="true" focusable="false"><use href="assets/images/icons.svg#${name}"></use></svg>`;
  }

  const derivedValues = {
    "site.title": site.site.title,
    "site.tagline": site.site.tagline,
    "site.location": site.site.location,
    "forms.demoFormUrl": site.forms.demoFormUrl,
    "contact.phoneButtonLabel": `Call ${site.contact.phoneDisplay}`,
    "contact.whatsappButtonLabel": `WhatsApp ${site.contact.whatsappDisplay}`,
    "contact.phoneHref": `tel:${site.contact.phoneRaw}`,
    "contact.emailHref": `mailto:${site.contact.email}`,
    "contact.whatsappHref": `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(site.contact.whatsappMessage)}`,
    "contact.addressHtml": site.contact.addressLines.map((line) => escapeHtml(line)).join("<br>"),
    "contact.hoursHtml": site.contact.businessHours.map((line) => `<li>${escapeHtml(line)}</li>`).join(""),
    "site.currentYear": String(new Date().getFullYear())
  };

  const navItems = [
    { slug: "home", label: "Home", href: "index.html" },
    { slug: "about", label: "About", href: "about.html" },
    { slug: "music-courses", label: "Music Courses", href: "music-courses.html" },
    { slug: "dance-courses", label: "Dance Courses", href: "dance-courses.html" },
    { slug: "gallery", label: "Gallery", href: "gallery.html" },
    { slug: "events", label: "Events", href: "events.html" },
    { slug: "testimonials", label: "Testimonials", href: "testimonials.html" },
    { slug: "faq", label: "FAQ", href: "faq.html" },
    { slug: "contact", label: "Contact", href: "contact.html" }
  ];

  function valueFor(path) {
    return derivedValues[path] ?? resolvePath(site, path);
  }

  function actionLinkMarkup(options) {
    const {
      href,
      label,
      iconName,
      classes = "button button-secondary",
      external = false,
      note = ""
    } = options;

    if (!href || isPlaceholder(href)) {
      return `<span class="${classes} is-disabled">${icon(iconName)}<span>${escapeHtml(label)}</span></span>${note ? `<span class="micro-note">${escapeHtml(note)}</span>` : ""}`;
    }

    const rel = external ? ' target="_blank" rel="noreferrer"' : "";

    return `<a class="${classes}" href="${escapeHtml(href)}"${rel}>${icon(iconName)}<span>${escapeHtml(label)}</span></a>${note ? `<span class="micro-note">${escapeHtml(note)}</span>` : ""}`;
  }

  function chipMarkup(options) {
    const { href, label, iconName } = options;

    if (!href || isPlaceholder(href)) {
      return `<span class="link-chip is-disabled">${icon(iconName)}<span>${escapeHtml(label)}</span></span>`;
    }

    return `<a class="link-chip" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${icon(iconName)}<span>${escapeHtml(label)}</span></a>`;
  }

  function footerLinkMarkup(label, href, iconName) {
    if (!href || isPlaceholder(href)) {
      return `<span class="footer-link is-disabled">${icon(iconName)}<span>${escapeHtml(label)} - owner update required</span></span>`;
    }

    return `<a class="footer-link" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${icon(iconName)}<span>${escapeHtml(label)}</span></a>`;
  }

  function whatsappMessageFor(subject) {
    const message = `Hello, I am interested in ${subject} at STAFF School of Music & Dance.`;
    return `https://wa.me/${site.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  function renderHeader() {
    const slot = document.querySelector("[data-site-header]");

    if (!slot) {
      return;
    }

    const navLinks = navItems.map((item) => {
      const active = item.slug === page;
      return `<li><a class="nav-link${active ? " is-active" : ""}" href="${item.href}"${active ? ' aria-current="page"' : ""}>${item.label}</a></li>`;
    }).join("");
    const demoFormHref = valueFor("forms.demoFormUrl") || "demo-class.html";
    const demoFormTarget = !isPlaceholder(demoFormHref) ? ' target="_blank" rel="noreferrer"' : "";

    slot.innerHTML = `
      <header class="site-header">
        <div class="header-shell">
          <div class="container navbar">
            <a class="brand" href="index.html" aria-label="STAFF School of Music & Dance home">
              <img class="brand-mark" src="assets/images/logo.svg" alt="" width="56" height="56" />
              <span class="brand-copy">
                <span class="brand-title brand-title-full">${escapeHtml(site.site.title)}</span>
                <span class="brand-title brand-title-short">${escapeHtml(site.site.shortTitle || site.site.title)}</span>
                <span class="brand-subtitle">${escapeHtml(site.site.tagline)}</span>
              </span>
            </a>
            <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="site-nav" aria-label="Open navigation">
              ${icon("menu", "icon icon-menu")}
              ${icon("close", "icon icon-close")}
            </button>
            <div class="nav-panel" id="site-nav" data-nav-panel>
              <ul class="nav-links">
                ${navLinks}
              </ul>
              <a class="button button-primary" href="${escapeHtml(demoFormHref)}"${demoFormTarget}>${icon("calendar")}<span>Book Free Demo</span></a>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    const slot = document.querySelector("[data-site-footer]");

    if (!slot) {
      return;
    }

    slot.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <section>
              <h2>${escapeHtml(site.site.title)}</h2>
              <p>${escapeHtml(site.site.tagline)}</p>
              <p>Founded in ${site.site.foundedYear} in Hyderabad to provide structured, professional, and encouraging performing arts education.</p>
            </section>
            <section>
              <h3>Academy</h3>
              <div class="footer-links">
                <a class="footer-link" href="about.html">${icon("teacher")}<span>About Us</span></a>
                <a class="footer-link" href="about.html#founder-profile">${icon("award")}<span>Founder</span></a>
                <a class="footer-link" href="index.html#why-choose-us">${icon("star")}<span>Why Choose Us</span></a>
              </div>
            </section>
            <section>
              <h3>Courses</h3>
              <div class="footer-links">
                <a class="footer-link" href="music-courses.html">${icon("music-note")}<span>Music Courses</span></a>
                <a class="footer-link" href="dance-courses.html">${icon("dance")}<span>Dance Courses</span></a>
                <a class="footer-link" href="demo-class.html">${icon("calendar")}<span>Demo Class</span></a>
              </div>
            </section>
            <section>
              <h3>Quick Links</h3>
              <div class="footer-links">
                <a class="footer-link" href="gallery.html">${icon("image")}<span>Gallery</span></a>
                <a class="footer-link" href="events.html">${icon("calendar")}<span>Events</span></a>
                <a class="footer-link" href="testimonials.html">${icon("quote")}<span>Testimonials</span></a>
                <a class="footer-link" href="faq.html">${icon("help")}<span>FAQ</span></a>
                <a class="footer-link" href="contact.html">${icon("phone")}<span>Contact</span></a>
              </div>
            </section>
          </div>
          <div class="section-sm">
            <div class="footer-grid">
              <section>
                <h3>Contact</h3>
                <div class="footer-links">
                  <a class="footer-link" href="${escapeHtml(valueFor("contact.phoneHref"))}">${icon("phone")}<span>${escapeHtml(site.contact.phoneDisplay)}</span></a>
                  <a class="footer-link" href="${escapeHtml(valueFor("contact.whatsappHref"))}" target="_blank" rel="noreferrer">${icon("whatsapp")}<span>${escapeHtml(site.contact.whatsappDisplay)}</span></a>
                  <a class="footer-link" href="${escapeHtml(valueFor("contact.emailHref"))}">${icon("email")}<span>${escapeHtml(site.contact.email)}</span></a>
                  <span class="footer-link">${icon("map-pin")}<span>${escapeHtml(site.contact.addressLines[0])}</span></span>
                </div>
              </section>
              <section>
                <h3>Social Media</h3>
                <div class="footer-links">
                  ${footerLinkMarkup("Instagram", site.social.instagramUrl, "instagram")}
                  ${footerLinkMarkup("Facebook", site.social.facebookUrl, "facebook")}
                  ${footerLinkMarkup("YouTube", site.social.youtubeUrl, "youtube")}
                </div>
              </section>
              <section>
                <h3>Policies</h3>
                <div class="footer-links">
                  <a class="footer-link" href="privacy.html">${icon("shield")}<span>Privacy Policy</span></a>
                  <a class="footer-link" href="terms.html">${icon("book-open")}<span>Terms and Conditions</span></a>
                </div>
              </section>
              <section>
                <h3>Hours</h3>
                <ul class="details-list">
                  ${site.contact.businessHours.map((line) => `<li><span class="list-bullet">${icon("clock")}</span><span>${escapeHtml(line)}</span></li>`).join("")}
                </ul>
              </section>
            </div>
          </div>
          <div class="footer-meta">
            <span>&copy; <span data-bind-text="site.currentYear"></span> ${escapeHtml(site.site.title)}</span>
            <span>Designed for STAFF School of Music &amp; Dance</span>
          </div>
        </div>
      </footer>
    `;
  }

  function renderFloatingActions() {
    const slot = document.querySelector("[data-floating-actions]");

    if (!slot) {
      return;
    }

    slot.innerHTML = `
      <div class="floating-actions" aria-label="Quick contact actions">
        <a class="button button-primary" href="${escapeHtml(valueFor("contact.whatsappHref"))}" target="_blank" rel="noreferrer" aria-label="WhatsApp ${escapeHtml(site.contact.whatsappDisplay)}">
          ${icon("whatsapp")}
          <span>WhatsApp</span>
        </a>
        <a class="button button-secondary" href="${escapeHtml(valueFor("contact.phoneHref"))}" aria-label="Call ${escapeHtml(site.contact.phoneDisplay)}">
          ${icon("phone")}
          <span>Call</span>
        </a>
      </div>
    `;
  }

  function bindConfigValues() {
    document.querySelectorAll("[data-bind-text]").forEach((element) => {
      const value = valueFor(element.dataset.bindText);

      if (value !== undefined) {
        element.textContent = value;
      }
    });

    document.querySelectorAll("[data-bind-html]").forEach((element) => {
      const value = valueFor(element.dataset.bindHtml);

      if (value !== undefined) {
        element.innerHTML = value;
      }
    });

    document.querySelectorAll("[data-bind-href]").forEach((element) => {
      const value = valueFor(element.dataset.bindHref);

      if (value) {
        element.setAttribute("href", value);
      }
    });
  }

  function renderHomeHighlights() {
    const slot = document.querySelector('[data-render="home-highlights"]');

    if (!slot) {
      return;
    }

    slot.className = "highlight-grid";
    slot.innerHTML = site.homeHighlights.map((item) => `
      <article class="panel highlight-card reveal" data-reveal>
        <span class="card-icon">${icon(item.icon)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.copy)}</p>
      </article>
    `).join("");
  }

  function renderWhyChooseUs() {
    const slot = document.querySelector('[data-render="why-choose-us"]');

    if (!slot) {
      return;
    }

    slot.className = "benefit-grid";
    slot.innerHTML = site.whyChooseUs.map((item) => `
      <article class="panel benefit-card reveal" data-reveal>
        <span class="card-icon">${icon(item.icon)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.copy)}</p>
      </article>
    `).join("");
  }

  function renderInstructors() {
    document.querySelectorAll('[data-render="instructors"]').forEach((slot) => {
      const limit = Number(slot.dataset.limit || site.instructors.length);
      slot.className = "instructor-grid";
      slot.innerHTML = site.instructors.slice(0, limit).map((instructor) => `
        <article class="panel instructor-card reveal" data-reveal>
          <span class="card-icon">${icon(instructor.icon)}</span>
          <h3>${escapeHtml(instructor.name)}</h3>
          <p class="pill pill-muted">${escapeHtml(instructor.role)}</p>
          <p>${escapeHtml(instructor.detail)}</p>
        </article>
      `).join("");
    });
  }

  function courseCardMarkup(course, type) {
    const demoHref = valueFor("forms.demoFormUrl") || `demo-class.html?course=${encodeURIComponent(course.name)}`;
    const demoTarget = !isPlaceholder(demoHref) ? ' target="_blank" rel="noreferrer"' : "";
    const whatsappHref = whatsappMessageFor(`${course.name} classes`);
    const extraMeta = type === "dance"
      ? `<span><strong>Styles</strong>${escapeHtml(course.styles)}</span>`
      : "";

    return `
      <article class="panel course-card reveal" data-reveal data-filter-set-item="${type}-courses" data-category="${escapeHtml(course.family)}">
        <span class="card-icon">${icon(course.icon)}</span>
        <h3>${escapeHtml(course.name)}</h3>
        <p>${escapeHtml(course.overview)}</p>
        <div class="course-meta">
          <span><strong>Instructor</strong>${escapeHtml(course.instructor)}</span>
          <span><strong>Recommended age</strong>${escapeHtml(course.age)}</span>
          <span><strong>Levels</strong>${escapeHtml(course.levels)}</span>
          <span><strong>Class structure</strong>${escapeHtml(course.structure)}</span>
          <span><strong>Monthly fee</strong>${escapeHtml(course.fee)}</span>
          ${extraMeta}
        </div>
        <h4>Primary learning outcomes</h4>
        <ul class="course-outcomes">
          ${course.outcomes.map((outcome) => `<li>${escapeHtml(outcome)}</li>`).join("")}
        </ul>
        <div class="button-row">
          <a class="button button-primary" href="${escapeHtml(demoHref)}"${demoTarget}>${icon("calendar")}<span>Book Demo</span></a>
          <a class="button button-secondary" href="${escapeHtml(whatsappHref)}" target="_blank" rel="noreferrer">${icon("whatsapp")}<span>WhatsApp Enquiry</span></a>
        </div>
      </article>
    `;
  }

  function renderCourseFilters(type, filters) {
    const slot = document.querySelector(`[data-render="${type}-course-filters"]`);

    if (!slot) {
      return;
    }

    slot.className = "filter-bar";
    slot.dataset.filterSet = `${type}-courses`;
    slot.innerHTML = filters.map((filter, index) => `
      <button class="button filter-chip${index === 0 ? " is-active" : ""}" type="button" data-filter="${escapeHtml(filter.key)}" aria-pressed="${index === 0 ? "true" : "false"}">
        ${escapeHtml(filter.label)}
      </button>
    `).join("");
  }

  function renderCourseGrids() {
    const musicFilters = [
      { key: "all", label: "All Music Courses" },
      { key: "keys", label: "Keys" },
      { key: "strings", label: "Strings" },
      { key: "rhythm", label: "Rhythm" },
      { key: "winds", label: "Winds" },
      { key: "vocal", label: "Vocal" },
      { key: "theory", label: "Theory" }
    ];

    const danceFilters = [
      { key: "all", label: "All Dance Courses" },
      { key: "classical", label: "Classical" },
      { key: "western", label: "Western" },
      { key: "bollywood", label: "Bollywood" },
      { key: "kids", label: "Kids" }
    ];

    renderCourseFilters("music", musicFilters);
    renderCourseFilters("dance", danceFilters);

    const musicSlot = document.querySelector('[data-render="music-course-grid"]');

    if (musicSlot) {
      musicSlot.className = "course-grid";
      musicSlot.innerHTML = site.musicCourses.map((course) => courseCardMarkup(course, "music")).join("");
    }

    const danceSlot = document.querySelector('[data-render="dance-course-grid"]');

    if (danceSlot) {
      danceSlot.className = "course-grid";
      danceSlot.innerHTML = site.danceCourses.map((course) => courseCardMarkup(course, "dance")).join("");
    }
  }

  function renderFeaturedCourses() {
    document.querySelectorAll('[data-render="featured-courses"]').forEach((slot) => {
      const type = slot.dataset.courseType === "dance" ? "dance" : "music";
      const source = type === "dance" ? site.danceCourses : site.musicCourses;
      const limit = Number(slot.dataset.limit || 4);

      slot.className = "feature-grid";
      slot.innerHTML = source.slice(0, limit).map((course) => `
        <article class="panel feature-card reveal" data-reveal>
          <span class="card-icon">${icon(course.icon)}</span>
          <h3>${escapeHtml(course.name)}</h3>
          <p>${escapeHtml(course.overview)}</p>
          <div class="tag-row">
            <span class="tag">${icon("clock")}${escapeHtml(site.sharedCourseInfo.classes)}</span>
            <span class="tag">${icon("star")}${escapeHtml(course.fee)}</span>
          </div>
        </article>
      `).join("");
    });
  }

  function eventCardMarkup(event, preview) {
    const buttonClass = preview ? "button button-secondary" : "button button-primary";

    return `
      <article class="panel event-card reveal" data-reveal>
        <div class="event-media">
          <img src="${event.image}" alt="${escapeHtml(event.name)} placeholder artwork" width="800" height="480" loading="lazy" />
        </div>
        <span class="pill pill-gold">${escapeHtml(event.status)}</span>
        <h3>${escapeHtml(event.name)}</h3>
        <div class="event-meta">
          <span class="pill pill-muted">${icon("calendar")}${escapeHtml(event.timing)}</span>
          <span class="pill pill-muted">${icon("clock")}${escapeHtml(event.dateLabel)}</span>
        </div>
        <p>${escapeHtml(event.description)}</p>
        <div class="event-actions">
          <a class="${buttonClass}" href="contact.html?topic=${encodeURIComponent(event.name)}">${icon("calendar")}<span>${escapeHtml(event.registrationLabel)}</span></a>
          <span class="button button-secondary is-disabled">${icon("calendar")}<span>${escapeHtml(event.calendarLabel)}</span></span>
        </div>
      </article>
    `;
  }

  function renderEvents() {
    document.querySelectorAll('[data-render="events-grid"]').forEach((slot) => {
      const preview = slot.dataset.preview === "true";
      const limit = Number(slot.dataset.limit || site.events.length);
      slot.className = "event-grid";
      slot.innerHTML = site.events.slice(0, limit).map((event) => eventCardMarkup(event, preview)).join("");
    });
  }

  function renderGalleryFilters() {
    const slot = document.querySelector('[data-render="gallery-filters"]');

    if (!slot) {
      return;
    }

    slot.className = "filter-bar";
    slot.dataset.filterSet = "gallery";
    slot.innerHTML = site.galleryCategories.map((category, index) => `
      <button class="button filter-chip${index === 0 ? " is-active" : ""}" type="button" data-filter="${escapeHtml(category.key)}" aria-pressed="${index === 0 ? "true" : "false"}">
        ${escapeHtml(category.label)}
      </button>
    `).join("");
  }

  function renderGalleryGrid() {
    const slot = document.querySelector('[data-render="gallery-grid"]');

    if (!slot) {
      return;
    }

    slot.className = "gallery-grid";
    slot.innerHTML = galleryItems.map((item, index) => `
      <button class="panel gallery-card reveal" type="button" data-reveal data-filter-set-item="gallery" data-category="${escapeHtml(item.category)}" data-gallery-index="${index}">
        <span class="gallery-media">
          <img src="${item.image}" alt="${escapeHtml(item.alt)}" width="800" height="600" loading="lazy" />
        </span>
        <span class="gallery-copy">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.copy)}</p>
        </span>
      </button>
    `).join("");
  }

  function renderTestimonials() {
    document.querySelectorAll('[data-render="testimonials"]').forEach((slot) => {
      const group = slot.dataset.group;
      const limit = Number(slot.dataset.limit || (site.testimonials[group] || []).length);
      const entries = (site.testimonials[group] || []).slice(0, limit);

      slot.className = "testimonial-grid";
      slot.innerHTML = entries.map((entry) => `
        <article class="panel testimonial-card reveal" data-reveal>
          <span class="testimonial-label">${group === "parent" ? "Parent placeholder" : group === "student" ? "Student placeholder" : "Adult learner placeholder"}</span>
          <div class="quote-mark">“</div>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.copy)}</p>
        </article>
      `).join("");
    });

    const videoSlot = document.querySelector('[data-render="testimonial-videos"]');

    if (videoSlot) {
      videoSlot.className = "grid grid-3";
      videoSlot.innerHTML = site.testimonials.videos.map((item) => `
        <article class="panel value-card reveal" data-reveal>
          <span class="card-icon">${icon("play")}</span>
          <h3>Video testimonial placeholder</h3>
          <p>${escapeHtml(item)}</p>
        </article>
      `).join("");
    }
  }

  function renderFaqs() {
    const slot = document.querySelector('[data-render="faq-list"]');

    if (!slot) {
      return;
    }

    slot.className = "accordion";
    slot.innerHTML = site.faqs.map((faq, index) => `
      <article class="panel faq-item reveal" data-reveal>
        <button class="faq-trigger" type="button" id="faq-trigger-${index}" data-faq-trigger aria-expanded="${index === 0 ? "true" : "false"}" aria-controls="faq-panel-${index}">
          <span>${escapeHtml(faq.question)}</span>
          ${icon("chevron-down")}
        </button>
        <div class="faq-panel" id="faq-panel-${index}" data-faq-panel${index === 0 ? "" : " hidden"} role="region" aria-labelledby="faq-trigger-${index}">
          <p>${escapeHtml(faq.answer)}</p>
        </div>
      </article>
    `).join("");
  }

  function renderTeachingPhilosophy() {
    const slot = document.querySelector('[data-render="teaching-philosophy"]');

    if (!slot) {
      return;
    }

    slot.className = "grid grid-3";
    slot.innerHTML = site.teachingPhilosophy.map((item) => `
      <article class="panel value-card reveal" data-reveal>
        <span class="pill pill-gold">Step ${escapeHtml(item.step)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.copy)}</p>
      </article>
    `).join("");
  }

  function renderSocialChips() {
    document.querySelectorAll('[data-render="social-chips"]').forEach((slot) => {
      slot.className = "link-chip-row";
      slot.innerHTML = [
        chipMarkup({ href: site.social.instagramUrl, label: "Instagram", iconName: "instagram" }),
        chipMarkup({ href: site.social.facebookUrl, label: "Facebook", iconName: "facebook" }),
        chipMarkup({ href: site.social.youtubeUrl, label: "YouTube", iconName: "youtube" })
      ].join("");
    });
  }

  function renderContactActions() {
    document.querySelectorAll('[data-render="contact-actions"]').forEach((slot) => {
      slot.className = "button-row";
      slot.innerHTML = [
        actionLinkMarkup({
          href: valueFor("contact.phoneHref"),
          label: valueFor("contact.phoneButtonLabel"),
          iconName: "phone",
          classes: "button button-secondary"
        }),
        actionLinkMarkup({
          href: valueFor("contact.whatsappHref"),
          label: valueFor("contact.whatsappButtonLabel"),
          iconName: "whatsapp",
          classes: "button button-primary",
          external: true
        }),
        actionLinkMarkup({
          href: valueFor("contact.emailHref"),
          label: "Email Us",
          iconName: "email",
          classes: "button button-secondary"
        }),
        actionLinkMarkup({
          href: site.contact.googleMapsUrl,
          label: "Get Directions",
          iconName: "map-pin",
          classes: "button button-secondary",
          external: true
        })
      ].join("");
    });
  }

  function renderReviewActions() {
    document.querySelectorAll('[data-render="google-review-action"]').forEach((slot) => {
      slot.className = "button-row";
      slot.innerHTML = actionLinkMarkup({
        href: site.social.googleReviewsUrl,
        label: "Read Our Google Reviews",
        iconName: "quote",
        classes: "button button-primary",
        external: true,
        note: "Add the live Google Business review URL in assets/js/config.js."
      });
    });
  }

  function renderPageCollections() {
    renderHomeHighlights();
    renderWhyChooseUs();
    renderInstructors();
    renderCourseGrids();
    renderFeaturedCourses();
    renderEvents();
    renderGalleryFilters();
    renderGalleryGrid();
    renderTestimonials();
    renderFaqs();
    renderTeachingPhilosophy();
    renderSocialChips();
    renderContactActions();
    renderReviewActions();
  }

  function initHeader() {
    const header = document.querySelector(".site-header");

    if (!header) {
      return;
    }

    const toggle = header.querySelector("[data-menu-toggle]");
    const panel = header.querySelector("[data-nav-panel]");
    const links = panel ? panel.querySelectorAll("a") : [];

    function syncPanelAccessibility(open) {
      if (!panel) {
        return;
      }

      const mobile = window.innerWidth <= 980;
      panel.setAttribute("aria-hidden", String(mobile && !open));
      panel.querySelectorAll("a, button").forEach((element) => {
        if (mobile && !open) {
          element.setAttribute("tabindex", "-1");
        } else {
          element.removeAttribute("tabindex");
        }
      });
    }

    function setMenuState(open) {
      header.classList.toggle("is-menu-open", open);
      body.classList.toggle("nav-open", open);
      if (toggle) {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      }
      syncPanelAccessibility(open);
    }

    toggle?.addEventListener("click", () => {
      setMenuState(!header.classList.contains("is-menu-open"));
    });

    links.forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) {
        setMenuState(false);
      } else {
        syncPanelAccessibility(header.classList.contains("is-menu-open"));
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
      }
    });

    syncPanelAccessibility(false);
  }

  function initReveals() {
    const items = document.querySelectorAll("[data-reveal]");

    items.forEach((item) => item.classList.add("reveal"));

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12
    });

    items.forEach((item) => observer.observe(item));
  }

  function initFilters() {
    document.querySelectorAll("[data-filter-set]").forEach((group) => {
      const setName = group.dataset.filterSet;
      const buttons = group.querySelectorAll("[data-filter]");
      const items = document.querySelectorAll(`[data-filter-set-item="${setName}"]`);

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const filter = button.dataset.filter;

          buttons.forEach((entry) => {
            const active = entry === button;
            entry.classList.toggle("is-active", active);
            entry.setAttribute("aria-pressed", String(active));
          });

          items.forEach((item) => {
            const matches = filter === "all" || item.dataset.category === filter;
            item.classList.toggle("is-hidden", !matches);
          });
        });
      });
    });
  }

  function initFaqAccordion() {
    const triggers = Array.from(document.querySelectorAll("[data-faq-trigger]"));

    if (!triggers.length) {
      return;
    }

    function toggleFaq(activeTrigger) {
      triggers.forEach((trigger) => {
        const panelId = trigger.getAttribute("aria-controls");
        const panel = panelId ? document.getElementById(panelId) : null;
        const isActive = trigger === activeTrigger;
        trigger.setAttribute("aria-expanded", String(isActive));

        if (panel) {
          panel.hidden = !isActive;
        }
      });
    }

    triggers.forEach((trigger, index) => {
      trigger.addEventListener("click", () => toggleFaq(trigger));
      trigger.addEventListener("keydown", (event) => {
        let targetIndex = index;

        if (event.key === "ArrowDown") {
          targetIndex = (index + 1) % triggers.length;
        } else if (event.key === "ArrowUp") {
          targetIndex = (index - 1 + triggers.length) % triggers.length;
        } else if (event.key === "Home") {
          targetIndex = 0;
        } else if (event.key === "End") {
          targetIndex = triggers.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        triggers[targetIndex].focus();
      });
    });
  }

  function initGalleryLightbox() {
    const lightbox = document.querySelector("[data-lightbox]");

    if (!lightbox) {
      return;
    }

    const image = lightbox.querySelector("[data-lightbox-image]");
    const title = lightbox.querySelector("[data-lightbox-title]");
    const copy = lightbox.querySelector("[data-lightbox-copy]");
    const closeButton = lightbox.querySelector("[data-lightbox-close]");
    const prevButton = lightbox.querySelector("[data-lightbox-prev]");
    const nextButton = lightbox.querySelector("[data-lightbox-next]");
    const cards = document.querySelectorAll("[data-gallery-index]");

    function renderLightbox(index) {
      const item = galleryItems[index];

      if (!item || !image || !title || !copy) {
        return;
      }

      currentLightboxIndex = index;
      image.src = item.image;
      image.alt = item.alt;
      title.textContent = item.title;
      copy.textContent = item.copy;
    }

    function openLightbox(index) {
      lightboxLastFocused = document.activeElement;
      renderLightbox(index);
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      body.classList.add("lightbox-open");
      closeButton?.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      body.classList.remove("lightbox-open");
      lightboxLastFocused?.focus?.();
    }

    function stepGallery(delta) {
      const nextIndex = (currentLightboxIndex + delta + galleryItems.length) % galleryItems.length;
      renderLightbox(nextIndex);
    }

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        openLightbox(Number(card.dataset.galleryIndex || 0));
      });
    });

    closeButton?.addEventListener("click", closeLightbox);
    prevButton?.addEventListener("click", () => stepGallery(-1));
    nextButton?.addEventListener("click", () => stepGallery(1));
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) {
        return;
      }

      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        stepGallery(-1);
      } else if (event.key === "ArrowRight") {
        stepGallery(1);
      }
    });
  }

  function buildCourseSelects() {
    document.querySelectorAll("[data-course-select]").forEach((select) => {
      const currentValue = select.dataset.selected || "";
      const options = [
        '<option value="">Choose a course</option>',
        ...courseOptions.map((name) => `<option value="${escapeHtml(name)}"${currentValue === name ? " selected" : ""}>${escapeHtml(name)}</option>`)
      ];

      select.innerHTML = options.join("");
    });
  }

  function syncQueryCourseSelection() {
    const params = new URLSearchParams(window.location.search);
    const course = params.get("course");
    const topic = params.get("topic");
    const headline = document.querySelector("[data-selected-course]");

    if (course && headline) {
      headline.textContent = course;
    }

    if (course) {
      document.querySelectorAll("[data-course-select]").forEach((select) => {
        if (courseOptions.includes(course)) {
          select.value = course;
        }
      });
    }

    const topicField = document.querySelector('[name="message"]');
    if (topic && topicField && !topicField.value) {
      topicField.value = `I would like more information about ${topic}.`;
    }
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");

    if (!form) {
      return;
    }

    const notice = document.querySelector("[data-form-note]");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const course = formData.get("course") || "General enquiry";
      const subject = `Enquiry for ${course} - STAFF School of Music & Dance`;
      const bodyLines = [
        `Name: ${formData.get("name") || ""}`,
        `Phone: ${formData.get("phone") || ""}`,
        `Email: ${formData.get("email") || ""}`,
        `Course interest: ${course}`,
        "",
        "Message:",
        `${formData.get("message") || ""}`
      ];

      const mailto = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
      window.location.href = mailto;

      if (notice) {
        notice.textContent = "Your email app should open with the enquiry details. If not, please use WhatsApp or the email address shown on this page.";
      }
    });
  }

  function initMapEmbed() {
    const slot = document.querySelector("[data-map-embed]");

    if (!slot) {
      return;
    }

    if (!isPlaceholder(site.contact.googleMapsEmbedUrl)) {
      slot.innerHTML = `
        <div class="embed-shell panel">
          <iframe src="${escapeHtml(site.contact.googleMapsEmbedUrl)}" loading="lazy" title="STAFF School of Music & Dance map"></iframe>
        </div>
      `;
      return;
    }

    slot.innerHTML = `
      <div class="embed-shell panel">
        <div class="placeholder-box">
          <h3>Google Maps embed placeholder</h3>
          <p>Add the published Google Maps embed URL in <code>assets/js/config.js</code> to display the academy location here.</p>
          <a class="button button-secondary" href="${escapeHtml(site.contact.googleMapsUrl)}" target="_blank" rel="noreferrer">${icon("map-pin")}<span>Open map search</span></a>
        </div>
      </div>
    `;
  }

  function initDemoEmbed() {
    const slot = document.querySelector("[data-demo-form-embed]");

    if (!slot) {
      return;
    }

    if (!isPlaceholder(site.forms.demoFormEmbedUrl)) {
      slot.innerHTML = `
        <div class="embed-shell panel">
          <iframe src="${escapeHtml(site.forms.demoFormEmbedUrl)}" loading="lazy" title="Demo class form"></iframe>
        </div>
      `;
      return;
    }

    const button = actionLinkMarkup({
      href: site.forms.demoFormUrl,
      label: "Open Demo Form",
      iconName: "calendar",
      classes: "button button-primary",
      external: true,
      note: "Add the live Google Form URL in assets/js/config.js."
    });

    slot.innerHTML = `
      <div class="embed-shell panel">
        <div class="placeholder-box">
          <h3>Google Form embed placeholder</h3>
          <p>Add the published Google Form link and embed URL in <code>assets/js/config.js</code> to replace this placeholder.</p>
          <div class="button-row">${button}</div>
        </div>
      </div>
    `;
  }

  function appendJsonLd(payload) {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(payload);
    document.head.appendChild(script);
  }

  function injectSchemas() {
    const sameAs = [
      site.social.instagramUrl,
      site.social.facebookUrl,
      site.social.youtubeUrl
    ].filter((url) => !isPlaceholder(url));

    appendJsonLd({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["MusicSchool", "EducationalOrganization", "LocalBusiness"],
          name: site.site.title,
          description: "Music and dance academy in Hyderabad offering structured courses for children, teenagers, and adults.",
          foundingDate: String(site.site.foundedYear),
          founder: {
            "@type": "Person",
            name: site.site.founder
          },
          telephone: site.contact.phoneDisplay,
          email: site.contact.email,
          address: {
            "@type": "PostalAddress",
            streetAddress: site.contact.addressLines[0],
            addressLocality: "Hyderabad",
            addressRegion: "Telangana",
            postalCode: "500000",
            addressCountry: "IN"
          },
          url: site.site.siteUrl,
          sameAs
        },
        {
          "@type": "WebSite",
          name: site.site.title,
          url: site.site.siteUrl
        }
      ]
    });

    if (page === "faq") {
      appendJsonLd({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: site.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }))
      });
    }

    if (page === "events") {
      appendJsonLd({
        "@context": "https://schema.org",
        "@graph": site.events.map((event) => ({
          "@type": "Event",
          name: event.name,
          description: event.description,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          image: `${site.site.siteUrl}${event.image}`,
          location: {
            "@type": "Place",
            name: site.site.title,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Hyderabad",
              addressRegion: "Telangana",
              addressCountry: "IN"
            }
          },
          organizer: {
            "@type": "EducationalOrganization",
            name: site.site.title,
            url: site.site.siteUrl
          },
          url: `${site.site.siteUrl}events.html`
        }))
      });
    }
  }

  renderHeader();
  renderFooter();
  renderFloatingActions();
  bindConfigValues();
  renderPageCollections();
  buildCourseSelects();
  syncQueryCourseSelection();
  initHeader();
  initReveals();
  initFilters();
  initFaqAccordion();
  initGalleryLightbox();
  initContactForm();
  initMapEmbed();
  initDemoEmbed();
  injectSchemas();
})();
