# MURMELI

**Rhino Grasshopper plug-in for working with Swiss geodata in landscape architecture and architecture.**
From swisstopo LiDAR to 3D-printed formworks, sand models and back to digital analysis.

**Website:** https://dennishaus.github.io/MURMELI/
**Food4Rhino:** https://www.food4rhino.com/en/app/murmeli
**Paper:** [Hybrid Terrain Modeling (JoDLA 2026)](https://dennishaus.github.io/overview/hub.html?kind=writing&read=hybrid-terrain-modeling) · doi:[10.14627/537770039](https://doi.org/10.14627/537770039)
**Video:** https://youtu.be/fldxn9C9Zao

Latest release: v0.8 (14 April 2026), v0.9 beta (19 May 2026). Rhino 7 and Rhino 8. MIT license, free.

---

## Download

| What | File |
|---|---|
| **Installer** (all components in one file) | [`Installer_Murmeli_v0.8.ghuser`](https://github.com/DennisHaus/MURMELI/raw/main/Installer_Murmeli_v0.8.ghuser) |
| Everything as ZIP | [main.zip](https://github.com/DennisHaus/MURMELI/archive/refs/heads/main.zip) |
| Documentation (PDF) | [`250818_Documentation.pdf`](250818_Documentation.pdf) |
| Python components (.ghpy) | [`ComponentLibraries/`](ComponentLibraries) |
| User objects (.ghuser) | [`UserObjects/`](UserObjects) |

## Install

**With the installer**
1. Download `Installer_Murmeli_v0.8.ghuser`.
2. Drag and drop it into Grasshopper.
3. Set “Installation” and “Overwrite” to True.
4. Restart Rhino.

**By hand**
1. In Grasshopper, open *File › Special Folders › Components Folder* and copy the `.ghpy` files from `ComponentLibraries/` there.
2. Open *File › Special Folders › User Object Folder* and copy the `.ghuser` files from `UserObjects/` there.
3. Restart Rhino.

Rhino 8 uses the IronPython plug-in. Reading `.laz` files needs Rhino 8 and the `lasrz`, `laszip` and `laspy` packages.

## Components

| Tab | Component | File | Notes |
|---|---|---|---|
| 1 Import | SwissBuildings3D (.dxf) | `ComponentLibraries/…ImportDXF….ghpy` · `UserObjects/Vector Import DXF Rhino8_2.ghuser` | Rhino 7 / Rhino 8 |
| 1 Import | SwissAlti3D (.xyz) | `ComponentLibraries/…ImportXYZ….ghpy` | |
| 1 Import | SwissSurface3D 2018–2024 (.las) | `UserObjects/Point Import LAS color.ghuser` | |
| 1 Import | SwissSurface3D 2025– (.laz) | `UserObjects/Point Import LAZ color.ghuser` | Rhino 8 |
| 2 Tools | Advanced Mesh Clipper | `UserObjects/Advanced Mesh Clipper.ghuser` | |
| 2 Tools | Advanced Mesh Flipper | `ComponentLibraries/…FaceDown….ghpy` | |
| 2 Tools | Point Combiner | `ComponentLibraries/…CombinePts….ghpy` | |
| 2 Tools | Point Thinner | `ComponentLibraries/…PointThinner….ghpy` | |
| 2 Tools | Point z-Value Max / Min | `UserObjects/Point z-Value Max_1.ghuser` · `Point z-Value Min._1.ghuser` | |
| 2 Tools | Shift to Zero / Shift Z to Zero | `UserObjects/Shift to Zero.ghuser` · `Shift Z to Zero.ghuser` | |
| 2 Tools | Switch Mesh > df / > Brep | `UserObjects/Switch Mesh→DF_1.ghuser` · `Switch Mesh to Brep.ghuser` | |
| 3 Analysis | Contour Lines Simple / Refined | `ComponentLibraries/…SimpleContours….ghpy` · `…RefinedContours….ghpy` | |
| 3 Analysis | Section / Section Series | `UserObjects/Section_1.ghuser` · `Section Series.ghuser` | |
| 3 Analysis | Slope Analysis | `UserObjects/Slope Analysis_1.ghuser` | Rhino 8 |
| 3 Analysis | Water Flow Lines | `UserObjects/Flow Lines.ghuser` · `Water Accumulation_1.ghuser` | Rhino 8 |
| 3 Analysis | Watershed | `UserObjects/Watershed Basins (TIN).ghuser` | Rhino 8 |
| 3 Analysis | Volume Cut & Fill | `UserObjects/Volume Cut and Fill_1.ghuser` | Rhino 8 |
| 4 Export | 3D Print Files (.stl) | `UserObjects/Export STL Rhino 7.ghuser` · `Export STL Rhino 8_1.ghuser` | |

Descriptions of every component, with single-file downloads, are on the [website](https://dennishaus.github.io/MURMELI/#plugin).

## Repository layout

```
index.html                   Website (GitHub Pages)
style.css                    Website styles
app.js                       Website script
content.js                   All website text, components and file links
assets/figures/              Figures from the paper
ComponentLibraries/          Python components (.ghpy)
UserObjects/                 Grasshopper user objects (.ghuser)
Installer_Murmeli_v0.8.ghuser
250818_Documentation.pdf
LICENSE
```

To publish the website: **Settings › Pages › Deploy from a branch › `main` / `/ (root)`**.

When files are added or renamed, update the `files` entries in `content.js`
so the website's download links keep pointing to them.

## Cite

Häusler, D., Vollmer, M., Voser, M., Fricker, P. (2026). Hybrid Terrain Modeling: A Multidimensional Landscape Design Method. *Journal of Digital Landscape Architecture* 11, 403–410. https://doi.org/10.14627/537770039

## Credits

Developed by Dennis Häusler, Nathan Lorethan and Matthias Vollmer at the Chair of Landscape Architecture of Martina Voser and the LVML, Institute for Landscape and Urban Studies, ETH Zürich. AI support was used for Python scripting.

Before using public open government data, check the [swisstopo terms of use](https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices).

## License

Plug-in and website code: [MIT](LICENSE). Figures in `assets/figures/`: Häusler et al. (2026), CC BY-ND 4.0, credits per figure in [`assets/figures/README.md`](assets/figures/README.md).
