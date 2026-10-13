/**
 * usePopover の control で開閉する Popover API の要素。mountAtOpen なら開いている間だけ中身をマウントする。
 */
import type { ReactNode } from "react";
import type { PopoverControl } from "./usePopover";

interface Props {
  control: PopoverControl;
  className?: string;
  children?: ReactNode;
}

export default function Popover({ control, className, children }: Props) {
  const { setPopoverElement, popoverId, mountAtOpen, isShow } = control;
  const isMountable = !mountAtOpen || isShow;
  return (
    <div ref={setPopoverElement} id={popoverId} popover="" className={className}>
      {isMountable ? children : null}
    </div>
  );
}
