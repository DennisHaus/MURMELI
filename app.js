/*
  MURMELI — app
  ---------------------------------------------------------------------------
  1  bindings from content.js
  2  figures (with placeholders for missing files)
  3  method cycle
  4  component library
  5  geodata table, release facts
  6  precision calculator
  7  citation
  8  dialogs (Read Me, lightbox)
  9  contents panel + scroll position
  10 landing: method diagram fitted around the intro box
*/

(() => {
  "use strict";

  const C = window.MURMELI;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const get = (obj, path) => path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtNum = (n, digits = 0) =>
    n.toLocaleString("de-CH", { minimumFractionDigits: digits, maximumFractionDigits: digits });


  /* 1  BINDINGS ------------------------------------------------------------ */

  document.title = C.pageTitle;

  $$("[data-href]").forEach((el) => {
    const url = C.links[el.dataset.href];
    if (url) el.setAttribute("href", url);
  });

  // Files in the GitHub repository download straight from github.com
  const R = C.repo;
  const repoRaw = (path) =>
    `https://github.com/${R.owner}/${R.name}/raw/${R.branch}/` +
    path.split("/").map(encodeURIComponent).join("/");
  const repoView = (path) =>
    `https://github.com/${R.owner}/${R.name}/blob/${R.branch}/` +
    path.split("/").map(encodeURIComponent).join("/");

  $$("[data-repo-file]").forEach((el) => {
    const path = R[el.dataset.repoFile];
    if (path) el.setAttribute("href", repoRaw(path));
  });

  const installerName = document.getElementById("installerName");
  if (installerName) installerName.textContent = R.installer;

  $$("[data-bind]").forEach((el) => {
    const v = get(C, el.dataset.bind);
    if (v != null) el.textContent = v;
  });


  /* 2  FIGURES ------------------------------------------------------------- */

  const FIG_DIR = "./assets/figures/";

  const SOURCE_SHORT = "Häusler et al. 2026, JoDLA 11";

  $$(".figure-slot").forEach((slot) => {
    const key = slot.dataset.figure;
    const fig = C.figures[key];
    if (!fig) return;

    const src = FIG_DIR + fig.file;
    const alt = `${fig.caption} ${fig.credit || ""}`.trim();
    const img = new Image();

    img.onload = () => {
      const cls = ["figure-button", fig.dark ? "is-dark" : "", fig.natural ? "is-natural" : ""].join(" ");
      const style = fig.natural ? ` style="max-width:${img.naturalWidth}px"` : "";
      slot.innerHTML = `
        <figure>
          <button type="button" class="${cls}"${style} aria-label="Enlarge: ${escapeHtml(fig.caption)}">
            <img src="${src}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"
                 width="${img.naturalWidth}" height="${img.naturalHeight}" />
          </button>
          <figcaption>
            ${escapeHtml(fig.caption)}
            ${fig.credit ? `<span class="fig-credit">${escapeHtml(fig.credit)}</span>` : ""}
            <span class="fig-source">Source: <a href="${C.links.doi}" target="_blank" rel="noopener">${SOURCE_SHORT}</a>, CC BY-ND 4.0</span>
          </figcaption>
        </figure>`;
      $(".figure-button", slot).addEventListener("click", () => openLightbox(src, fig));
    };

    img.onerror = () => {
      slot.innerHTML = `
        <div class="figure-missing" role="img" aria-label="${escapeHtml(fig.caption)}">
          <strong>${escapeHtml(fig.caption)}</strong>
          <span>Add <code>assets/figures/${escapeHtml(fig.file)}</code> to show this figure.</span>
        </div>`;
    };

    img.src = src;
  });

  $("#figureCredit").textContent = C.figureCredit;


  /* 3  METHOD CYCLE -------------------------------------------------------- */

  const STEPS = [
    {
      realm: "digital", title: "Geodata",
      text: "Download swisstopo tiles for the site: classified LiDAR points, the terrain model or 3D buildings. The design rests on measured, georeferenced data from the start.",
      aside: [["Data", "swissSURFACE3D, swissALTI3D, swissBUILDINGS3D"], ["Precision", "±10 cm vertical"]]
    },
    {
      realm: "digital", title: "Import",
      text: "Murmeli reads the raw files directly into Grasshopper. Sampling and class filters keep large areas fast, and the data is moved from Swiss coordinates to a local origin.",
      aside: [["Components", "Import tab, Point Thinner, Shift to Zero"], ["Runs in", "Rhino 7 and 8"]]
    },
    {
      realm: "digital", title: "Formwork",
      text: "The terrain is clipped, flipped into a negative and exported as STL. A PLA print of this formwork becomes a reusable mould for the site.",
      aside: [["Components", "Advanced Mesh Clipper, Advanced Mesh Flipper, 3D Print Files"], ["Print time", "10 h or more for 25 × 25 cm"]]
    },
    {
      realm: "physical", title: "Cast",
      text: "Kinetic sand, clay or plaster is pressed into the formwork. The cast keeps the 0.2 mm print resolution, and a new one takes minutes, so variants are cheap.",
      aside: [["Time per variant", "5–10 min"], ["Materials", "Kinetic sand, clay, plaster"]]
    },
    {
      realm: "physical", title: "Shape",
      text: "Designers work the model by hand: carving channels, building up embankments, sketching erosion. Even unscaled, conceptual moves are possible at large scales.",
      aside: [["Tools", "Hands and simple modelling tools"], ["Good for", "Concepts, flow, form-finding"]]
    },
    {
      realm: "physical", title: "Rescan",
      text: "The shaped model is digitised again. Hand-held laser scanners and photogrammetry gave the best results; depth cameras were too imprecise.",
      aside: [["Tested", "GOM scanner, Artec Leo, photogrammetry, depth cameras"], ["Full-cycle error", "±0.1654 mm at 1:3'000"]]
    },
    {
      realm: "digital", title: "Analyse",
      text: "The rescan is laid over the original terrain and analysed like the geodata: slope, water flow, watersheds, cut and fill. The results feed the next print or the next cast, closing the loop.",
      aside: [["Components", "Slope Analysis, Water Flow Lines, Watershed, Volume Cut & Fill"], ["Needs", "Rhino 8"]]
    }
  ];

  const cycleButtons = $$(".cycle-step");
  const cycleDetail = $("#cycleDetail");

  cycleButtons.forEach((btn, i) => { btn.dataset.realm = STEPS[i].realm; });

  const legend = document.createElement("div");
  legend.className = "cycle-legend";
  legend.innerHTML = `<span class="lg-digital">Digital</span><span class="lg-physical">Physical</span>`;
  cycleDetail.after(legend);

  function showStep(i) {
    const s = STEPS[i];
    cycleButtons.forEach((b, j) => {
      b.classList.toggle("is-active", j === i);
      b.setAttribute("aria-pressed", j === i ? "true" : "false");
    });
    cycleDetail.innerHTML = `
      <div>
        <h3>${i + 1}. ${escapeHtml(s.title)} <span style="color:var(--muted);font-weight:500">(${s.realm})</span></h3>
        <p>${escapeHtml(s.text)}</p>
      </div>
      <dl class="cycle-aside">
        ${s.aside.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join("")}
      </dl>`;
  }

  cycleButtons.forEach((b, i) => b.addEventListener("click", () => showStep(i)));

  $("#cycle").addEventListener("keydown", (e) => {
    const cur = cycleButtons.findIndex((b) => b.classList.contains("is-active"));
    let next = null;
    if (e.key === "ArrowRight") next = (cur + 1) % STEPS.length;
    if (e.key === "ArrowLeft") next = (cur - 1 + STEPS.length) % STEPS.length;
    if (next !== null) { e.preventDefault(); showStep(next); cycleButtons[next].focus(); }
  });

  showStep(0);


  /* 4  COMPONENT LIBRARY --------------------------------------------------- */

  const CAT_NUM = { import: 1, tools: 2, analysis: 3, export: 4 };
  const list = $("#componentList");
  const empty = $("#componentEmpty");
  const search = $("#componentSearch");
  let activeCat = "all";

  $("#componentCount").textContent = `${C.components.length} components in 4 tabs`;

  function renderComponents() {
    const q = search.value.trim().toLowerCase();
    const items = C.components.filter((c) =>
      (activeCat === "all" || c.cat === activeCat) &&
      (!q || (c.name + " " + c.text + " " + (c.format || "")).toLowerCase().includes(q))
    );

    const fileLinks = (c) => (c.files || []).map((f) => {
      const ext = f.path.split(".").pop();
      const fileName = f.path.split("/").pop();
      const label = f.label ? `${f.label} .${ext}` : `.${ext}`;
      return `<a class="file-chip" href="${repoRaw(f.path)}" download
                 title="Download ${escapeHtml(fileName)}"
                 aria-label="Download ${escapeHtml(c.name)}${f.label ? ", " + escapeHtml(f.label) : ""} (${escapeHtml(fileName)})">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v12"/><path d="m18 11-6 6-6-6"/><path d="M5 21h14"/></svg>
                ${escapeHtml(label)}</a>`;
    }).join("");

    list.innerHTML = items.map((c) => `
      <li class="component">
        <span class="component-cat">${CAT_NUM[c.cat]}</span>
        <span class="component-name">${escapeHtml(c.name)}${c.format ? `<em>${escapeHtml(c.format)}</em>` : ""}
          ${c.rh8 ? `<span class="badge" title="Needs Rhino 8">Rhino 8</span>` : ""}</span>
        <span class="component-text">${escapeHtml(c.text)}</span>
        <span class="component-files">${fileLinks(c)}</span>
      </li>`).join("");

    empty.classList.toggle("hidden", items.length > 0);
  }

  $$("#plugin [data-cat]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCat = btn.dataset.cat;
      $$("#plugin [data-cat]").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      renderComponents();
    });
  });

  search.addEventListener("input", renderComponents);
  renderComponents();


  /* 5  GEODATA TABLE, RELEASE FACTS --------------------------------------- */

  $("#datasetTable tbody").innerHTML = C.datasets.map((d) => `
    <tr>
      <td>${escapeHtml(d.name)}</td>
      <td>${escapeHtml(d.kind)}</td>
      <td>${escapeHtml(d.format)}</td>
      <td>${escapeHtml(d.note)}</td>
    </tr>`).join("");

  const r = C.release;
  $("#releaseFacts").innerHTML = [
    ["Stable", `${r.stable}, ${r.stableDate}`],
    ["Beta", `${r.beta}, ${r.betaDate}`],
    ["Rhino", r.rhino],
    ["License", r.license],
    ["Cost", r.cost]
  ].map(([k, v]) => `<div><span>${k}</span><strong>${escapeHtml(v)}</strong></div>`).join("");


  /* 6  PRECISION CALCULATOR ----------------------------------------------- */

  const LAYER_MM = 0.2;          // PLA layer height
  const CYCLE_SD_MM = 0.1654;    // full-cycle standard deviation (paper, Fig. 4)
  const TILE_M = 0.25;           // 25 cm printer tile
  const SOURCE_ACC_M = 0.10;     // swissSURFACE3D vertical accuracy

  const scaleInput = $("#scaleInput");
  const presetButtons = $$("[data-scale]");

  function fmtLength(m) {
    if (m < 1) return `${fmtNum(m * 100, m * 100 < 10 ? 1 : 0)} cm`;
    if (m < 1000) return `${fmtNum(m, m < 10 ? 2 : m < 100 ? 1 : 0)} m`;
    return `${fmtNum(m / 1000, 2)} km`;
  }

  function updateCalc() {
    const scale = Math.max(1, Number(scaleInput.value) || 0);
    const detail = (LAYER_MM / 1000) * scale;
    const error = (CYCLE_SD_MM / 1000) * scale;
    const tile = TILE_M * scale;

    $("#outDetail").textContent = fmtLength(detail);
    $("#outError").textContent = "±" + fmtLength(error);
    $("#outTile").textContent = `${fmtLength(tile)} × ${fmtLength(tile)}`;

    const v = $("#outVerdict");
    v.classList.add("is-text");
    const ratio = error / SOURCE_ACC_M;
    v.textContent =
      ratio <= 1 ? "Within the source accuracy" :
      ratio <= 2.5 ? "Close to the source accuracy" :
      `${fmtNum(ratio, 0)}× coarser than the source, suited to concept models`;

    presetButtons.forEach((b) => b.classList.toggle("is-active", Number(b.dataset.scale) === scale));
  }

  presetButtons.forEach((b) => b.addEventListener("click", () => {
    scaleInput.value = b.dataset.scale;
    updateCalc();
  }));

  scaleInput.addEventListener("input", updateCalc);
  updateCalc();


  /* 7  CITATION ----------------------------------------------------------- */

  const citeOut = $("#citeOutput");
  let citeFormat = "text";

  function renderCite() {
    citeOut.textContent = citeFormat === "bibtex" ? C.citation.bibtex : C.citation.text;
    citeOut.classList.toggle("is-code", citeFormat === "bibtex");
    $$("[data-format]").forEach((b) => b.classList.toggle("is-active", b.dataset.format === citeFormat));
  }

  $$("[data-format]").forEach((b) => b.addEventListener("click", () => {
    citeFormat = b.dataset.format;
    renderCite();
  }));

  $("#copyCite").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(citeOut.textContent);
      btn.textContent = "Copied";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(citeOut);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      btn.textContent = "Selected, press Ctrl+C";
    }
    setTimeout(() => { btn.textContent = "Copy"; }, 1800);
  });

  renderCite();


  /* 8  DIALOGS ------------------------------------------------------------ */

  const readme = $("#readmeDialog");
  const lightbox = $("#lightbox");

  $("#openReadme").addEventListener("click", () => readme.showModal());

  function openLightbox(src, fig) {
    const lbImg = $("#lightboxImg");
    lbImg.src = src;
    lbImg.alt = fig.caption;
    lbImg.classList.toggle("is-dark", !!fig.dark);
    $("#lightboxCaption").textContent =
      `${fig.caption} ${fig.credit || ""} Source: ${C.figureSource}`;
    lightbox.showModal();
  }

  [readme, lightbox].forEach((d) => {
    $$("[data-close]", d).forEach((b) => b.addEventListener("click", () => d.close()));
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  });


  /* 9  CONTENTS PANEL + SCROLL POSITION ----------------------------------- */

  const scroller = $("#scroller");
  const contentsList = $("#contentsList");
  const toggle = $("#toggleContents");
  const mobile = window.matchMedia("(max-width: 860px)");

  function setContentsOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    contentsList.classList.toggle(mobile.matches ? "is-mobile-collapsed" : "is-collapsed", !open);
    contentsList.classList.toggle(mobile.matches ? "is-collapsed" : "is-mobile-collapsed", false);
  }

  toggle.addEventListener("click", () => setContentsOpen(toggle.getAttribute("aria-expanded") !== "true"));

  // On phones the contents list starts closed so the page opens on the title.
  setContentsOpen(!mobile.matches);
  mobile.addEventListener("change", () => setContentsOpen(!mobile.matches));

  const navLinks = $$("#contentsList a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  function updateCurrent() {
    const probe = window.innerHeight * 0.35;
    let current = sections[0];
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= probe) current = s;
    }
    navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + current.id));
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateCurrent(); ticking = false; });
  };

  scroller.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  navLinks.forEach((a) => a.addEventListener("click", () => {
    if (mobile.matches) setContentsOpen(false);
  }));

  updateCurrent();



  /* 10 LANDING: method diagram above the intro box ---------------------- */
  /*
     The diagram fills the width of the stage; the intro box runs along the
     bottom. The diagram is scaled so its labels stay clear of the box. If
     the screen is short, the stage grows taller than the window instead of
     shrinking the drawing until it can't be read.
  */

  const stage = $("#intro");
  const diagram = $(".stage-diagram");
  const introBox = $(".stage-intro");
  const narrow = window.matchMedia("(max-width: 860px)");

  // drawn area of the image, as fractions (measured from the PNG)
  const D = { x0: 0.088, x1: 0.958, y0: 0.113, y1: 0.898 };
  const RATIO = 1280 / 2274;
  const PAD = 16, TOP = 56, GAP = 18, MAX_W = 1700;

  function layoutDiagram() {
    if (narrow.matches) {
      diagram.removeAttribute("style");
      stage.style.removeProperty("min-height");
      return;
    }
    stage.style.removeProperty("min-height");
    const W = stage.clientWidth;
    const viewH = scroller.clientHeight || window.innerHeight;
    const bh = introBox.getBoundingClientRect().height;

    const drawnW = D.x1 - D.x0;
    const drawnH = (D.y1 - D.y0) * RATIO;

    const fullW = Math.min((W - 2 * PAD) / drawnW, MAX_W);
    const fitH = (viewH - TOP - PAD - GAP - bh) / drawnH;
    // shrink to fit one screen, but never below 80 % of the full width
    const iw = Math.max(Math.min(fullW, fitH), fullW * 0.8);
    const ih = iw * RATIO;

    const contentH = drawnH * iw;
    const stageH = Math.max(viewH, TOP + contentH + GAP + bh + PAD);
    stage.style.minHeight = `${Math.ceil(stageH)}px`;

    const areaTop = TOP;
    const areaBottom = stageH - PAD - bh - GAP;
    const top = areaTop + (areaBottom - areaTop - contentH) / 2 - D.y0 * ih;
    const left = (W - drawnW * iw) / 2 - D.x0 * iw;

    diagram.style.width = `${iw}px`;
    diagram.style.left = `${left}px`;
    diagram.style.top = `${top}px`;
  }

  let layoutTimer;
  const scheduleLayout = () => {
    clearTimeout(layoutTimer);
    layoutTimer = setTimeout(layoutDiagram, 60);
  };

  window.addEventListener("resize", scheduleLayout);
  new ResizeObserver(scheduleLayout).observe(introBox);
  narrow.addEventListener("change", layoutDiagram);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutDiagram);
  diagram.complete ? layoutDiagram() : diagram.addEventListener("load", layoutDiagram);
})();
