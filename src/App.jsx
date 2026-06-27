import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import RouteTransition from "./components/RouteTransition";
import FloatingNavbar from "./components/FloatingNav";

function App() {
  const location = useLocation();

  return (
    <>
      <RouteTransition>
        <AppRoutes />
      </RouteTransition>

      {location.pathname === "/" && <FloatingNavbar />}
    </>
  );
}

export default App;