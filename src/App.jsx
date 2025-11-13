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
  const [processing, setProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onProgress = (message) => {
    // Could be used to show progress messages to user
    console.log("Progress:", message);
  };

  const onSuccess = (data) => {
    setProcessing(false);
    setUploadedFiles([]);

    // Check if this is raw Instagram data that needs processing
    if (data.type === "raw_instagram") {
      setError(
        "Raw Instagram processing not yet implemented. " +
          "Please upload a processed stats JSON file for now."
      );
      return;
    }

    // Handle processed stats data
    setStats(data);
    setError("");
  };

  const onError = (errorMessage) => {
    setProcessing(false);
    setUploadedFiles([]);
    setError(errorMessage);
  };

  const handleFileUploadWrapper = (event) => {
    setProcessing(true);
    setError("");

    const files = Array.from(event.target.files);
    setUploadedFiles(files.map((f) => f.name));

    handleFileUpload(event, onSuccess, onError, onProgress);
  };

  const handleFileDropWrapper = (event) => {
    setProcessing(true);
    setError("");

    const files = Array.from(event.dataTransfer.files);
    setUploadedFiles(files.map((f) => f.name));

    handleFileDrop(event, onSuccess, onError, onProgress);
  };

  if (!stats) {
    return (
      <FileUpload
        onFileUpload={handleFileUploadWrapper}
        error={error}
        onDrop={handleFileDropWrapper}
        onDragOver={handleDragOver}
        processing={processing}
        uploadedFiles={uploadedFiles}
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
              onClick={() => {
                setStats(null);
                setError("");
                setUploadedFiles([]);
                setProcessing(false);
              }}
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
