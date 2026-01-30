import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TooltipProvider } from "../ui/Tooltip";

type LayoutContextValue = {
  isSoulOpen: boolean;
  setSoulOpen: (next: boolean) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayoutState() {
  const value = useContext(LayoutContext);
  if (!value) {
    throw new Error("useLayoutState must be used within AppShell");
  }
  return value;
}

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const [isSoulOpen, setSoulOpen] = useState(false);

  const agentMatch = matchPath({ path: "/agent/:id" }, location.pathname);
  const skillsMatch = matchPath(
    { path: "/agent/:id/skills" },
    location.pathname,
  );

  const currentAgentId = agentMatch?.params?.id ?? null;
  const isAgentView = Boolean(agentMatch) && !skillsMatch;

  const layoutValue = useMemo(
    () => ({ isSoulOpen, setSoulOpen }),
    [isSoulOpen],
  );

  return (
    <LayoutContext.Provider value={layoutValue}>
      <TooltipProvider>
        <div className="h-screen bg-bg-app text-text-primary flex flex-col">
          <Header />
          <div className="flex flex-1 min-h-0 gap-4 p-panel overflow-hidden">
            <LeftSidebar />
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {children}
            </main>
            <RightSidebar
              isOpen={isAgentView && isSoulOpen}
              agentId={currentAgentId}
            />
          </div>
        </div>
      </TooltipProvider>
    </LayoutContext.Provider>
  );
}
