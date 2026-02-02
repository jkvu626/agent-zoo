import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ZooView } from "./components/zoo/ZooView";
import { AgentView } from "./components/agent-view/AgentView";
import { SkillsTreeView } from "./components/skills/SkillsTreeView";
import { BrainTimelineView } from "./components/brain/BrainTimelineView";

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<ZooView />} />
          <Route path="/agent/:id" element={<AgentView />} />
          <Route path="/agent/:id/brain" element={<BrainTimelineView />} />
          <Route path="/agent/:id/skills" element={<SkillsTreeView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
