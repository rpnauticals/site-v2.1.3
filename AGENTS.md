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

- Keep the downloadable website in `public/site` as standalone HTML/CSS/JavaScript with relative local links; this preserves direct-file offline browsing.
- Use the TanStack index only to open the static home page in the hosted preview; the downloadable site must not depend on the preview framework.
- Keep IMU-CET-specific presentation in its own static stylesheet and test numeric course rules against the shipped HTML; this avoids changing unrelated pages.
