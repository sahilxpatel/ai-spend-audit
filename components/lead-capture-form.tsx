"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Briefcase, Users, User, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const leadSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  company: z.string().optional(),
  role: z.string().optional(),
  team_size: z.string().optional(),
  bot_field: z.string().optional(), // Honeypot
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadCaptureFormProps {
  auditId: string;
  onSuccess?: () => void;
}

export function LeadCaptureForm({ auditId, onSuccess }: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      bot_field: "", // Must be empty
    },
  });

  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setEmailWarning(null);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          audit_id: auditId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      const responseData = await response.json();

      if (responseData?.emailSent === false) {
        setEmailWarning("Your audit was saved, but we could not send the email. Please verify your email address or try again later.");
      }

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch {
      setError("There was a problem saving your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">You are all set!</h3>
        <p className="text-slate-600 mb-6 max-w-sm mx-auto">
          We have saved your audit results and sent a copy to your email address with your private link.
        </p>
        {emailWarning && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {emailWarning}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Save your audit results</h3>
        <p className="text-slate-600">Enter your details to get a private link and full summary emailed to you.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Honeypot field - visually hidden but accessible to bots */}
        <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
          <label htmlFor="bot_field">Do not fill this out if you are human</label>
          <input type="text" id="bot_field" {...register("bot_field")} tabIndex={-1} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">Work Email <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input 
              id="email" 
              type="email" 
              placeholder="you@company.com" 
              className="pl-10 h-12"
              {...register("email")}
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-slate-700">Company Name (optional)</Label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input 
              id="company" 
              placeholder="Acme Corp" 
              className="pl-10 h-12"
              {...register("company")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-700">Role</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input 
                id="role" 
                placeholder="CTO, Founder, etc." 
                className="pl-10 h-12"
                {...register("role")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="team_size" className="text-slate-700">Team Size</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input 
                id="team_size" 
                type="text"
                placeholder="e.g. 50" 
                className="pl-10 h-12"
                {...register("team_size")}
              />
            </div>
            {errors.team_size && <p className="text-red-500 text-sm mt-1">{errors.team_size.message}</p>}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 text-base mt-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving Results...
            </>
          ) : (
            "Save Audit & Get Results"
          )}
        </Button>
      </form>
    </div>
  );
}
