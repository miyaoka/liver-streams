// vue-jsx-vapor の JSX 型には Popover API の属性が無いため追加する
import "vue-jsx-vapor";

declare module "vue-jsx-vapor" {
  interface ButtonHTMLAttributes<T> {
    popovertarget?: string;
    popovertargetaction?: "hide" | "show" | "toggle";
  }
}
