import ReactDOM from 'react-dom/client'
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from "./store/setup";
import App from "./App";
import 'react-toastify/dist/ReactToastify.css';
import './index.scss' // after the library CSS, so the toast theme wins
import Loader from './components/shared/Loader/Loader';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Provider store={store}>
    <PersistGate loading={<Loader />} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);
