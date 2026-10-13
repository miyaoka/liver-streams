/**
 * ローディングスピナー。サイズ（sm/md/lg）とメッセージを指定可能。
 */
import { defineComponent } from "vue";

type Props = {
  size?: "sm" | "md" | "lg";
  message?: string;
};

export default defineComponent(
  (props: Props) => {
    return () => (
      <div class="flex flex-col items-center justify-center gap-3">
        <i
          class={[
            "i-mdi-loading animate-spin",
            {
              "size-8": props.size === "sm",
              "size-12": props.size === "md" || !props.size,
              "size-16": props.size === "lg",
            },
          ]}
        />
        {props.message && <p class="text-sm font-medium">{props.message}</p>}
      </div>
    );
  },
  { name: "LoadingSpinner", props: ["size", "message"] },
);
