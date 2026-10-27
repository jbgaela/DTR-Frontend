import { createContext, useContext, useEffect, type Dispatch, type ReactNode, type SetStateAction } from "react";

export type ConfirmationOptions = {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
};

type UnsavedContextValue = {
  dirty: boolean;
  setDirty: Dispatch<SetStateAction<boolean>>;
  requestConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
};

const UnsavedContext = createContext<UnsavedContextValue | null>(null);

export const UnsavedProvider = ({ value, children }: { value: UnsavedContextValue; children: ReactNode }) => (
  <UnsavedContext.Provider value={value}>{children}</UnsavedContext.Provider>
);

export const useUnsavedGuard = () => {
  const context = useContext(UnsavedContext);
  if (!context) throw new Error("useUnsavedGuard must be used inside UnsavedProvider");
  return context;
};

export const usePageDirty = (dirty: boolean) => {
  const { setDirty } = useUnsavedGuard();
  useEffect(() => {
    setDirty(dirty);
  }, [dirty, setDirty]);
  useEffect(() => () => setDirty(false), [setDirty]);
};
