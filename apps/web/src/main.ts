import "./assets/main.css";

import { createPinia } from "pinia";
import { createApp, vaporInteropPlugin } from "vue";

import App from "./App";
import router from "./router";

const app = createApp(App);

app.use(vaporInteropPlugin);
app.use(createPinia());
app.use(router);

app.mount("#app");
