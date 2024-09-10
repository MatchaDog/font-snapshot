import { Route, Router } from "@solidjs/router";
import Home from "./pages";
import PreviewPage from "./pages/preview";

export const Routes = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/preview/:font" component={PreviewPage} />
    </Router>
  );
};
