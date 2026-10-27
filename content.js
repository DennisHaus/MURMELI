/*
  MURMELI — site content
  ---------------------------------------------------------------------------
  Everything a visitor reads lives here, so the text can be edited without
  touching index.html or app.js. Figures live in ./assets/figures/ and are
  listed in FIGURES below; a missing file shows a labelled placeholder.
*/

window.MURMELI = {
  pageTitle: "Murmeli – Grasshopper plug-in for hybrid terrain modelling",

  links: {
    food4rhino: "https://www.food4rhino.com/en/app/murmeli",
    paperReader:
      "https://dennishaus.github.io/overview/hub.html?kind=writing&read=hybrid-terrain-modeling",
    doi: "https://doi.org/10.14627/537770039",
    video: "https://youtu.be/fldxn9C9Zao",
    overview: "https://dennishaus.github.io/overview/",
    github: "https://github.com/DennisHaus/MURMELI",
    zip: "https://github.com/DennisHaus/MURMELI/archive/refs/heads/main.zip",
    componentsFolder: "https://github.com/DennisHaus/MURMELI/tree/main/ComponentLibraries",
    userObjectsFolder: "https://github.com/DennisHaus/MURMELI/tree/main/UserObjects",
    swisstopo: "https://www.swisstopo.admin.ch/en",
    swisstopoTerms:
      "https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices",
    chair: "https://voser.arch.ethz.ch",
    contact: "mailto:haeusler@arch.ethz.ch"
  },

  release: {
    stable: "v0.8",
    stableDate: "14 April 2026",
    beta: "v0.9 beta",
    betaDate: "19 May 2026",
    rhino: "Rhino 7 · Rhino 8",
    license: "MIT",
    cost: "Free"
  },

  /*
    Component library. "rh8" marks components that need Rhino 8.
    "files" are paths inside this repository; the site links them
    straight to GitHub so each one downloads on its own.
    Descriptions follow 250818_Documentation.pdf where it covers them.
  */
  components: [
    // 1 IMPORT
    { cat: "import", name: "SwissBuildings3D", format: ".dxf",
      text: "Imports a .dxf vector file as a collection of meshes. In Rhino 8 it also applies and outputs the shift from the Swiss coordinate system LV95 to 0/0/0.",
      files: [
        { label: "Rhino 7", path: "ComponentLibraries/250818_MURMELI_1_ImportDXF_2cfa4d36bb424fd9a113d056ac97e9f6.ghpy" },
        { label: "Rhino 8", path: "UserObjects/Vector Import DXF Rhino8_2.ghuser" }
      ] },
    { cat: "import", name: "SwissAlti3D", format: ".xyz",
      text: "Imports one or more .xyz point or raster files, with optional random thinning. Header lines can be skipped to avoid read errors.",
      files: [{ path: "ComponentLibraries/251013_MURMELI_ImportXYZ_8af99e71119f46a7a60db4cf8b58a847.ghpy" }] },
    { cat: "import", name: "SwissSurface3D 2018–2024", format: ".las",
      text: "Imports one or more .las point clouds. Points can be thinned randomly (default 0.1 % to protect your computer) and filtered by classification (default: all classes).",
      files: [{ path: "UserObjects/Point Import LAS color.ghuser" }] },
    { cat: "import", name: "SwissSurface3D 2025–", format: ".laz", rh8: true,
      text: "Imports the new compressed LiDAR tiles. Needs the lasrz, laszip and laspy Python packages.",
      files: [{ path: "UserObjects/Point Import LAZ color.ghuser" }] },

    // 2 TOOLS
    { cat: "tools", name: "Advanced Mesh Clipper",
      text: "Clips a mesh with a second mesh and outputs a closed mesh. Like the Mesh Intersection node, but it also works with invalid or open meshes.",
      files: [{ path: "UserObjects/Advanced Mesh Clipper.ghuser" }] },
    { cat: "tools", name: "Advanced Mesh Flipper",
      text: "Flips the normals of a mesh that faces up, so the result always faces down, whatever the input orientation. Used to turn a terrain into a formwork.",
      files: [{ path: "ComponentLibraries/251021_FaceDown_445161d53fe040ae846318ba050eabf5.ghpy" }] },
    { cat: "tools", name: "Point Combiner",
      text: "Combines up to four point sets into one.",
      files: [{ path: "ComponentLibraries/250812_MURMELI_2_CombinePts_ff8cd17e6ce04cfa98b3babbee20cc61.ghpy" }] },
    { cat: "tools", name: "Point Thinner",
      text: "Reduces a point set at random, either by a percentage or to a maximum number of points.",
      files: [{ path: "ComponentLibraries/250812_MURMELI_2_PointThinner__85487ce9c82d44f0875bda88a0736393.ghpy" }] },
    { cat: "tools", name: "Point z-Value Max",
      text: "Finds the highest z-value among the points inside a curve. Points on the curve count too.",
      files: [{ path: "UserObjects/Point z-Value Max_1.ghuser" }] },
    { cat: "tools", name: "Point z-Value Min",
      text: "Finds the lowest z-value among the points inside a curve. Points on the curve count too.",
      files: [{ path: "UserObjects/Point z-Value Min._1.ghuser" }] },
    { cat: "tools", name: "Shift to Zero",
      text: "Finds the centre of a point set and outputs the vector from it to 0/0/0. Combined with a Move node, the points are centred on the origin.",
      files: [{ path: "UserObjects/Shift to Zero.ghuser" }] },
    { cat: "tools", name: "Shift Z to Zero (individual)",
      text: "Moves each object down so its lowest point sits at z = 0.",
      files: [{ path: "UserObjects/Shift Z to Zero.ghuser" }] },
    { cat: "tools", name: "Switch Mesh > df",
      text: "Converts a mesh into Docofossor's distance field, to keep modelling the terrain there.",
      files: [{ path: "UserObjects/Switch Mesh→DF_1.ghuser" }] },
    { cat: "tools", name: "Switch Mesh > Brep",
      text: "Converts a mesh into a Brep for solid modelling.",
      files: [{ path: "UserObjects/Switch Mesh to Brep.ghuser" }] },

    // 3 ANALYSIS
    { cat: "analysis", name: "Contour Lines Simple",
      text: "Draws contour lines on a mesh at a height step you set.",
      files: [{ path: "ComponentLibraries/251010_MURMELI_SimpleContours_6bff68c1a6134825839667512d6ed3ac.ghpy" }] },
    { cat: "analysis", name: "Contour Lines Refined",
      text: "Draws contour lines with optional clean-up: Smooth rounds the corners, Simplify reduces the number of segments.",
      files: [{ path: "ComponentLibraries/251010_MURMELI__RefinedContours_24805b051ffd4a12a7b03b4688d06083.ghpy" }] },
    { cat: "analysis", name: "Section",
      text: "Cuts a single terrain section.",
      files: [{ path: "UserObjects/Section_1.ghuser" }] },
    { cat: "analysis", name: "Section Series",
      text: "Cuts a series of terrain sections.",
      files: [{ path: "UserObjects/Section Series.ghuser" }] },
    { cat: "analysis", name: "Slope Analysis", rh8: true,
      text: "Colours the terrain by steepness.",
      files: [{ path: "UserObjects/Slope Analysis_1.ghuser" }] },
    { cat: "analysis", name: "Water Flow Lines", rh8: true,
      text: "Traces where surface water runs off the terrain, and where it accumulates.",
      files: [
        { label: "Flow lines", path: "UserObjects/Flow Lines.ghuser" },
        { label: "Accumulation", path: "UserObjects/Water Accumulation_1.ghuser" }
      ] },
    { cat: "analysis", name: "Watershed", rh8: true,
      text: "Outlines watershed basins on a triangulated terrain (TIN).",
      files: [{ path: "UserObjects/Watershed Basins (TIN).ghuser" }] },
    { cat: "analysis", name: "Volume Cut & Fill", rh8: true,
      text: "Compares two terrains and measures cut and fill volumes.",
      files: [{ path: "UserObjects/Volume Cut and Fill_1.ghuser" }] },

    // 4 EXPORT
    { cat: "export", name: "3D Print Files", format: ".stl",
      text: "Exports an .stl file for 3D printing when Export is set to True. Choose folder and file name. Rhino 7 and 8 each have their own component.",
      files: [
        { label: "Rhino 7", path: "UserObjects/Export STL Rhino 7.ghuser" },
        { label: "Rhino 8", path: "UserObjects/Export STL Rhino 8_1.ghuser" }
      ] }
  ],

  /* Repository downloads shown in the Download section. */
  repo: {
    owner: "DennisHaus",
    name: "MURMELI",
    branch: "main",
    installer: "Installer_Murmeli_v0.8.ghuser",
    documentation: "250818_Documentation.pdf"
  },

  /* Swiss geodata the importers read. */
  datasets: [
    { name: "swissSURFACE3D", kind: "Classified LiDAR point cloud", format: ".las / .laz",
      note: "At least 5 points/m², on average 15–20 points/m². Positional accuracy ±20 cm, vertical ±10 cm. Nationwide since 2025." },
    { name: "swissALTI3D", kind: "Digital terrain model", format: ".xyz",
      note: "Bare-ground elevation grid, light enough for large areas and concept models." },
    { name: "swissBUILDINGS3D", kind: "3D building model", format: ".dxf",
      note: "Vector buildings for urban sites and context models." }
  ],

  /*
    Figures from the paper (CC BY-ND 4.0). Put the image files in
    ./assets/figures/ with exactly these names. JPG or PNG both work
    if you change the extension here.
  */
  figures: {
    "fig-1":   { file: "fig-1-method-diagram.jpg",
                 caption: "Fig. 1: Method diagram, the digital-physical-digital workflow." },
    "fig-2":   { file: "fig-2-toolbar.jpg",
                 caption: "Fig. 2: The Murmeli toolbar in Grasshopper." },
    "fig-3-1": { file: "fig-3-1-inner-city-1-500.jpg",
                 caption: "Fig. 3, left: Inner city model 1:500, by N. Lorethan." },
    "fig-3-2": { file: "fig-3-2-concept-models-1-25000.jpg",
                 caption: "Fig. 3, middle: Concept models 1:25'000, collective student works." },
    "fig-3-3": { file: "fig-3-3-flow-channels-1-200.jpg",
                 caption: "Fig. 3, right: Flow channels 1:200, by T.-W. Chen & Y. Hou." },
    "fig-4-1": { file: "fig-4-1-mixed-models.jpg",
                 caption: "Fig. 4, left: Rescanned physical model juxtaposed with the LiDAR model, 1:25'000, Design Studio 2025." },
    "fig-4-2": { file: "fig-4-2-slope-analysis.jpg",
                 caption: "Fig. 4, middle: Slope steepness analysis on a rescanned model, 1:1'000, by A. Lang & L. Lepori." },
    "fig-4-3": { file: "fig-4-3-deviation-analysis.jpg",
                 caption: "Fig. 4, right: Deviation after a full cycle, standard deviation ±0.1654 mm at 1:3'000." },
    "fig-5-1": { file: "fig-5-1-students-working.jpg",
                 caption: "Fig. 5, left: Students working by hand, spring semester 2025." },
    "fig-5-2": { file: "fig-5-2-modelling-tools.jpg",
                 caption: "Fig. 5, middle: Tools for manual modelling." },
    "fig-5-3": { file: "fig-5-3-tiled-formwork.jpg",
                 caption: "Fig. 5, right: Several tiles combined into one formwork, pressing a sand model." }
  },

  figureCredit:
    "Figures from Häusler et al. (2026), CC BY-ND 4.0. Image credits: the authors and Silvia Converso.",

  citation: {
    text:
      "Häusler, D., Vollmer, M., Voser, M., Fricker, P. (2026). Hybrid Terrain Modeling: A Multidimensional Landscape Design Method. Journal of Digital Landscape Architecture 11, 403–410. https://doi.org/10.14627/537770039",
    bibtex:
`@article{haeusler2026hybrid,
  author    = {H{\\"a}usler, Dennis and Vollmer, Matthias and Voser, Martina and Fricker, Pia},
  title     = {Hybrid Terrain Modeling: A Multidimensional Landscape Design Method},
  journal   = {Journal of Digital Landscape Architecture},
  volume    = {11},
  pages     = {403--410},
  year      = {2026},
  publisher = {Wichmann Verlag},
  doi       = {10.14627/537770039}
}`
  }
};
