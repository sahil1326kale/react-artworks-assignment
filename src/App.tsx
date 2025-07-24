import ArtworksTable from "./components/ArtworksTable";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const App = () => (
  <div className="App" style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
    <ArtworksTable />
  </div>
);

export default App;
