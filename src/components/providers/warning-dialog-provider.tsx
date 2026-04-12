"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type WarningDialogOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type WarningDialogFn = (options: WarningDialogOptions) => Promise<boolean>;

const WarningDialogContext = createContext<WarningDialogFn | null>(null);

const defaultOptions: Required<Omit<WarningDialogOptions, "title">> = {
  description: "This action cannot be undone.",
  confirmLabel: "Continue",
  cancelLabel: "Cancel",
  destructive: false,
};

export function WarningDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<WarningDialogOptions>({
    title: "Are you sure?",
    ...defaultOptions,
  });

  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const resolveAndClose = useCallback((value: boolean) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    resolver?.(value);
  }, []);

  const confirm = useCallback<WarningDialogFn>(async (inputOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions({ ...defaultOptions, ...inputOptions });
      setOpen(true);
    });
  }, []);

  return (
    <WarningDialogContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && resolverRef.current) {
            resolveAndClose(false);
            return;
          }
          setOpen(nextOpen);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => resolveAndClose(false)}>
              {options.cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant={options.destructive ? "destructive" : "default"}
              onClick={() => resolveAndClose(true)}
            >
              {options.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </WarningDialogContext.Provider>
  );
}

export function useWarningDialog() {
  const context = useContext(WarningDialogContext);

  if (!context) {
    throw new Error("useWarningDialog must be used within WarningDialogProvider");
  }

  return context;
}
