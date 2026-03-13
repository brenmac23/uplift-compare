import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProjectListPage } from './pages/ProjectListPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ProjectListPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
