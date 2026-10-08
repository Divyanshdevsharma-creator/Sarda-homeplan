"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Users, Phone, MapPin, Check, X, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface CustomerProfileItem {
  id: string;
  full_name: string | null;
  mobile: string | null;
  village_city: string | null;
  district: string | null;
  state?: string | null;
  created_at?: string;
}

interface CustomerSelectorProps {
  onSelect: (customer: CustomerProfileItem) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  initialCustomers?: CustomerProfileItem[];
}

export default function CustomerSelector({
  onSelect,
  onCancel,
  title = "Select Customer",
  description = "Choose a verified customer to continue with this action.",
  initialCustomers = [],
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<CustomerProfileItem[]>(initialCustomers || []);
  const [loading, setLoading] = useState(initialCustomers.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCustomers() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("customer_profiles")
          .select("id, full_name, mobile, village_city, district, created_at")
          .order("created_at", { ascending: false });

        if (!error && data && isMounted) {
          setCustomers(data);
        }
      } catch (err) {
        console.error("Error loading customers for CustomerSelector:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCustomers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (initialCustomers && initialCustomers.length > 0 && customers.length === 0) {
      setCustomers(initialCustomers);
      setLoading(false);
    }
  }, [initialCustomers, customers.length]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((c) => {
      const name = c.full_name?.toLowerCase() || "";
      const mobile = c.mobile?.replace(/\D/g, "") || "";
      const village = c.village_city?.toLowerCase() || "";
      const district = c.district?.toLowerCase() || "";
      return name.includes(q) || mobile.includes(q) || village.includes(q) || district.includes(q);
    });
  }, [customers, searchQuery]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-[#ded9cf] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e4dfd5] bg-[#faf8f3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063b2c] text-[#f4cf72]">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#17221b]">{title}</h3>
              <p className="text-xs text-black/55">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ded9cf] text-black/60 hover:bg-[#ede8dc] transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="border-b border-[#e4dfd5] p-4 bg-white">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer by name, mobile, village, or district..."
              className="h-11 w-full rounded-xl border border-[#ded9cf] bg-[#faf8f3] pl-10 pr-4 text-xs font-medium text-[#17221b] outline-none transition focus:border-[#063b2c] focus:bg-white focus:ring-1 focus:ring-[#063b2c]"
            />
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-black/50">
              <RefreshCw size={24} className="mx-auto animate-spin text-[#063b2c] mb-2" />
              Loading verified customers from database...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="py-12 text-center text-xs text-black/50">
              No registered customer found matching &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filteredCustomers.map((c) => {
              const isSelected = selectedId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition ${
                    isSelected
                      ? "border-[#063b2c] bg-[#eef5ee] shadow-sm"
                      : "border-[#ded9cf] bg-[#faf8f3] hover:border-[#bda76d] hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full font-serif font-bold text-sm ${
                        isSelected ? "bg-[#063b2c] text-[#f4cf72]" : "bg-[#ded9cf] text-[#17221b]"
                      }`}
                    >
                      {c.full_name ? c.full_name.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#17221b]">
                        {c.full_name || "Registered Customer"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-black/60">
                        <span className="flex items-center gap-1 font-semibold text-[#17221b]">
                          <Phone size={11} className="text-[#063b2c]" />
                          {c.mobile || "No mobile"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-[#063b2c]" />
                          {c.village_city || "-"}, {c.district || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(c);
                    }}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                      isSelected
                        ? "bg-[#063b2c] text-[#f4cf72]"
                        : "bg-white border border-[#ded9cf] text-[#17221b] hover:bg-[#063b2c] hover:text-[#f4cf72]"
                    }`}
                  >
                    Select
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#e4dfd5] bg-[#faf8f3] px-6 py-4">
          <p className="text-xs text-black/50">
            {filteredCustomers.length} Customer{filteredCustomers.length === 1 ? "" : "s"} listed
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-[#ded9cf] bg-white px-4 py-2 text-xs font-semibold text-black/70 hover:bg-[#ede8dc] transition"
            >
              Cancel
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={() => {
                  const cust = customers.find((c) => c.id === selectedId);
                  if (cust) onSelect(cust);
                }}
                className="rounded-xl bg-[#063b2c] px-5 py-2 text-xs font-bold text-[#f4cf72] shadow-sm hover:bg-[#0a4d38] transition"
              >
                Confirm Customer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
