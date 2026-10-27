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
  10 terrain stage: generated contours with a water-flow trace
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

  $$(".figure-slot").forEach((slot) => {
    const key = slot.dataset.figure;
    const fig = C.figures[key];
    if (!fig) return;

    const src = FIG_DIR + fig.file;
    const img = new Image();

    img.onload = () => {
      slot.innerHTML = `
        <figure>
          <button type="button" class="figure-button" aria-label="Enlarge: ${escapeHtml(fig.caption)}">
            <img src="${src}" alt="${escapeHtml(fig.caption)}" loading="lazy" decoding="async"
                 width="${img.naturalWidth}" height="${img.naturalHeight}" />
          </button>
          <figcaption>${escapeHtml(fig.caption)}</figcaption>
        </figure>`;
      $(".figure-button", slot).addEventListener("click", () => openLightbox(src, fig.caption));
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

  function openLightbox(src, caption) {
    $("#lightboxImg").src = src;
    $("#lightboxImg").alt = caption;
    $("#lightboxCaption").textContent = caption;
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


  /* 10 TERRAIN STAGE ------------------------------------------------------ */
  /*
     A procedural height field drawn as contour lines (marching squares).
     Hovering traces the steepest-descent path, the same idea as the
     plug-in's Water Flow Lines component.
  */

  const canvas = $("#terrainCanvas");
  const ctx = canvas.getContext("2d");
  const status = $("#stageStatus");
  const base = document.createElement("canvas");
  const bctx = base.getContext("2d");

  const CELL = 5;               // CSS px per grid cell
  const Z_MIN = 420;            // m, valley floor
  const Z_MAX = 980;            // m, ridge

  let interval = 10;
  let seed = 7;
  let W = 0, H = 0, DPR = 1, cols = 0, rows = 0;
  let field = null;             // Float32Array of elevations in m
  let pointer = null;

  // seeded random + value noise
  function mulberry32(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function makeNoise(rand) {
    const N = 256;
    const perm = new Uint8Array(N * 2);
    const vals = new Float32Array(N);
    for (let i = 0; i < N; i++) { perm[i] = i; vals[i] = rand(); }
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [perm[i], perm[j]] = [perm[j], perm[i]];
    }
    for (let i = 0; i < N; i++) perm[N + i] = perm[i];
    const smooth = (t) => t * t * (3 - 2 * t);
    const v = (x, y) => vals[perm[(perm[x & 255] + y) & 511] & 255];
    return (x, y) => {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = smooth(x - xi), yf = smooth(y - yi);
      const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
      return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
    };
  }

  function buildField() {
    const rand = mulberry32(seed);
    const noise = makeNoise(rand);

    // a few massifs and a meandering valley
    const hills = Array.from({ length: 5 }, () => ({
      x: rand(), y: rand(), r: 0.18 + rand() * 0.25, h: 0.45 + rand() * 0.55
    }));
    const valleyPhase = rand() * Math.PI * 2;
    const valleyY = 0.35 + rand() * 0.3;

    cols = Math.ceil(W / CELL) + 1;
    rows = Math.ceil(H / CELL) + 1;
    field = new Float32Array(cols * rows);

    const aspect = W / H;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const u = i / (cols - 1);
        const v = j / (rows - 1);

        let h = 0;
        for (const k of hills) {
          const dx = (u - k.x) * aspect, dy = v - k.y;
          h += k.h * Math.exp(-(dx * dx + dy * dy) / (k.r * k.r));
        }

        // fractal noise
        let amp = 0.5, freq = 3, n = 0;
        for (let o = 0; o < 5; o++) {
          n += amp * noise(u * freq * aspect + 11.3, v * freq + 4.7);
          amp *= 0.5; freq *= 2.03;
        }
        h += (n - 0.5) * 0.55;

        // carve a river valley
        const centre = valleyY + 0.12 * Math.sin(u * 7 + valleyPhase) + 0.05 * Math.sin(u * 17);
        const d = Math.abs(v - centre);
        h -= 0.55 * Math.exp(-(d * d) / 0.006);

        field[j * cols + i] = h;
      }
    }

    // normalise to metres
    let lo = Infinity, hi = -Infinity;
    for (const z of field) { if (z < lo) lo = z; if (z > hi) hi = z; }
    for (let k = 0; k < field.length; k++) {
      field[k] = Z_MIN + ((field[k] - lo) / (hi - lo)) * (Z_MAX - Z_MIN);
    }
  }

  function zAt(x, y) {
    const gx = Math.min(Math.max(x / CELL, 0), cols - 1.001);
    const gy = Math.min(Math.max(y / CELL, 0), rows - 1.001);
    const i = Math.floor(gx), j = Math.floor(gy);
    const fx = gx - i, fy = gy - j;
    const a = field[j * cols + i], b = field[j * cols + i + 1];
    const c = field[(j + 1) * cols + i], d = field[(j + 1) * cols + i + 1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }

  function drawContours() {
    base.width = W * DPR;
    base.height = H * DPR;
    bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    bctx.clearRect(0, 0, W, H);
    bctx.lineCap = "round";

    const first = Math.ceil(Z_MIN / interval) * interval;
    const majorEvery = interval === 25 ? 100 : interval * 5;

    // collect segments per level into paths
    const minor = new Path2D();
    const major = new Path2D();

    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const a = field[j * cols + i];
        const b = field[j * cols + i + 1];
        const c = field[(j + 1) * cols + i + 1];
        const d = field[(j + 1) * cols + i];
        const lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
        const x0 = i * CELL, y0 = j * CELL;

        let level = Math.ceil(lo / interval) * interval;
        if (level < first) level = first;

        for (; level <= hi; level += interval) {
          const pts = [];
          const edge = (za, zb, xa, ya, xb, yb) => {
            if ((za < level) !== (zb < level)) {
              const t = (level - za) / (zb - za);
              pts.push(xa + (xb - xa) * t, ya + (yb - ya) * t);
            }
          };
          edge(a, b, x0, y0, x0 + CELL, y0);
          edge(b, c, x0 + CELL, y0, x0 + CELL, y0 + CELL);
          edge(c, d, x0 + CELL, y0 + CELL, x0, y0 + CELL);
          edge(d, a, x0, y0 + CELL, x0, y0);

          const p = level % majorEvery === 0 ? major : minor;
          for (let k = 0; k + 3 < pts.length; k += 4) {
            p.moveTo(pts[k], pts[k + 1]);
            p.lineTo(pts[k + 2], pts[k + 3]);
          }
        }
      }
    }

    bctx.strokeStyle = "rgba(238, 238, 238, 0.26)";
    bctx.lineWidth = 0.7;
    bctx.stroke(minor);

    bctx.strokeStyle = "rgba(255, 255, 255, 0.62)";
    bctx.lineWidth = 1.1;
    bctx.stroke(major);
  }

  function traceFlow(x, y) {
    const path = [[x, y]];
    const STEP = 2;
    const EPS = 1.5;
    let px = x, py = y;
    for (let n = 0; n < 1500; n++) {
      const gx = (zAt(px + EPS, py) - zAt(px - EPS, py)) / (2 * EPS);
      const gy = (zAt(px, py + EPS) - zAt(px, py - EPS)) / (2 * EPS);
      const g = Math.hypot(gx, gy);
      if (g < 1e-4) break;
      px -= (gx / g) * STEP;
      py -= (gy / g) * STEP;
      if (px < 0 || py < 0 || px > W || py > H) break;
      path.push([px, py]);
      // stop in a pit: no further descent over the last steps
      if (n > 30) {
        const [qx, qy] = path[path.length - 30];
        if (Math.hypot(px - qx, py - qy) < 6) break;
      }
    }
    return path;
  }

  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(base, 0, 0);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    if (!pointer) return;

    const path = traceFlow(pointer.x, pointer.y);
    if (path.length > 1) {
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (const [x, y] of path) ctx.lineTo(x, y);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.stroke();

      const [ex, ey] = path[path.length - 1];
      ctx.beginPath();
      ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }

    // crosshair
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pointer.x - 9, pointer.y); ctx.lineTo(pointer.x + 9, pointer.y);
    ctx.moveTo(pointer.x, pointer.y - 9); ctx.lineTo(pointer.x, pointer.y + 9);
    ctx.stroke();

    const zStart = zAt(pointer.x, pointer.y);
    const last = path[path.length - 1];
    const zEnd = zAt(last[0], last[1]);
    status.textContent =
      `Point z ${fmtNum(zStart, 1)} m · flow drop ${fmtNum(zStart - zEnd, 1)} m`;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    buildField();
    drawContours();
    render();
  }

  function setPointer(e) {
    const rect = canvas.getBoundingClientRect();
    pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    render();
  }

  canvas.addEventListener("pointermove", setPointer);
  canvas.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") {
      seed = (seed * 9301 + 49297) % 233280;
      buildField();
      drawContours();
    }
    setPointer(e);
  });
  canvas.addEventListener("pointerleave", () => {
    pointer = null;
    status.textContent = "Point z —";
    render();
  });

  $("#regenTerrain").addEventListener("click", () => {
    seed = (seed * 9301 + 49297) % 233280;
    buildField();
    drawContours();
    render();
  });

  $$("#terrain [data-interval]").forEach((b) => b.addEventListener("click", () => {
    interval = Number(b.dataset.interval);
    $$("#terrain [data-interval]").forEach((x) => x.classList.toggle("is-active", x === b));
    drawContours();
    render();
  }));

  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  }).observe(canvas);

  resize();
})();
