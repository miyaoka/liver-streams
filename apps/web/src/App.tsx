/**
 * Vue Router によるルーティングのエントリーポイント。
 */
import { defineComponent } from "vue";
import { RouterView } from "vue-router";

export default defineComponent(() => () => <RouterView />, { name: "App" });
