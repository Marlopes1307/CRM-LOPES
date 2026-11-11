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

## Project rules
- CRM data access goes through `src/lib/use-table.ts` (browser client + RLS scoped by `user_id`); keeps every page's CRUD consistent.
- Property photos live in the private `property-photos` bucket under `<user_id>/...` and are shown via signed URLs; public buckets are blocked in this workspace.
- Business rules (stages, commission math) live in `src/lib/crm.ts` with tests in `src/lib/crm.test.ts`.
