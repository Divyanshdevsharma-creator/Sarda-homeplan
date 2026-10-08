"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function getAdminInitials(name?: string | null): string {
  if (!name || !name.trim()) return "AD";
  const trimmed = name.trim();
  // Example requirement: Dinesh Kumar Sharma → DI
  return trimmed.slice(0, 2).toUpperCase();
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Avatar Photo States
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const hasAdminCookie =
        document.cookie.includes("sarada_admin_logged_in=true") ||
        document.cookie.includes("sarda_admin_logged_in=true");
      const hasAdminStorage =
        typeof window !== "undefined" &&
        (localStorage.getItem("sarada_admin_logged_in") === "true" ||
          localStorage.getItem("sarda_admin_logged_in") === "true");

      if (!hasAdminCookie && !hasAdminStorage) {
        router.push("/admin/login");
        return;
      }

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

        let currentAvatar = "";
        if (adminRecord) {
          setAdmin(adminRecord);
          setFullName(adminRecord.full_name || "Admin Office");
          setEmail(adminRecord.email || adminEmail);
          setMobile(adminRecord.mobile || "9876543210");
          setRole(adminRecord.role || "Super Admin");
          if (adminRecord.avatar_url) {
            currentAvatar = adminRecord.avatar_url;
          } else if (typeof window !== "undefined") {
            currentAvatar =
              localStorage.getItem(`sarada_admin_avatar_${adminRecord.id}`) ||
              localStorage.getItem(`sarada_admin_avatar_${adminRecord.email}`) ||
              localStorage.getItem("sarada_admin_avatar") ||
              "";
          }
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
            if (firstAdmin.avatar_url) {
              currentAvatar = firstAdmin.avatar_url;
            } else if (typeof window !== "undefined") {
              currentAvatar =
                localStorage.getItem(`sarada_admin_avatar_${firstAdmin.id}`) ||
                localStorage.getItem(`sarada_admin_avatar_${firstAdmin.email}`) ||
                localStorage.getItem("sarada_admin_avatar") ||
                "";
            }
          }
        }

        if (currentAvatar) {
          setAvatarUrl(currentAvatar);
        }
      } catch (err: any) {
        console.error("Error loading admin profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminProfile();
  }, [supabase]);

  // Handle Avatar Selection & Upload
  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so selecting the same file triggers onChange
    e.target.value = "";

    setErrorMessage("");
    setSuccessMessage("");

    // Validation: Supported formats: JPG, JPEG, PNG, WEBP
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const isAllowedExt = fileExt && ["jpg", "jpeg", "png", "webp"].includes(fileExt);

    if (!allowedTypes.includes(file.type) && !isAllowedExt) {
      setErrorMessage("Supported formats: JPG, JPEG, PNG, WEBP.");
      setAvatarStatus("Error: Unsupported format");
      return;
    }

    // Validation: Size limit Max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`Image size must be less than 5MB (selected file is ${sizeInMB}MB).`);
      setAvatarStatus("Error: Exceeds 5MB limit");
      return;
    }

    setUploadingAvatar(true);
    setAvatarStatus("Uploading...");

    try {
      let finalAvatarUrl = "";

      // 1. Attempt upload to Supabase Storage bucket 'avatars'
      try {
        const ext = fileExt || "jpg";
        const fileName = `admin_${admin?.id || "profile"}_${Date.now()}.${ext}`;
        const filePath = `avatars/${fileName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true, contentType: file.type || "image/jpeg" });

        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
          if (urlData?.publicUrl) {
            finalAvatarUrl = urlData.publicUrl;
          }
        }
      } catch (storageErr) {
        console.warn("Storage bucket upload fallback to local format:", storageErr);
      }

      // 2. If storage bucket is not configured, generate an optimized DataURL via Canvas
      if (!finalAvatarUrl) {
        finalAvatarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const maxDim = 400;
              let w = img.width;
              let h = img.height;
              if (w > maxDim || h > maxDim) {
                if (w > h) {
                  h = Math.round((h * maxDim) / w);
                  w = maxDim;
                } else {
                  w = Math.round((w * maxDim) / h);
                  h = maxDim;
                }
              }
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL("image/jpeg", 0.88));
            };
            img.onerror = () => resolve(event.target?.result as string);
            img.src = event.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // 3. Saving state
      setAvatarStatus("Saving...");

      // Attempt DB update in admins table if column exists
      if (admin?.id) {
        try {
          await supabase
            .from("admins")
            .update({ avatar_url: finalAvatarUrl })
            .eq("id", admin.id);
        } catch (_) {}
      }

      // Persist in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("sarada_admin_avatar", finalAvatarUrl);
        if (admin?.id) {
          localStorage.setItem(`sarada_admin_avatar_${admin.id}`, finalAvatarUrl);
        }
        if (admin?.email) {
          localStorage.setItem(`sarada_admin_avatar_${admin.email}`, finalAvatarUrl);
        }
        window.dispatchEvent(new Event("admin_avatar_updated"));
      }

      setAvatarUrl(finalAvatarUrl);
      setAvatarStatus("Saved successfully");
      setSuccessMessage("Profile photo saved successfully!");
      setTimeout(() => setAvatarStatus(""), 4000);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setErrorMessage(err?.message || "Failed to upload profile photo.");
      setAvatarStatus("Error: Upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Remove Avatar Photo
  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    setAvatarStatus("Saving...");
    try {
      if (admin?.id) {
        try {
          await supabase.from("admins").update({ avatar_url: null }).eq("id", admin.id);
        } catch (_) {}
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("sarada_admin_avatar");
        if (admin?.id) localStorage.removeItem(`sarada_admin_avatar_${admin.id}`);
        if (admin?.email) localStorage.removeItem(`sarada_admin_avatar_${admin.email}`);
        window.dispatchEvent(new Event("admin_avatar_updated"));
      }
      setAvatarUrl("");
      setAvatarStatus("Saved successfully");
      setSuccessMessage("Profile photo removed.");
      setTimeout(() => setAvatarStatus(""), 4000);
    } catch (err: any) {
      setErrorMessage("Failed to remove profile photo.");
      setAvatarStatus("Error");
    } finally {
      setUploadingAvatar(false);
    }
  };

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
      window.location.href = "/";
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
              className="flex items-center gap-2 group mr-1"
              aria-label="Back to Admin Dashboard"
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-sm transition group-hover:scale-105 border border-[#d9b45a]/30">
                <Image
                  src="/sarda-logo.png"
                  alt="Sarda Homeplan"
                  width={72}
                  height={72}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded9cf] bg-[#f8f5ee] px-3.5 py-1.5 text-xs font-bold text-[#17221b] transition hover:bg-[#ede8dc]"
            >
              <ArrowLeft size={15} />
              <span>Dashboard</span>
            </Link>

            <span className="text-black/30">/</span>

            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[#063b2c] bg-[#063b2c] flex items-center justify-center text-[#f4cf72] text-xs font-bold font-serif shadow-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName || "Admin Profile"}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <span>{getAdminInitials(fullName)}</span>
                )}
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
                {/* Circular Profile Photo with Camera / Edit Button */}
                <div className="relative mx-auto h-28 w-28 group">
                  <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#063b2c] shadow-md bg-[#063b2c] flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={fullName || "Admin Profile"}
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="font-serif text-3xl font-bold text-[#f4cf72]">
                        {getAdminInitials(fullName)}
                      </span>
                    )}
                  </div>

                  {/* Camera / Edit Icon Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#f4cf72] text-[#063b2c] shadow-md transition hover:scale-110 hover:bg-[#ffe39c] border-2 border-white disabled:opacity-60 cursor-pointer"
                    title="Upload or change profile photo"
                    aria-label="Upload or change profile photo"
                  >
                    <Camera size={16} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={handleAvatarFileSelect}
                  />
                </div>

                {/* Upload Status / Actions */}
                <div className="mt-3 flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#063b2c] hover:text-[#0c7a62] transition cursor-pointer"
                  >
                    <Camera size={13} />
                    <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-700 transition cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  )}

                  {avatarStatus && (
                    <div
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        avatarStatus.includes("Error") || avatarStatus.includes("Failed")
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : avatarStatus.includes("Saved")
                          ? "bg-[#eaf5ed] text-[#0c7a62] border border-[#cbe1d1]"
                          : "bg-[#faf8f3] text-[#9b7732] border border-[#e4dfd5]"
                      }`}
                    >
                      {uploadingAvatar && <RefreshCw size={11} className="animate-spin" />}
                      {avatarStatus.includes("Saved") && <CheckCircle2 size={11} />}
                      <span>{avatarStatus}</span>
                    </div>
                  )}
                </div>

                <h2 className="mt-3 font-serif text-xl font-bold text-[#17221b]">
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
