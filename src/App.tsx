import { useEffect, useState, type ReactNode } from "react";
import { hasSaveError, useAppState, useToday } from "./lib/store";
import { isOnboarded } from "./lib/store-core";
import { Library } from "./screens/Library";
import { Onboarding } from "./screens/Onboarding";
import { SetPoint } from "./screens/SetPoint";
import { Today } from "./screens/Today";

type Tab = "today" | "setpoint" | "library";

const TAB_KEY = "setpoint.tab";

function readTab(): Tab {
  try {
    const t = sessionStorage.getItem(TAB_KEY);
    if (t === "today" || t === "setpoint" || t === "library") return t;
  } catch {
    /* ignore */
  }
  return "today";
}

export function App() {
  const state = useAppState();
  const today = useToday();
  const [tab, setTab] = useState<Tab>(readTab);

  useEffect(() => {
    try {
      sessionStorage.setItem(TAB_KEY, tab);
    } catch {
      /* ignore */
    }
    window.scrollTo(0, 0);
  }, [tab]);

  if (!isOnboarded(state)) return <Onboarding />;

  return (
    <div className="app">
      {hasSaveError() && <p className="banner" style={{ margin: 12 }}>Couldn't save on this device. Free up some storage, then try again.</p>}
      {tab === "today" && <Today state={state} today={today} />}
      {tab === "setpoint" && <SetPoint state={state} today={today} />}
      {tab === "library" && <Library state={state} />}
      <nav className="tabbar" aria-label="Main">
        <div className="tabbar-inner">
          <TabButton id="today" label="Today" tab={tab} setTab={setTab}>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M8.5 12.2l2.4 2.4 4.6-5" />
          </TabButton>
          <TabButton id="setpoint" label="Set Point" tab={tab} setTab={setTab}>
            <path d="M3.5 18.5h17" />
            <path d="M4.5 14.5l4.5-4 4 3 6.5-6.5" />
          </TabButton>
          <TabButton id="library" label="Library" tab={tab} setTab={setTab}>
            <path d="M5 4.5h4v15H5zM10.5 4.5h4v15h-4z" />
            <path d="M16.2 5.2l3.7-1 3 14.3-3.7 1z" transform="translate(-2 0.5)" />
          </TabButton>
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  id,
  label,
  tab,
  setTab,
  children,
}: {
  id: Tab;
  label: string;
  tab: Tab;
  setTab: (t: Tab) => void;
  children: ReactNode;
}) {
  const on = tab === id;
  return (
    <button className={`tab${on ? " on" : ""}`} onClick={() => setTab(id)} aria-current={on ? "page" : undefined}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
      {label}
    </button>
  );
}
