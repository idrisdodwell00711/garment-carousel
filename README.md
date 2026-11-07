# Garment Carousel — Product Viewer Update

A React + TypeScript + Vite product-viewing prototype based on the supplied screen recording and garment photographs.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## What's included

- Transparent WebP garment cut-outs in `public/images/cutouts/`.
- A `View colours` control for every garment.
- Photographed colour options are identified as **Photographed**.
- Additional hue-shifted colour studies are identified as **Digital preview**. They are illustrative previews, not confirmed manufacturer colourways or stock.
- The Stüssy fleece has front and back source photographs. Drag across the main image or use the angle controls to switch between those supplied angles. The product data also accepts an ordered `spinFrames` array when a real 360° image sequence is available.
- Touch, mouse, keyboard and reduced-motion-friendly transitions.
- A lightweight image-sequence-ready presentation: no 3D engine or heavy carousel dependency is required for the current static-image set.

## Important 360° limitation

The supplied stills do not contain a full turntable sequence for every garment. A genuine 360° product spin requires consistent images captured around the same item—typically 24–36 frames at equal angular intervals (or a properly authored GLB/GLTF model). The UI therefore switches only between angles actually supplied and explicitly explains where more frames are needed. It does not invent unseen sides.

## Image preparation

The supplied photos were separated into transparent RGBA cut-outs and exported as WebP to keep the demo light. Some colour options are derived from the original garment pixels while preserving much of the source texture, shading and trim; review them against real product samples before using them commercially. For production-grade cut-outs, use a garment-aware segmentation model (for example, SAM 2 with a prompted mask or a dedicated clothing segmentation model) and manually review the alpha edge at full resolution.

## Main files

- `src/components/GarmentCarousel.tsx` — product data, colour selector, image angles, drag behaviour.
- `src/style.css` — visual design and responsive layout.
- `public/images/cutouts/` — transparent product images and digital colour previews.
