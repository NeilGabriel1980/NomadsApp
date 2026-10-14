import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Shell } from './components/layout/Shell';
import { SeasonProvider } from './context/SeasonContext';

import Home from './pages/Home';
import Matches from './pages/Matches';
import Fixtures from './pages/Fixtures';
import Leaderboards from './pages/Leaderboards';
import Squad from './pages/Squad';
import PlayerLookup from './pages/PlayerLookup';
import Records from './pages/Records';
import MatchReports from './pages/MatchReports';
import SeasonEditor from './pages/SeasonEditor';
import NotFound from './pages/not-found';

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/matches" component={Matches} />
        <Route path="/fixtures" component={Fixtures} />
        <Route path="/leaderboards" component={Leaderboards} />
        <Route path="/squad" component={Squad} />
        <Route path="/player-lookup" component={PlayerLookup} />
        <Route path="/records" component={Records} />
        <Route path="/reports" component={MatchReports} />
        <Route path="/editor" component={SeasonEditor} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SeasonProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </SeasonProvider>
    </QueryClientProvider>
  );
}

export default App;
