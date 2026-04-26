# Supabase — Onyx Coach

## Stan

Schemat bazy jest **już zaaplikowany** na projekcie `rzpbjtjpinxufygpwhuo`
(14 migracji `01_extensions_and_enums` … `14_advisor_hardening`,
zaaplikowanych przez poprzedniego agenta — pliki SQL nie zostały
zachowane w repo).

Sprawdzić aktualny stan można przez Supabase CLI:

```bash
supabase link --project-ref rzpbjtjpinxufygpwhuo
supabase migration list
```

## Co jest w bazie (potwierdzone)

- 37 tabel w `public` (w tym `profiles`, `coach_profiles`, `clients`,
  `coaches_clients`, `triage_flags`, `activity_events`, `programs`,
  `exercises`, `form_checks`, `subscriptions`, `stripe_disputes`,
  `admin_broadcasts`, `resource_files` …)
- RLS włączone na każdej tabeli (20 storage policies, ~25+ table policies)
- RPCs: `admin_kpis()`, `is_admin()`, `is_active_coach()`, `coach_owns_client()`
- Storage buckety: `avatars`, `coach-gallery`, `certificates`,
  `kyc-documents`, `progress-photos`, `form-checks`, `voiceovers`,
  `health-vault`, `resources`, `chat-attachments`

Konwencja ścieżek storage: każdy plik leży pod `<auth.uid()>/...`. Storage RLS
weryfikuje `(storage.foldername(name))[1] = auth.uid()::text`.

## Edge Function — `coach-kyc-submit`

Plik: `supabase/functions/coach-kyc-submit/index.ts`. Wywoływana z
`app/(auth)/pending-verification/kyc-form.tsx` po uploadzie do bucketu
`kyc-documents`. **Nie jest jeszcze zdeployowana** — zrób:

```bash
supabase functions deploy coach-kyc-submit
```

## Promocja konta na admina

Trigger `handle_new_auth_user` (lub jego odpowiednik z bazy) zakłada wszystkim
domyślnie `role = 'coach'`. Pierwszego admina trzeba ręcznie:

```sql
update public.profiles
set role = 'admin', verification_status = 'active'
where email = 'orvana.group@gmail.com';
```

(Wykonaj **po** zarejestrowaniu się na `/signup`.)
