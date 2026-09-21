# BiteID

Build the frontend UI for a medical triage web application using Next.js (App Router), React, and Tailwind CSS. The app must be a 'dumb client' containing zero business logic or API keys.

Create a 3-step interactive intake wizard:

Image Capture: Two upload cards. One mandatory for 'Skin Lesion', one optional for 'Captured Bug'.

Context Selector: Dropdowns for environment (e.g., Woods, Bed, Yard) and symptom duration.

Safety Screener: A checklist of emergency symptoms. If any are checked, immediately display a prominent red warning modal.

Create a Results Dashboard:

Display ranked probability cards with visual confidence bars.

Include an interactive Fitzpatrick Skin Tone selector (Tabs for Types I-II, III-IV, V-VI) that swaps out a placeholder medical reference image.

Data Handling: When the form submits, the UI must package the images and text selections into a standard FormData object (to handle binary files) and send a POST request to a configurable NEXT_PUBLIC_API_URL. Do not attempt to parse the AI response locally; just await the JSON from the backend.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://biteid.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2228b4d3-36c0-40d4-9cb2-fb973629c14f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
