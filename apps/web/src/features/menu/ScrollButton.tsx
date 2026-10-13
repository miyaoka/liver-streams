/**
 * 現在時刻のセクションまでスクロールするボタン。一覧を遡って見た後に現在位置に戻るために使用する。
 */
import { scrollToCurrentTime } from "../../shared/lib";
import { useDateSectionList } from "../streams";

export default function ScrollButton() {
  const dateSectionList = useDateSectionList();

  return (
    <button
      title="scroll to current time"
      className="flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
      onClick={() => scrollToCurrentTime(dateSectionList)}
    >
      <i className="i-mdi-history size-8" />
    </button>
  );
}
