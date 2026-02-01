export function closePopover(evt: MouseEvent) {
  const target = evt.target as HTMLElement;
  const popover = target.closest("[popover]") as HTMLElement;
  popover?.hidePopover();
}
