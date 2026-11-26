# Site history

An archive of nine versions of Aryan Baburajan's website. The Next.js viewer loads the archived pages from `public/versions` and keeps them mounted for quick navigation; it does not read Git history at runtime.

## Run locally

Requires Node.js 20.9 or later.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Use the arrow keys or the on-screen controls to move between versions. Press Ctrl+/ (Cmd+/ on macOS) to choose versions; click a version name to preview it. Selections reset on reload and can be copied for sharing.

Run `npm run build` to create a production build and `npm start` to serve it. This application uses a Next.js route handler and requires a Node.js-compatible host.

## Archive notes

`versions.json` lists the versions and their entry pages. The March 2021 page is a reconstruction from a screenshot; its background image was supplied from https://i.redd.it/70jed1dvmsp11.jpg. The November 2026 version is a static export; its server-side API is not included. Some historical pages reference external resources or unavailable destinations.

The archived material includes third-party artwork and fonts. Check the relevant usage permissions before publishing the archive publicly.
