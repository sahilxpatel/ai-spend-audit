"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Sparkles } from "lucide-react";

import { pricing } from "@/lib/pricing";
import { useLocalStorage } from "@/hooks/use-local-storage";


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const toolSchema = z.object({
  id: z.string(),
  toolId: z.string().min(1, "Please select a tool"),
  planId: z.string().min(1, "Please select a plan"),
  monthlySpend: z.coerce.number().min(0, "Spend must be non-negative"),
  seats: z.coerce.number().min(1, "Seats must be at least 1"),
});

const formSchema = z.object({
  globalTeamSize: z.coerce.number().min(1, "Team size must be at least 1"),
  primaryUseCase: z.enum(["coding", "writing", "design", "data-analysis", "general-chat", "research", "operations"] as const),
  tools: z.array(toolSchema).min(1, "Add at least one tool to audit"),
});

interface FormValues {
  globalTeamSize: number;
  primaryUseCase: "coding" | "writing" | "design" | "data-analysis" | "general-chat" | "research" | "operations";
  tools: { id: string; toolId: string; planId: string; monthlySpend: number; seats: number }[];
}

const defaultValues: FormValues = {
  globalTeamSize: 1,
  primaryUseCase: "coding",
  tools: [{ id: crypto.randomUUID(), toolId: "", planId: "", monthlySpend: 0, seats: 1 }],
};

export function SpendForm({ onAuditComplete }: { onAuditComplete?: (data: FormValues) => void }) {
  const [mounted, setMounted] = useState(false);
  const [savedData, setSavedData] = useLocalStorage<FormValues>("ai-spend-audit-form", defaultValues);

  const form = useForm<FormValues>({
    // zodResolver's inferred generic conflicts with react-hook-form's FieldValues constraint in
    // strict mode. The canonical fix is a double-cast through unknown.
    resolver: zodResolver(formSchema) as unknown as import("react-hook-form").Resolver<FormValues>,
    defaultValues: savedData,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "tools",
    control: form.control,
  });

  // Watch for changes to save to local storage
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Cast the value back to FormValues, making sure enum is valid.
      // We are just saving best effort state for the user to return to.
      if (value.globalTeamSize !== undefined && value.primaryUseCase) {
        setSavedData(value as FormValues);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  // Prevent hydration mismatch — restore saved data only once on mount
  useEffect(() => {
    setMounted(true);
    if (savedData) {
      form.reset(savedData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) {
    return <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  function onSubmit(data: FormValues) {
    if (onAuditComplete) {
      onAuditComplete(data);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-primary/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Audit Your AI Spend</CardTitle>
        </div>
        <CardDescription className="text-base">
          Enter your current AI tools, team size, and spend to see if you are overpaying or underutilizing.
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            
            {/* Global Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
              <FormField
                control={form.control}
                name="globalTeamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Total Team Size</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} className="bg-white dark:bg-slate-800" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryUseCase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300 font-semibold">Primary Use Case</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-slate-800">
                          <SelectValue placeholder="Select a use case" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="coding">Software Development</SelectItem>
                        <SelectItem value="writing">Content & Copywriting</SelectItem>
                        <SelectItem value="design">Design & Creative</SelectItem>
                        <SelectItem value="data-analysis">Data & Analytics</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="operations">Operations & Admin</SelectItem>
                        <SelectItem value="general-chat">General Chat</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tools Array */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your AI Tools</h3>
                <span className="text-sm text-slate-500 font-medium">{fields.length} tool{fields.length === 1 ? '' : 's'} added</span>
              </div>

              {fields.map((field, index) => {
                const selectedToolId = form.watch(`tools.${index}.toolId`);
                const availablePlans = selectedToolId && pricing[selectedToolId] 
                  ? Object.entries(pricing[selectedToolId].plans) 
                  : [];

                return (
                  <div key={field.id} className="relative p-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm transition-all hover:shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      
                      {/* Tool Select */}
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`tools.${index}.toolId`}
                          render={({ field: selectField }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tool</FormLabel>
                              <Select 
                                onValueChange={(val) => {
                                  selectField.onChange(val);
                                  // Reset plan when tool changes
                                  form.setValue(`tools.${index}.planId`, "");
                                }} 
                                defaultValue={selectField.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Tool" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(pricing).map(([id]) => (
                                    <SelectItem key={id} value={id}>
                                      {id.charAt(0).toUpperCase() + id.slice(1).replace('_', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Plan Select */}
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`tools.${index}.planId`}
                          render={({ field: selectField }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan</FormLabel>
                              <Select onValueChange={selectField.onChange} defaultValue={selectField.value} disabled={!selectedToolId}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Plan" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {availablePlans.map(([planId, planDetails]) => (
                                    <SelectItem key={planId} value={planId}>
                                      {planDetails.name} (${planDetails.price}/mo)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Monthly Spend Input */}
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`tools.${index}.monthlySpend`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Spend/mo ($)</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} step="0.01" {...inputField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Seats Input */}
                      <div className="md:col-span-2">
                        <FormField
                          control={form.control}
                          name={`tools.${index}.seats`}
                          render={({ field: inputField }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Seats</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} {...inputField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="md:col-span-2 flex items-end justify-end h-[68px]">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          aria-label={`Remove tool ${index + 1}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>

                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                className="w-full py-6 border-dashed border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                onClick={() => append({ id: crypto.randomUUID(), toolId: "", planId: "", monthlySpend: 0, seats: 1 })}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Another Tool
              </Button>

            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/50 dark:bg-slate-800/30 rounded-b-xl border-t border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
            <p className="text-sm text-slate-500">Your data is stored locally in your browser.</p>
            <Button type="submit" size="lg" className="px-8 font-semibold shadow-md">
              Generate Audit Report
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
