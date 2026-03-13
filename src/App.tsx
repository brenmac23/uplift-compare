import { HashRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NavBar } from '@/components/NavBar';
import { SummaryPage } from '@/pages/SummaryPage';
import { DetailPage } from '@/pages/DetailPage';
import { PasswordGate } from '@/components/PasswordGate';

function App() {
  return (
    <PasswordGate>
      <HashRouter>
        <TooltipProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<SummaryPage />} />
            <Route path="/project/:id" element={<DetailPage />} />
          </Routes>
        </TooltipProvider>
      </HashRouter>
    </PasswordGate>
  );
}

export default App;
