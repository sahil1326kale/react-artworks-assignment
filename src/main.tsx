import React from"react";
import ReactDOM from"react-dom/client";
import App from"./App.tsx";
import"primereact/resources/themes/lara-light-indigo/theme.css";
import"primereact/resources/primereact.min.css";
import"primeicons/primeicons.css";
import"./index.css";
import{PrimeReactProvider} from'primereact/api';

ReactDOM.createRoot(document.getElementById("root")as HTMLElement).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <App/>
    </PrimeReactProvider>
  </React.StrictMode>
);
