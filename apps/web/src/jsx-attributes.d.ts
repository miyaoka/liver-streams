// Vue の JSX 型には Popover API の属性が無いため追加する
import "vue";

declare module "vue" {
  interface ButtonHTMLAttributes {
    popovertarget?: string;
    popovertargetaction?: "hide" | "show" | "toggle";
  }
}
