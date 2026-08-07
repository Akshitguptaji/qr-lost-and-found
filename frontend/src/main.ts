import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
// createApp(App).mount("#app");
const app = createApp(App);
app.use(router);
app.mount("#app");
//The mount command takes your entire Vue application and injects it right into that specific div.
