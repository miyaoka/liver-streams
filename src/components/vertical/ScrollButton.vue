<script setup lang="ts">
function scrollToCurrentTime() {
  const now = Date.now();
  const eventList = [...document.querySelectorAll("[data-event-time]")];
  const eventIndex = eventList.findIndex((el) => {
    const time = Number(el.getAttribute("data-event-time"));
    // 現在時刻を超える最初のイベントを探す
    if (time > now) return true;
  });
  // 現在時刻の直前のイベント
  const prevEvent = eventList[eventIndex - 1];

  if (prevEvent) {
    // イベントにスクロール
    prevEvent.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
</script>

<template>
  <button
    title="scroll to current time"
    class="fixed right-4 bottom-4 p-1 flex bg-white rounded shadow-md"
    @click="scrollToCurrentTime"
  >
    <i class="i-mdi-history w-8 h-8" />
  </button>
</template>
