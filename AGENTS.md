<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Journal architecture
- Markdown articles remain bundled defaults; published journal_articles rows override matching slugs through one public query, so admin publishing updates all reader surfaces without redeployment.
- Shared journal navigation and footer wrap the root Outlet; content routes own their metadata so every page is independently shareable.
- Keep unavailable editorial fields empty and render an explicit preparation state instead of generating content; source references are derived from the supplied source list.
- Canonical and Open Graph page URLs are relative until a real public domain exists; do not deploy placeholder domains or preview URLs as canonical targets.
- Admin writes use authenticated server functions plus a separate user_roles check and database policies; no signup, profile field, or browser state can grant administrator privileges.
- RSS uses the same public article reader as the website and excludes articles without manuscript text; endpoint links derive from the request origin.
- Article images store an HTTPS URL or a private-bucket object path; public reads resolve object paths to fresh signed URLs so image links do not expire permanently.
- Direct storage reads are administrator-only; public image signing uses a lazy privileged client only for exact cover/sharing paths returned by the published-only RLS article query, so draft and unused uploads stay private.
- Article body editing uses Markdown formatting tools and the same sanitized Markdown/reference renderer for live preview, full preview and public reading to prevent rendering drift.
- Structured references keep legacy title/URL records valid with empty optional authors/year; optional SEO fields use additive database columns and are saved only on explicit editor actions.
- Articles without a cover render without fallback imagery, so removing an image is respected on all reader surfaces.
