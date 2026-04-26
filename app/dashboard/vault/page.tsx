import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { PageHeader } from "@/components/onyx/page-header";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/onyx/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyCents, formatDate } from "@/lib/utils";
import { UploadResource, ResourceRow } from "./upload-resource";
import { Biomarkers, type BiomarkerRow } from "./biomarkers";

export const dynamic = "force-dynamic";

export default async function VaultPage({
  searchParams,
}: {
  searchParams: { client?: string };
}) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: subs }, { data: resources }, { data: links }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select(
        "id, status, amount_cents, currency, current_period_end, next_billing_locked, locked_reason, client:clients(full_name)",
      )
      .eq("coach_id", user.id)
      .order("current_period_end", { ascending: false })
      .limit(20),
    supabase
      .from("resource_files")
      .select("id, title, kind, visibility, external_url, storage_path, created_at")
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("coaches_clients")
      .select("client:clients(id, full_name, avatar_url)")
      .eq("coach_id", user.id)
      .eq("active", true)
      .order("started_at", { ascending: false }),
  ]);

  const clients = (links ?? [])
    .map((l: any) => (Array.isArray(l.client) ? l.client[0] : l.client))
    .filter(Boolean);

  const selectedId = searchParams.client;
  const selected = selectedId ? clients.find((c: any) => c.id === selectedId) : null;

  let biomarkers: BiomarkerRow[] = [];
  if (selected) {
    const { data } = await supabase
      .from("health_vault")
      .select(
        "id, category, marker, value, unit, reference_low, reference_high, recorded_at, notes, document_path",
      )
      .eq("coach_id", user.id)
      .eq("client_id", selected.id)
      .order("recorded_at", { ascending: false })
      .limit(200);
    biomarkers = (data ?? []) as BiomarkerRow[];
  }

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="HEALTH & BUSINESS VAULT"
        title={<span>Markery, pieniądze, <em className="not-italic onyx-signal">pamiątki</em>.</span>}
        description="Oś czasu biomarkerów, automatyczny status subskrypcji i biblioteka zasobów dla klientów premium."
      />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Subscription health</CardTitle></CardHeader>
          <CardBody>
            {subs && subs.length > 0 ? (
              <ul className="divide-y divide-onyx-line">
                {subs.map((s: any) => (
                  <li key={s.id} className="py-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[14px] text-onyx-bone">{s.client?.full_name}</div>
                      <div className="font-mono text-[11px] text-onyx-dim">
                        odnowi się {formatDate(s.current_period_end)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          s.status === "active"
                            ? "green"
                            : s.status === "past_due"
                              ? "red"
                              : "default"
                        }
                      >
                        {s.status}
                      </Badge>
                      <span className="font-mono text-[13px] text-onyx-bone">
                        {formatCurrencyCents(s.amount_cents, s.currency ?? "EUR")}
                      </span>
                      {s.next_billing_locked && (
                        <Badge variant="red">LOCKED · {s.locked_reason}</Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-onyx-mute py-4">
                Brak subskrypcji — pojawią się tu po pierwszym webhooku Stripe.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Biomarker map</CardTitle>
            {selected && (
              <Link href="/dashboard/vault" className="onyx-label hover:text-onyx-amber">
                Wyczyść
              </Link>
            )}
          </CardHeader>
          <CardBody>
            {clients.length === 0 ? (
              <EmptyState
                title="Najpierw zaproś klienta."
                description="Markery zdrowotne zapisujemy per-klient. Dodaj atletę na zakładce Klienci."
              />
            ) : !selected ? (
              <div>
                <p className="text-[13px] text-onyx-mute mb-4">
                  Wybierz atletę, aby przeglądać i dodawać wyniki badań — testosteron,
                  kortyzol, witamina D, ferrytyna, lipidogram itd.
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {clients.slice(0, 8).map((c: any) => (
                    <li key={c.id}>
                      <Link
                        href={`/dashboard/vault?client=${c.id}`}
                        className="flex items-center gap-3 border border-onyx-line p-3 hover:border-onyx-line2"
                      >
                        <Avatar name={c.full_name} src={c.avatar_url} size={28} />
                        <span className="text-[13px] text-onyx-bone truncate">
                          {c.full_name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.full_name} src={selected.avatar_url} size={36} />
                  <div className="min-w-0">
                    <div className="text-[14px] text-onyx-bone truncate">
                      {selected.full_name}
                    </div>
                    <div className="text-[11px] font-mono text-onyx-dim">
                      mapa biomarkerów
                    </div>
                  </div>
                </div>
                <Biomarkers clientId={selected.id} rows={biomarkers} />
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Resource library</CardTitle>
          <UploadResource userId={user.id} />
        </CardHeader>
        <CardBody>
          {resources && resources.length > 0 ? (
            <ul className="divide-y divide-onyx-line">
              {resources.map((r: any) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[14px] text-onyx-bone truncate">{r.title}</div>
                    <div className="font-mono text-[11px] text-onyx-dim truncate">
                      {r.kind} · {r.visibility} · {formatDate(r.created_at)}
                    </div>
                  </div>
                  <ResourceRow
                    id={r.id}
                    storagePath={r.storage_path ?? null}
                    externalUrl={r.external_url ?? null}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Twoja prywatna biblioteka jest pusta."
              description="Wgraj PDFy, książki kucharskie i kody rabatowe — widoczne tylko dla aktywnych subskrybentów."
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
