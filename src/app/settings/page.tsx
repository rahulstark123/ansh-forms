"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import {
  Key,
  Upload,
  Database,
  RefreshCw,
  User,
  Building,
  CreditCard,
  Settings,
  Check,
  Edit2,
  Save,
  X,
  Briefcase,
  Calendar,
  Phone,
  Mail,
  Droplet,
  MapPin,
  Globe,
  Clock,
  Award,
  Sparkles,
  TrendingUp,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/ui/portal";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

/* ─── types ─────────────────────────────────────────────────── */
interface ProfileFields {
  name: string;
  phone: string;
  dob: string;
  bloodGroup: string;
  officeLocation: string;
  pincode: string;
  state: string;
  city: string;
  emergencyName: string;
  emergencyPhone: string;
}

/* ─── helpers ────────────────────────────────────────────────── */
const BLOOD_GROUPS = ["", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider">{label}</span>
      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
        {value || <span className="text-slate-300 dark:text-zinc-600 italic">—</span>}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const user = useUIStore((state) => state.user);
  const setUser = useUIStore((state) => state.setUser);

  /* toast */
  const [successMsg, setSuccessMsg] = useState("");
  const toast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  /* ── Profile display state (read from DB) ── */
  const [profile, setProfile] = useState<ProfileFields>({
    name: user?.name || "",
    phone: user?.phone || "",
    dob: "",
    bloodGroup: "",
    officeLocation: "",
    pincode: "",
    state: "",
    city: "",
    emergencyName: "",
    emergencyPhone: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  /* ── Edit modal pincode lookup state ── */
  const [fetchingPincode, setFetchingPincode] = useState(false);

  /* ── Edit modal state ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<ProfileFields>(profile);
  const [saving, setSaving] = useState(false);

  /* ── Company / Workspace states ── */
  const [companyName, setCompanyName] = useState("Ansh Apps Corp");
  const [taxId, setTaxId] = useState("TAX-89304-IN");
  const [corporateEmail, setCorporateEmail] = useState("admin@anshapps.com");
  const [address, setAddress] = useState("120 Venture Boulevard, Tech City, IN");
  const [timezone, setTimezone] = useState("UTC+05:30 (IST)");
  const [language, setLanguage] = useState("English (US)");

  const [geminiKey, setGeminiKey] = useState("");
  const [r2Endpoint, setR2Endpoint] = useState("");
  const [r2Bucket, setR2Bucket] = useState("");
  const [r2AccessKey, setR2AccessKey] = useState("");
  const [r2SecretKey, setR2SecretKey] = useState("");

  const [savingKey, setSavingKey] = useState(false);
  const [savingR2, setSavingR2] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ── Fetch profile from DB on mount ── */
  useEffect(() => {
    if (!user?.email) return;
    setLoadingProfile(true);
    fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          const p: ProfileFields = {
            name: data.profile.name || user.name || "",
            phone: data.profile.phone || "",
            dob: data.profile.dob || "",
            bloodGroup: data.profile.bloodGroup || "",
            officeLocation: data.profile.officeLocation || "",
            pincode: data.profile.pincode || "",
            state: data.profile.state || "",
            city: data.profile.city || "",
            emergencyName: data.profile.emergencyName || "",
            emergencyPhone: data.profile.emergencyPhone || "",
          };
          setProfile(p);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, [user?.email]);

  /* Load localStorage for workspace/company tabs */
  useEffect(() => {
    if (typeof window === "undefined") return;
    setGeminiKey(localStorage.getItem("GEMINI_API_KEY") || "");
    setR2Endpoint(localStorage.getItem("R2_ENDPOINT") || "");
    setR2Bucket(localStorage.getItem("R2_BUCKET_NAME") || "");
    setR2AccessKey(localStorage.getItem("R2_ACCESS_KEY_ID") || "");
    setR2SecretKey(localStorage.getItem("R2_SECRET_ACCESS_KEY") || "");
    setCompanyName(localStorage.getItem("company_name") || "Ansh Apps Corp");
    setTaxId(localStorage.getItem("company_tax_id") || "TAX-89304-IN");
    setCorporateEmail(localStorage.getItem("company_email") || "admin@anshapps.com");
    setAddress(localStorage.getItem("company_address") || "120 Venture Boulevard, Tech City, IN");
    setTimezone(localStorage.getItem("company_timezone") || "UTC+05:30 (IST)");
    setLanguage(localStorage.getItem("company_language") || "English (US)");
  }, []);

  /* ── Open modal: seed draft from current profile ── */
  const openModal = () => {
    setDraft({ ...profile });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  /* ── Pincode Lookup and Auto-fill ── */
  const handlePincodeChange = async (pin: string) => {
    setDraft(prev => ({ ...prev, pincode: pin }));
    if (/^\d{6}$/.test(pin)) {
      setFetchingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
            const first = data[0].PostOffice[0];
            setDraft(prev => ({
              ...prev,
              state: first.State || "",
              city: first.District || first.Block || first.Circle || ""
            }));
            toast(`Auto-filled: ${first.District || first.Block}, ${first.State}`);
          }
        }
      } catch (err) {
        console.error("Pincode lookup error:", err);
      } finally {
        setFetchingPincode(false);
      }
    }
  };

  /* ── PATCH profile to DB ── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, ...draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setProfile({ ...draft });
      // Keep global store in sync
      if (user) setUser({ ...user, name: draft.name, phone: draft.phone });
      closeModal();
      toast("Profile updated successfully in database.");
    } catch (err: any) {
      toast(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ── Company save ── */
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("company_name", companyName);
      localStorage.setItem("company_tax_id", taxId);
      localStorage.setItem("company_email", corporateEmail);
      localStorage.setItem("company_address", address);
      localStorage.setItem("company_timezone", timezone);
      localStorage.setItem("company_language", language);
      toast("Company details updated successfully.");
    }
  };

  /* ── Workspace saves ── */
  const handleSaveGemini = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKey(true);
    if (typeof window !== "undefined") localStorage.setItem("GEMINI_API_KEY", geminiKey);
    toast("Gemini AI API credentials saved.");
    setSavingKey(false);
  };

  const handleSaveR2 = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingR2(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("R2_ENDPOINT", r2Endpoint);
      localStorage.setItem("R2_BUCKET_NAME", r2Bucket);
      localStorage.setItem("R2_ACCESS_KEY_ID", r2AccessKey);
      localStorage.setItem("R2_SECRET_ACCESS_KEY", r2SecretKey);
    }
    toast("Cloudflare R2 storage settings saved.");
    setSavingR2(false);
  };

  /* ── Postgres sync ── */
  const handleSyncProfile = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        toast("Profile synced with PostgreSQL successfully.");
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePlanToggle = (plan: "Free" | "Pro") => {
    if (user) {
      setUser({ ...user, pricingPlan: plan });
      toast(`Pricing plan updated to ${plan} subscription successfully!`);
    }
  };

  /* ── Input helper ── */
  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { type?: string; required?: boolean }
  ) => (
    <div>
      <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">{label}</label>
      <input
        type={opts?.type || "text"}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        required={opts?.required}
        className="premium-input text-xs"
      />
    </div>
  );



  /* ═══════════════════════════════ RENDER ═══════════════════════════════ */
  return (
    <>
      {/* ── Edit Profile Modal ── */}
      {modalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />
            {/* panel */}
            <div className="relative z-10 w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fadeInDown">
              {/* modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-100">
                      Edit Profile
                    </h2>
                    <p className="text-[9px] text-slate-400 font-semibold">Changes are saved to the database</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="h-8 w-8 rounded-xl border border-border flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* modal body */}
              <form onSubmit={handleSaveProfile}>
                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

                  {/* Identity */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                      Identity Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {field("Full Name", draft.name, (v) => setDraft({ ...draft, name: v }), { required: true })}
                      {field("Date of Birth", draft.dob, (v) => setDraft({ ...draft, dob: v }), { type: "date" })}
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Blood Group</label>
                        <div className="relative">
                          <select
                            value={draft.bloodGroup}
                            onChange={(e) => setDraft({ ...draft, bloodGroup: e.target.value })}
                            className="w-full appearance-none premium-input text-xs pr-8 bg-card"
                          >
                            <option value="">Not Specified</option>
                            {BLOOD_GROUPS.filter(Boolean).map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                      Contact Coordinates
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                          Phone Number
                        </label>
                        <div className="w-full flex items-center pl-3 pr-4 py-2 rounded-xl border border-border bg-card focus-within:border-primary/50 text-xs font-semibold outline-none transition-all focus-within:bg-card">
                          <PhoneInput
                            international
                            defaultCountry="IN"
                            value={draft.phone}
                            onChange={(val) => setDraft({ ...draft, phone: val || "" })}
                            placeholder="Enter phone number"
                            className="w-full text-xs"
                            numberInputProps={{
                              className: "w-full bg-transparent border-none outline-none text-xs font-bold pl-2 placeholder:text-slate-400 dark:placeholder:text-zinc-550"
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Email</label>
                        <div className="premium-input text-xs opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 text-slate-500">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                      Emergency Contact
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {field("Contact Name", draft.emergencyName, (v) => setDraft({ ...draft, emergencyName: v }))}
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                          Contact Phone
                        </label>
                        <div className="w-full flex items-center pl-3 pr-4 py-2 rounded-xl border border-border bg-card focus-within:border-primary/50 text-xs font-semibold outline-none transition-all focus-within:bg-card">
                          <PhoneInput
                            international
                            defaultCountry="IN"
                            value={draft.emergencyPhone}
                            onChange={(val) => setDraft({ ...draft, emergencyPhone: val || "" })}
                            placeholder="Enter emergency contact number"
                            className="w-full text-xs"
                            numberInputProps={{
                              className: "w-full bg-transparent border-none outline-none text-xs font-bold pl-2 placeholder:text-slate-400 dark:placeholder:text-zinc-550"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-3 pt-2 border-t border-border/40">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                        Office Location Address
                      </span>
                      {fetchingPincode && (
                        <span className="flex items-center gap-1 text-[9px] text-slate-450 dark:text-slate-400 font-bold">
                          <Loader2 className="h-3 w-3 animate-spin text-primary" />
                          <span>Verifying pincode...</span>
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-2">
                        {field("Office Location Address", draft.officeLocation, (v) => setDraft({ ...draft, officeLocation: v }))}
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider block mb-1">Pincode</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={draft.pincode || ""}
                          onChange={(e) => handlePincodeChange(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 110001"
                          className="premium-input text-xs font-bold"
                        />
                      </div>
                      {field("City", draft.city, (v) => setDraft({ ...draft, city: v }))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {field("State", draft.state, (v) => setDraft({ ...draft, state: v }))}
                    </div>
                  </div>

                </div>

                {/* modal footer */}
                <div className="px-6 py-4 border-t border-border/60 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/20">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl border border-border text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider hover:opacity-90 cursor-pointer disabled:opacity-60 transition-opacity"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      <div className="space-y-8 select-none max-w-6xl animate-fadeIn">

        {/* Toast */}
        {successMsg && (
          <div className="fixed bottom-6 right-6 p-4 rounded-2xl bg-emerald-500 text-white border border-emerald-400 shadow-xl flex gap-3 items-center animate-fadeInDown z-50">
            <Check className="h-5 w-5 bg-white/20 rounded-full p-0.5 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">{successMsg}</span>
          </div>
        )}

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-zinc-50 tracking-tight leading-none uppercase">
            {activeTab === "profile" && "Profile Setting"}
            {activeTab === "company" && "Company Settings"}
            {activeTab === "workspace" && "Workspace Settings"}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-2">
            {activeTab === "profile" && "Manage your account profile details, contact info, emergency contacts, and office location parameters."}
            {activeTab === "company" && "Configure organization structures, default localization models, and billing credentials."}
            {activeTab === "workspace" && "Integrate database states, Gemini AI models, and Cloudflare storage keys."}
          </p>
        </div>
      </div>

      {/* ═══════════ PROFILE TAB ═══════════ */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* Left card */}
          <div className="crm-card bg-card border-border p-8 flex flex-col items-center text-center">
            <div className="h-28 w-28 rounded-3xl bg-gradient-to-tr from-sky-400 to-emerald-400 flex items-center justify-center text-4xl font-black text-white shadow-lg mb-5 animate-float select-none">
              {profile.name ? profile.name[0].toUpperCase() : "U"}
            </div>
            <h2 className="text-lg font-black text-slate-800 dark:text-zinc-150 leading-tight">{profile.name || user?.name}</h2>
            <div className="mt-2">
              <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-sky-100/50 text-sky-600 border border-sky-200/50 dark:bg-sky-955/20 dark:text-sky-400 dark:border-sky-850/40">
                ADMIN
              </span>
            </div>

            <div className="w-full mt-8 pt-6 border-t border-border/50 space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Office Location</span>
                <span className="font-extrabold text-slate-700 dark:text-zinc-300 truncate max-w-[120px]" title={profile.officeLocation}>{profile.officeLocation || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">City</span>
                <span className="font-extrabold text-slate-700 dark:text-zinc-300">{profile.city || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Pincode</span>
                <span className="font-extrabold text-slate-700 dark:text-zinc-300">{profile.pincode || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Blood Group</span>
                <span className="font-extrabold text-slate-750 dark:text-zinc-300 uppercase">{profile.bloodGroup || "—"}</span>
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={openModal}
              className="mt-6 w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider hover:opacity-90 cursor-pointer transition-opacity"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Right: read-only detail card */}
          <div className="crm-card bg-card border-border p-8 lg:col-span-2 space-y-6">
            {loadingProfile ? (
              <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs font-bold">Loading profile…</span>
              </div>
            ) : (
              <>
                {/* Identity */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Identity Details</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    <InfoRow label="Full Name" value={profile.name} />
                    <InfoRow label="Date of Birth" value={profile.dob} />
                    <InfoRow label="Blood Group" value={profile.bloodGroup} />
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Contact Coordinates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <InfoRow label="Phone Number" value={profile.phone} />
                    <InfoRow label="Email Address" value={user?.email || ""} />
                  </div>
                </div>

                {/* Emergency */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <AlertIcon />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Emergency Contact</span>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <InfoRow label="Contact Name" value={profile.emergencyName} />
                    <InfoRow label="Contact Phone" value={profile.emergencyPhone} />
                  </div>
                </div>

                {/* Office Location */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Office Location Details</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                    <div className="col-span-2">
                      <InfoRow label="Office Location Address" value={profile.officeLocation} />
                    </div>
                    <InfoRow label="Pincode" value={profile.pincode} />
                    <InfoRow label="City & State" value={profile.city && profile.state ? `${profile.city}, ${profile.state}` : profile.city || profile.state || ""} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ COMPANY TAB ═══════════ */}
      {activeTab === "company" && (
        <div className="crm-card bg-card border-border p-8 max-w-3xl space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border/50">
            <Building className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-xs font-black text-slate-800 dark:text-zinc-250 uppercase tracking-widest">
              Organization Structure
            </h3>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Company Name</label>
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="premium-input text-xs font-bold" required />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Corporate Tax ID</label>
                <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} className="premium-input text-xs font-bold" />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Corporate Email Address</label>
              <input type="email" value={corporateEmail} onChange={(e) => setCorporateEmail(e.target.value)} className="premium-input text-xs font-bold" required />
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Physical HQ Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="premium-input text-xs font-bold" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">HQ Local Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="premium-input text-xs">
                  <option value="UTC+05:30 (IST)">UTC+05:30 (IST)</option>
                  <option value="UTC-08:00 (PST)">UTC-08:00 (PST)</option>
                  <option value="UTC+00:00 (GMT)">UTC+00:00 (GMT)</option>
                  <option value="UTC+01:00 (CET)">UTC+01:00 (CET)</option>
                  <option value="UTC+08:00 (SGT)">UTC+08:00 (SGT)</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Default System Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="premium-input text-xs">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Hindi (IN)</option>
                  <option>Spanish (ES)</option>
                  <option>French (FR)</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-border/40 flex justify-end">
              <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 cursor-pointer flex items-center gap-1.5">
                <Save className="h-4 w-4" />
                <span>Save Company Details</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════ WORKSPACE TAB ═══════════ */}
      {activeTab === "workspace" && (
        <div className="space-y-6 max-w-4xl">
          {/* Profile sync */}
          <div className="crm-card bg-card border-border p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black border border-primary/20 shrink-0">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider">User Profile sync</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Check active workspace connection states in the Postgres cluster.</p>
                </div>
              </div>
              <button
                onClick={handleSyncProfile}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl border border-border/80 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={cn("h-4 w-4 text-slate-400", refreshing && "animate-spin")} />
                <span>Sync profile</span>
              </button>
            </div>
            {user && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold pt-4 border-t border-border/40">
                <div><span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Full Name</span><span className="text-slate-800 dark:text-zinc-200 mt-1 block">{user.name}</span></div>
                <div><span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Email Address</span><span className="text-slate-800 dark:text-zinc-200 mt-1 block">{user.email}</span></div>
                <div><span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Workspace ID</span><span className="text-slate-800 dark:text-zinc-200 font-mono mt-1 block">WID-{user.wid}</span></div>
                <div><span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Pricing Plan</span><span className="text-primary font-black uppercase mt-1 block tracking-wider">{user.pricingPlan} Plan</span></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gemini */}
            <div className="crm-card bg-card border-border p-6">
              <div className="flex gap-3 items-center mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shrink-0"><Key className="h-5 w-5" /></div>
                <div><h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Gemini API settings</h3><p className="text-[10px] text-slate-400 font-semibold mt-0.5">Toggle prompt-based AI builders.</p></div>
              </div>
              <form onSubmit={handleSaveGemini} className="space-y-3">
                <div>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Gemini API Key</label>
                  <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AI prompt generator key..." className="premium-input text-xs mt-1" />
                  <span className="text-[8px] text-slate-400 font-bold block pt-1">If empty, AI generation falls back to template parsing logic.</span>
                </div>
                <button type="submit" disabled={savingKey} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 cursor-pointer">
                  {savingKey ? "Saving..." : "Save Gemini Key"}
                </button>
              </form>
            </div>

            {/* R2 */}
            <div className="crm-card bg-card border-border p-6">
              <div className="flex gap-3 items-center mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shrink-0"><Upload className="h-5 w-5" /></div>
                <div><h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider">Cloudflare R2 Storage</h3><p className="text-[10px] text-slate-400 font-semibold mt-0.5">Setup S3-compatible attachment stores.</p></div>
              </div>
              <form onSubmit={handleSaveR2} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[8px] font-black uppercase text-slate-400">R2 Endpoint</label><input type="text" value={r2Endpoint} onChange={(e) => setR2Endpoint(e.target.value)} placeholder="https://bucket..." className="premium-input text-[11px] py-1.5 mt-0.5" /></div>
                  <div><label className="text-[8px] font-black uppercase text-slate-400">Bucket Name</label><input type="text" value={r2Bucket} onChange={(e) => setR2Bucket(e.target.value)} placeholder="ansh-forms" className="premium-input text-[11px] py-1.5 mt-0.5" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[8px] font-black uppercase text-slate-400">Access Key ID</label><input type="password" value={r2AccessKey} onChange={(e) => setR2AccessKey(e.target.value)} placeholder="Key ID..." className="premium-input text-[11px] py-1.5 mt-0.5" /></div>
                  <div><label className="text-[8px] font-black uppercase text-slate-400">Secret Access Key</label><input type="password" value={r2SecretKey} onChange={(e) => setR2SecretKey(e.target.value)} placeholder="Secret Key..." className="premium-input text-[11px] py-1.5 mt-0.5" /></div>
                </div>
                <span className="text-[8px] text-slate-400 font-bold block">If empty, file uploads fall back to local public uploads.</span>
                <button type="submit" disabled={savingR2} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 cursor-pointer">
                  {savingR2 ? "Saving..." : "Save R2 Keys"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ BILLING TAB REMOVED ═══════════ */}

    </div>
    </>
  );
}

// small inline icon component to avoid import noise
function AlertIcon() {
  return (
    <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}
