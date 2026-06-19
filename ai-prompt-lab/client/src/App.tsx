import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Libraries from './pages/Libraries';
import CollectionDetail from './pages/CollectionDetail';
import Bots from './pages/Bots';
import KeyPrompts from './pages/KeyPrompts';
import Board from './pages/Board';
import ToolsIndex from './pages/ToolsIndex';
import ClipartGrid from './tools/ClipartGrid';
import BulkRename from './tools/BulkRename';
import DpiConverter from './tools/DpiConverter';
import TrimResize from './tools/TrimResize';
import ListingPreview from './tools/ListingPreview';
import PatternChecker from './tools/PatternChecker';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="libraries" element={<Libraries />} />
        <Route path="libraries/:id" element={<CollectionDetail />} />
        <Route path="bots" element={<Bots />} />
        <Route path="keys" element={<KeyPrompts />} />
        <Route path="board" element={<Board />} />
        <Route path="tools" element={<ToolsIndex />} />
        <Route path="tools/clipart-grid" element={<ClipartGrid />} />
        <Route path="tools/bulk-rename" element={<BulkRename />} />
        <Route path="tools/dpi-converter" element={<DpiConverter />} />
        <Route path="tools/trim-resize" element={<TrimResize />} />
        <Route path="tools/listing-preview" element={<ListingPreview />} />
        <Route path="tools/pattern-checker" element={<PatternChecker />} />
      </Route>
    </Routes>
  );
}
