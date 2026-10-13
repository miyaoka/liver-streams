/**
 * Vue Router によるルーティングのエントリーポイント。
 */
import { defineVaporComponent } from "vue";
import { RouterView } from "vue-router";

export default defineVaporComponent(() => <RouterView />, { name: "App" });
