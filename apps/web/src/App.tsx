/**
 * アプリのエントリーポイント。ページは `/` の 1 つだけで、それ以外のパスで開かれたら URL のパスを `/` に置き換える。
 */
import { useEffect } from "react";
import LiverStreamsView from "./views/LiverStreamsView";

export default function App() {
  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL;
    if (location.pathname === baseUrl) return;
    // クエリとハッシュは残す
    history.replaceState(null, "", `${baseUrl}${location.search}${location.hash}`);
  }, []);

  return <LiverStreamsView />;
}
