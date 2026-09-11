<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## BiteID

Read these before changing app code:

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — stack, file map, state model, wizard flow, and hard rules (no medical logic or secrets on the client; emergency path must stay loud; semantic color tokens only).
- [docs/BACKEND_CONTRACT.md](docs/BACKEND_CONTRACT.md) — the `FormData` fields posted to `VITE_API_URL` and the accepted response shape.

Framework note: this is TanStack Start + Vite, not Next.js. Client config comes from `import.meta.env.VITE_*`.
