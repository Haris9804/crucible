import AppRoutes from "./routes/AppRoutes";
import RouteTransition from "./components/RouteTransition";

function App() {
  return (
    <RouteTransition>
      <AppRoutes />
    </RouteTransition>
  );
}

export default App;
