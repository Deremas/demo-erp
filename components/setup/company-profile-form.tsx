"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Building2, Save, Mail, Phone, MapPin, Hash, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateCompanySettingsAction } from "@/lib/actions/company";

type Settings = {
  name: string;
  tin: string;
  address: string;
  phone: string;
  email: string | null;
  currencySymbol: string;
  weeklyBackupEnabled: boolean;
};

export function CompanyProfileForm({ initialSettings }: { initialSettings: Settings }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    ...initialSettings,
    email: initialSettings.email ?? "",
    weeklyBackupEnabled: !!initialSettings.weeklyBackupEnabled,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateCompanySettingsAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-black">Company Profile</CardTitle>
            <CardDescription>Official business identity for invoices and tax filings.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Legal Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Demo ERP"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Tax Identification Number (TIN)</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  value={formData.tin}
                  onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                  placeholder="0012345678"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Business Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Addis Ababa, Ethiopia"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+251 911 000 000"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@rungo.com"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Currency</Label>
                <Input 
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                  placeholder="ETB"
                  className="h-11 rounded-xl border-slate-200 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="md:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-black text-slate-700">Weekly Auto-Backup</Label>
                <p className="text-xs text-slate-500 font-medium italic">Trigger a full system snapshot every 7 days automatically.</p>
              </div>
              <input 
                type="checkbox"
                checked={formData.weeklyBackupEnabled}
                onChange={(e) => setFormData({ ...formData, weeklyBackupEnabled: e.target.checked })}
                className="h-6 w-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-2xl shadow-xl transition-all hover:scale-[1.02]"
            >
              {isPending ? "Saving..." : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}