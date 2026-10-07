"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminProfilePage() {
  const [admin, setAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Edit fields
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("Pratapgarh / Prayagraj");
  const [role, setRole] = useState("Super Admin");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadAdminProfile() {
      setLoading(true);
      try {
        let adminEmail = "";
        if (typeof window !== "undefined") {
          adminEmail =
            localStorage.getItem("sarada_admin_email") ||
            localStorage.getItem("sarda_admin_email") ||
            "admin@saradahomeplan.com";
        }

        // Fetch from Supabase 'admins' table
        const { data: adminRecord, error } = await supabase
          .from("admins")
          .select("*")
          .eq("email", adminEmail)
          .maybeSingle();

        if (adminRecord) {
          setAdmin(adminRecord);
          setFullName(adminRecord.full_name || "Admin Office");
          setEmail(adminRecord.email || adminEmail);
          setMobile(adminRecord.mobile || "9876543210");
          setRole(adminRecord.role || "Super Admin");
        } else {
          // Fallback first active admin
          const { data: firstAdmin } = await supabase
            .from("admins")
            .select("*")
            .limit(1)
            .maybeSingle();

          if (firstAdmin) {
            setAdmin(firstAdmin);
            setFullName(firstAdmin.full_name || "Admin Office");
            setEmail(firstAdmin.email || "admin@saradahomeplan.com");
            setMobile(firstAdmin.mobile || "9876543210");
            setRole(firstAdmin.role || "Super Admin");
          }
        }
      } catch (err: any) {
        console.error("Error loading admin profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminProfile();
  }, [supabase]);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    if (!admin?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("admins")
        .update({
          full_name: fullName,
          mobile: mobile,
        })
        .eq("id", admin.id);

      if (error) throw error;

      if (typeof window !== "undefined") {
        localStorage.setItem("sarada_admin_name", fullName);
      }

      setAdmin((prev: any) => ({ ...prev, full_name: fullName, mobile }));
      setSuccessMessage("Admin profile updated successfully!");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase
        .from("admins")
        .update({
          password: newPassword,
        })
        .eq("id", admin.id);

      if (error) throw error;

      setSuccessMessage("Password updated successfully! Please remember your new password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}

    if (typeof window !== "undefined") {
      localStorage.removeItem("sarada_admin_logged_in");
      localStorage.removeItem("sarda_admin_logged_in");
      localStorage.removeItem("sarada_admin_email");
      localStorage.removeItem("sarada_admin_name");
      localStorage.removeItem("sarada_admin_role");

      document.cookie = "sarada_admin_logged_in=; path=/; max-age=0;";
      document.cookie = "sarda_admin_logged_in=; path=/; max-age=0;";
      window.location.href = "/admin/login";
    }
  };

  return (
    <div className="min-h-screen bg-[#f3efe6] text-[#17221b]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#ded8cd] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] px-3.5 py-1.5 text-xs font-bold text-[#17221b] transition hover:bg-[#ede8dc]"
            >
              <ArrowLeft size={15} />
              <span>Dashboard</span>
            </Link>

            <span className="text-black/30">/</span>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#063b2c] text-[#f4cf72]">
                <ShieldCheck size={16} />
              </div>
              <h1 className="font-serif text-lg font-bold text-[#17221b]">
                Admin Profile & Security
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="rounded-3xl border border-[#ded9cf] bg-white p-16 text-center shadow-sm">
            <RefreshCw size={28} className="mx-auto animate-spin text-[#063b2c]" />
            <p className="mt-3 text-sm font-semibold text-black/60">
              Loading authenticated admin profile...
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Card: Summary & Avatar */}
            <div className="rounded-3xl border border-[#ded9cf] bg-white p-6 shadow-sm space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-[#063b2c] text-3xl font-bold font-serif text-[#f4cf72] shadow-md">
                  {fullName ? fullName.slice(0, 2).toUpperCase() : "AD"}
                </div>
                <h2 className="mt-4 font-serif text-xl font-bold text-[#17221b]">
                  {fullName}
                </h2>
                <p className="text-xs font-semibold text-[#0c7a62]">{role}</p>
                <p className="text-xs text-black/50 mt-1">{email}</p>
              </div>

              <div className="border-t border-[#ede8de] pt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-black/70">
                  <span className="flex items-center gap-2">
                    <Phone size={14} className="text-[#063b2c]" />
                    <span>Mobile</span>
                  </span>
                  <span className="font-semibold text-[#17221b]">{mobile}</span>
                </div>

                <div className="flex items-center justify-between text-black/70">
                  <span className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#063b2c]" />
                    <span>HQ Office</span>
                  </span>
                  <span className="font-semibold text-[#17221b]">{location}</span>
                </div>

                <div className="flex items-center justify-between text-black/70">
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#063b2c]" />
                    <span>Status</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#0c7a62]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0c7a62]" />
                    Active Admin
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#faf8f3] p-4 text-xs text-black/60 border border-[#e4dfd5] leading-relaxed">
                <p className="font-bold text-[#063b2c] mb-1">Owner Privileges</p>
                Access to full client directory, project blueprint uploads, site visit counter-proposals, and advance payment verification.
              </div>
            </div>

            {/* Right: Edit Profile & Change Password Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Notification Banners */}
              {successMessage && (
                <div className="flex items-center gap-2 rounded-2xl border border-[#cbe1d1] bg-[#eaf5ed] p-4 text-xs font-bold text-[#0c7a62]">
                  <CheckCircle2 size={18} />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Edit Details Section */}
              <div className="rounded-3xl border border-[#ded9cf] bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#ede8de] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#17221b]">
                    Edit Profile Details
                  </h3>
                  <span className="text-xs text-black/50">Admin ID #{admin?.id}</span>
                </div>

                <form onSubmit={handleSaveChanges} className="space-y-4 text-xs">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-black/55 mb-1">
                        Full Name / Office Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-10 w-full rounded-xl border border-[#ded9cf] bg-[#faf8f3] px-3 font-semibold text-[#17221b] outline-none focus:border-[#063b2c] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-[10px] text-black/55 mb-1">
                        Official Mobile Number
                      </label>
                      <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="h-10 w-full rounded-xl border border-[#ded9cf] bg-[#faf8f3] px-3 font-semibold text-[#17221b] outline-none focus:border-[#063b2c] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-black/55 mb-1">
                        Email Address (Login ID)
                      </label>
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="h-10 w-full rounded-xl border border-[#ded9cf] bg-[#eee9df] px-3 font-semibold text-black/60 outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-[10px] text-black/55 mb-1">
                        Assigned Role
                      </label>
                      <input
                        type="text"
                        value={role}
                        readOnly
                        className="h-10 w-full rounded-xl border border-[#ded9cf] bg-[#eee9df] px-3 font-semibold text-black/60 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#063b2c] px-6 py-2.5 text-xs font-bold text-[#f4cf72] shadow-sm transition hover:bg-[#0a4d38] disabled:opacity-50"
                    >
                      <Save size={15} />
                      <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Security / Change Password Section */}
              <div className="rounded-3xl border border-[#ded9cf] bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#ede8de] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#17221b] flex items-center gap-2">
                    <KeyRound size={18} className="text-[#9b7732]" />
                    <span>Security & Password</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-[#063b2c] font-semibold flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block font-bold uppercase text-[10px] text-black/55 mb-1">
                        New Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="h-10 w-full rounded-xl border border-[#ded9cf] bg-[#faf8f3] px-3 font-semibold text-[#17221b] outline-none focus:border-[#063b2c] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase text-[10px] text-black/55 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="h-10 w-full rounded-xl border border-[#ded9cf] bg-[#faf8f3] px-3 font-semibold text-[#17221b] outline-none focus:border-[#063b2c] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] px-6 py-2.5 text-xs font-bold text-[#17221b] shadow-sm transition hover:bg-[#ede8dc] disabled:opacity-50"
                    >
                      <Lock size={14} />
                      <span>{isChangingPassword ? "Updating Password..." : "Change Password"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
