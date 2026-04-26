// Lightweight DB types (a slim subset; run `supabase gen types` for full types)
export type UserRole = "admin" | "coach" | "client";
export type VerificationStatus =
  | "pending_verification"
  | "under_review"
  | "active"
  | "rejected"
  | "suspended";

export type Profile = {
  id: string;
  role: UserRole;
  verification_status: VerificationStatus;
  full_name: string | null;
  email: string | null;
  kyc_legal_name: string | null;
  kyc_tax_id: string | null;
  kyc_documents: Array<{ kind: string; storage_path: string; uploaded_at?: string }> | null;
  kyc_submitted_at: string | null;
  kyc_reviewed_at: string | null;
  kyc_rejection_reason: string | null;
  created_at: string;
};

export type CoachProfile = {
  id: string;
  slug: string | null;
  bio: string | null;
  philosophy: string | null;
  specializations: string[] | null;
  achievements: Array<{ title: string; year?: number; issuer?: string }> | null;
  certifications: Array<{ name: string; issuer?: string; year?: number; file_path?: string }> | null;
  avatar_url: string | null;
  cover_url: string | null;
  gallery_urls: string[] | null;
  certificate_urls: string[] | null;
  social_links: Record<string, string> | null;
  is_public: boolean;
  monthly_rate_cents: number | null;
  currency: string | null;
};

export type Client = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string | null;
  goals: string | null;
  onboarding_step:
    | "invited"
    | "medical_questionnaire"
    | "injury_history"
    | "consent_forms"
    | "complete";
  avatar_url: string | null;
  created_at: string;
};

export type TriageFlag = {
  id: string;
  client_id: string;
  kind: "red" | "green";
  rule: string;
  title: string;
  detail: string | null;
  severity: number;
  resolved: boolean;
  created_at: string;
};

export type ActivityEvent = {
  id: string;
  client_id: string;
  event_type:
    | "workout_completed"
    | "workout_missed"
    | "meal_logged"
    | "pr_achieved"
    | "metric_logged"
    | "form_check_uploaded"
    | "message_sent";
  payload: Record<string, unknown>;
  occurred_at: string;
};
