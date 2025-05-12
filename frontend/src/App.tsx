import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Agents from './pages/Agents';
import Tools from './pages/Tools';
import Logs from './pages/Logs';
import Agent from './pages/Agent';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

// Theme
import theme from './theme';
import { Box } from '@mui/material';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="agents" element={<Agents />} />
              <Route path="agents/:id" element={<Agent />} />
              <Route path="tools" element={<Tools />} />
              <Route path="logs" element={<Logs />} />
              <Route path="settings" element={<Settings />} />
              <Route path="chat" element={<Chat />} />
            </Route>
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;