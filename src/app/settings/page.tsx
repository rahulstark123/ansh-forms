"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import {
  User,
  Building,
  Check,
  Edit2,
  Save,
  X,
  Phone,
  MapPin,
  Loader2,
  ChevronDown,
  FolderOpen,
  Plus,
  Trash2,
} from "lucide-react";
import { Portal } from "@/components/ui/portal";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { apiClient } from "@/lib/api-client";
import { normalizeCategoryName } from "@/lib/form-categories";
import { clearWorkspaceSlugCache } from "@/hooks/use-workspace-slug";

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
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);
  const [taxId, setTaxId] = useState("");
  const [corporateEmail, setCorporateEmail] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("English (US)");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [fetchingCompanyPincode, setFetchingCompanyPincode] = useState(false);
  const [timezones, setTimezones] = useState<string[]>([]);

  useEffect(() => {
    try {
      if (typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function") {
        setTimezones(Intl.supportedValuesOf("timeZone"));
      } else {
        setTimezones([
          "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Singapore", 
          "Europe/Paris", "America/Los_Angeles", "UTC"
        ]);
      }
    } catch {
      setTimezones([
        "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Singapore", 
        "Europe/Paris", "America/Los_Angeles", "UTC"
      ]);
    }
  }, []);

  const handleCompanyPincodeChange = async (pin: string) => {
    setPincode(pin);
    if (/^\d{6}$/.test(pin)) {
      setFetchingCompanyPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
            const first = data[0].PostOffice[0];
            setCity(first.District || first.Block || first.Circle || "");
            setState(first.State || "");
            setCountry("India");
            toast(`Auto-filled HQ: ${first.District || first.Block}, ${first.State}`);
          }
        }
      } catch (err) {
        console.error("Company pincode lookup error:", err);
      } finally {
        setFetchingCompanyPincode(false);
      }
    }
  };

  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [savingCategories, setSavingCategories] = useState(false);
  const [newCategory, setNewCategory] = useState("");

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
  /* Load workspace details from DB on mount/tab change */
  useEffect(() => {
    if (activeTab !== "company") return;
    apiClient("/api/workspace")
      .then((r) => r.json())
      .then((data) => {
        if (data.workspace) {
          if (data.workspace.name) setCompanyName(data.workspace.name);
          if (data.workspace.slug) setCompanySlug(data.workspace.slug);
          if (data.workspace.taxId) setTaxId(data.workspace.taxId);
          if (data.workspace.corporateEmail) setCorporateEmail(data.workspace.corporateEmail);
          if (data.workspace.address) setAddress(data.workspace.address);
          if (data.workspace.timezone) setTimezone(data.workspace.timezone);
          if (data.workspace.language) setLanguage(data.workspace.language);
          if (data.workspace.pincode) setPincode(data.workspace.pincode);
          if (data.workspace.city) setCity(data.workspace.city);
          if (data.workspace.state) setState(data.workspace.state);
          if (data.workspace.country) setCountry(data.workspace.country);
        }
      })
      .catch(console.error);
  }, [activeTab]);
  /* Load localStorage for company tab extras (company name comes from the workspace API) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    setTaxId(localStorage.getItem("company_tax_id") || "");
    setCorporateEmail(localStorage.getItem("company_email") || "");
    setAddress(localStorage.getItem("company_address") || "");
    setTimezone(localStorage.getItem("company_timezone") || "Asia/Kolkata");
    setLanguage(localStorage.getItem("company_language") || "English (US)");
    setPincode(localStorage.getItem("company_pincode") || "");
    setCity(localStorage.getItem("company_city") || "");
    setState(localStorage.getItem("company_state") || "");
    setCountry(localStorage.getItem("company_country") || "");
  }, []);

  /* Load workspace form categories */
  useEffect(() => {
    if (activeTab !== "workspace") return;
    setLoadingCategories(true);
    apiClient("/api/workspace/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.categories)) setCategories(data.categories);
      })
      .catch(console.error)
      .finally(() => setLoadingCategories(false));
  }, [activeTab]);

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
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      const res = await apiClient("/api/workspace", {
        method: "PUT",
        body: JSON.stringify({ 
          name: companyName,
          taxId,
          corporateEmail,
          address,
          timezone,
          language,
          pincode,
          city,
          state,
          country
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save company details.");

      if (data.workspace?.slug) {
        setCompanySlug(data.workspace.slug);
        clearWorkspaceSlugCache();
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("company_name", companyName);
        localStorage.setItem("company_tax_id", taxId);
        localStorage.setItem("company_email", corporateEmail);
        localStorage.setItem("company_address", address);
        localStorage.setItem("company_timezone", timezone);
        localStorage.setItem("company_language", language);
        localStorage.setItem("company_pincode", pincode);
        localStorage.setItem("company_city", city);
        localStorage.setItem("company_state", state);
        localStorage.setItem("company_country", country);
      }
      toast("Company details updated successfully.");
    } catch (err: unknown) {
      toast(`Error: ${err instanceof Error ? err.message : "Save failed"}`);
    } finally {
      setSavingCompany(false);
    }
  };

  /* ── Workspace categories ── */
  const saveCategories = async (next: string[]) => {
    setSavingCategories(true);
    try {
      const res = await apiClient("/api/workspace/categories", {
        method: "PUT",
        body: JSON.stringify({ categories: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save categories.");
      setCategories(data.categories);
      toast("Form categories updated.");
    } catch (err: unknown) {
      toast(`Error: ${err instanceof Error ? err.message : "Save failed"}`);
    } finally {
      setSavingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    const name = normalizeCategoryName(newCategory);
    if (!name) return;
    if (categories.some((c) => c.toLowerCase() === name.toLowerCase())) {
      toast("Category already exists.");
      return;
    }
    setNewCategory("");
    await saveCategories([...categories, name]);
  };

  const handleRemoveCategory = async (name: string) => {
    if (categories.length <= 1) {
      toast("At least one category is required.");
      return;
    }
    await saveCategories(categories.filter((c) => c !== name));
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
            {activeTab === "workspace" && "Create and manage form categories used across your workspace."}
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
                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company or workspace name" className="premium-input text-xs font-bold" required />
                {companySlug && (
                  <p className="text-[10px] text-slate-400 font-mono mt-1.5">
                    Public form URLs: <span className="text-slate-600 dark:text-zinc-300">/{companySlug}/your-form-slug</span>
                  </p>
                )}
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Corporate Tax ID</label>
                <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="e.g. TAX-00000-IN" className="premium-input text-xs font-bold" />
              </div>
            </div>
             <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Corporate Email Address</label>
              <input type="email" value={corporateEmail} onChange={(e) => setCorporateEmail(e.target.value)} placeholder="admin@yourcompany.com" className="premium-input text-xs font-bold" required />
            </div>
            
            {/* HQ Pincode, City, State, Country address block */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">HQ Pincode</label>
                <div className="relative">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => handleCompanyPincodeChange(e.target.value)}
                    placeholder="e.g. 842001"
                    className="premium-input text-xs font-bold"
                  />
                  {fetchingCompanyPincode && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-primary" />
                  )}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">HQ City / District</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Muzaffarpur" className="premium-input text-xs font-bold" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">HQ State</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Bihar" className="premium-input text-xs font-bold" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">HQ Country</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. India" className="premium-input text-xs font-bold" />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Physical HQ Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, city, country" className="premium-input text-xs font-bold" required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">HQ Local Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="premium-input text-xs font-bold bg-card">
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Default System Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="premium-input text-xs font-bold bg-card">
                  {[
                    "English (US)", "English (UK)", "Hindi (IN)", "Spanish (ES)", "French (FR)",
                    "German (DE)", "Chinese (CN)", "Japanese (JP)", "Arabic (AR)", "Bengali (IN)",
                    "Portuguese (PT)", "Russian (RU)", "Italian (IT)", "Dutch (NL)", "Turkish (TR)",
                    "Korean (KR)", "Vietnamese (VN)", "Tamil (IN)", "Telugu (IN)", "Marathi (IN)", "Urdu (PK)"
                  ].map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
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
        <div className="space-y-6 max-w-3xl">
          <div className="crm-card bg-card border-border p-6 space-y-5">
            <div className="flex gap-3 items-center pb-3 border-b border-border/50">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                  Form Categories
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Categories appear when creating or editing forms. Infrastructure keys are configured via environment variables.
                </p>
              </div>
            </div>

            {loadingCategories ? (
              <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs font-bold">Loading categories…</span>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                    placeholder="New category name…"
                    className="premium-input text-xs flex-1"
                    maxLength={48}
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={savingCategories || !normalizeCategoryName(newCategory)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider hover:opacity-90 disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li
                      key={cat}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-slate-50/50 dark:bg-zinc-900/20"
                    >
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">{cat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        disabled={savingCategories || categories.length <= 1}
                        className="h-8 w-8 rounded-lg border border-border/80 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 disabled:opacity-30 cursor-pointer"
                        title="Remove category"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>

                {savingCategories && (
                  <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving…
                  </p>
                )}
              </>
            )}
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
