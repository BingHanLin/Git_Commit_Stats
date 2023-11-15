import React from "react";
import ReactDOM from "react-dom/client";
import { MemoryRouter } from "react-router-dom";

import { Provider } from "react-redux";
import { store } from "./store";

import App from "./App";
import "./styles.css";

import * as buffer from "buffer";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <Provider store={store}>
        <React.StrictMode>
            <MemoryRouter>
                <App />
            </MemoryRouter>
        </React.StrictMode>
    </Provider>
);
