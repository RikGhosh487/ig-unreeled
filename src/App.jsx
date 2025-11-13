import { useState } from "react";
import FileUpload from "./components/FileUpload";
import {
  OverviewCard,
  TopChattersCard,
  EngagementCard,
  RhythmRepliesCard,
} from "./components/cards";
import {
  handleFileUpload,
  handleFileDrop,
  handleDragOver,
} from "./utils/fileHandlers";

export default function App() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [variant] = useState("compact"); // "compact" or "story"

  const onSuccess = (data) => {
    setStats(data);
    setError("");
  };

  const onError = (errorMessage) => {
    setError(errorMessage);
  };

  if (!stats) {
    return (
      <FileUpload
        onFileUpload={(event) => handleFileUpload(event, onSuccess, onError)}
        error={error}
        onDrop={(event) => handleFileDrop(event, onSuccess, onError)}
        onDragOver={handleDragOver}
      />
    );
  }

  const cards = [
    <OverviewCard key="ov" data={stats} variant={variant} />,
    <TopChattersCard key="tc" data={stats} variant={variant} />,
    <EngagementCard key="eg" data={stats} variant={variant} />,
    <RhythmRepliesCard key="rr" data={stats} variant={variant} />,
  ];

  return (
    <div
      className={
        "min-h-screen bg-gradient-to-br from-purple-950 " +
        "via-pink-950 to-orange-950 p-6"
      }
    >
      <div className="max-w-2xl mx-auto grid grid-cols-1 gap-6">
        <div className="text-center text-white/90 mb-2">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Instagram Rewind
          </h2>
          <p className="opacity-80 text-sm mb-4">
            Shareable cards for your group chat rewind
          </p>

          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setStats(null)}
              className={
                "px-4 py-2 rounded-lg text-sm bg-white/10 " +
                "text-slate-400 hover:text-white transition-colors"
              }
            >
              Upload New File
            </button>
          </div>
        </div>
        {cards}
      </div>
    </div>
  );
}
