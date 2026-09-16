"use client";

import { Globe, MapPin, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LocationOption } from "@/lib/types";
import { useState, useEffect } from "react";
import { MultiSelect } from "@/components/ui/multi-select";

interface DashboardHeroProps {
  userName: string;
  activeBranchName?: string | undefined;
  lastUpdated: string;
  role: string;
  locations: LocationOption[];
}

export function DashboardHero({
  userName,
  activeBranchName,
  role,
  locations,
}: DashboardHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setIsMounted(true);
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hour = isMounted ? time.getHours() : 0;
  const greeting = !isMounted 
    ? "Welcome" 
    : hour < 12 
      ? "Good Morning" 
      : hour < 18 
        ? "Good Afternoon" 
        : "Good Evening";

  const formattedTime = isMounted 
    ? time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "--:--:-- --";

  const isAdmin = role === "ADMIN";
  const selectedLocation = searchParams.get("locationId") || "";
  const selectedIds = selectedLocation ? selectedLocation.split(",") : [];

  const handleLocationsChange = (ids: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (ids.length > 0) {
      params.set("locationId", ids.join(","));
    } else {
      params.delete("locationId");
      params.delete("branchId");
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,hsl(var(--brand-navy)),hsl(220_70%_18%)_52%,hsl(var(--brand-blue)))] px-7 py-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
      {/* Mesh background effect */}
      <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500 blur-[80px]" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500 blur-[80px]" />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        {/* Greeting */}
        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {greeting},{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {userName}
          </span>
        </h1>

        {/* Compact meta */}
        <div className="flex items-center gap-5 text-slate-400">
          {/* Location */}
          <div className="flex items-center gap-1.5">
            {isAdmin && selectedIds.length === 0 ? (
              <Globe className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            ) : (
              <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            )}
            {isAdmin ? (
              <div className="min-w-[140px]">
                <MultiSelect
                  placeholder="All Locations"
                  options={locations.map(l => ({ label: l.name, value: l.id }))}
                  selected={selectedIds}
                  onChange={handleLocationsChange}
                  className="h-8 min-h-[32px] border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all py-0 px-2"
                />
              </div>
            ) : (
              <span className="text-xs font-semibold text-slate-300">
                {activeBranchName || "Central Store"}
              </span>
            )}
          </div>

          {/* Divider */}
          <span className="h-4 w-px bg-slate-700" />

          {/* Clock */}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-xs font-semibold tabular-nums text-slate-300">
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}