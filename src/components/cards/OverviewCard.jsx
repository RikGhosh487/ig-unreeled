import { useRef } from "react";
import { Crown, Heart } from "lucide-react";
import { Badge } from "../ui/badge";
import Wrapper from "../Wrapper";

function OverviewCard({ data }) {
  const cardRef = useRef(null);
  const topChatters = data.per_sender
    ? Object.entries(data.per_sender)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    : [];

  return (
    <Wrapper
      title={`${
        data.rewind_year || new Date().getFullYear()
      } in ${
        data.chat_title || "Chat"
      }`}
      icon={<Crown className="w-6 h-6 text-white" />}
      cardRef={cardRef}
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
          {data.total_messages?.toLocaleString()}
        </div>
        <div className="text-white/80 -mt-1">total messages</div>
        <div className="grid grid-cols-2 gap-3">
          <div
            className={
              "rounded-xl bg-white/10 p-4 ring-1 ring-white/20 " +
              "backdrop-blur-sm"
            }
          >
            <div className="text-2xl font-bold">
              {data.longest_streak_days || 0}
            </div>
            <div className="text-white/80 text-sm">
              longest streak (days)
            </div>
          </div>
          <div
            className={
              "rounded-xl bg-white/10 p-4 ring-1 ring-white/20 " +
              "backdrop-blur-sm"
            }
          >
            <div className="text-2xl font-bold">
              {data.busiest_dow?.[0]
                ? [
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                    "Sun",
                  ][data.busiest_dow[0][0]]
                : "—"}
            </div>
            <div className="text-white/80 text-sm">busiest day</div>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          {topChatters.map((p, i) => (
            <Badge
              key={p.name}
              className={
                "bg-white/15 hover:bg-white/25 text-white rounded-xl " +
                "px-3 py-1 text-xs backdrop-blur-sm"
              }
            >
              #{i + 1} {p.name} • {p.count}
            </Badge>
          ))}
        </div>
        
        {/* Most Reacted Message */}
        {data.most_reacted_message && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-medium text-white/60 tracking-wide">
              Most reacted message
            </div>
            <div className="flex items-start gap-2.5">
              <div
                className={
                  "flex-shrink-0 w-7 h-7 rounded-full bg-white/25 " +
                  "flex items-center justify-center text-xs font-bold text-white"
                }
              >
                {data.most_reacted_message.sender.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white mb-1">
                  {data.most_reacted_message.sender}
                </div>
                <div className="relative">
                  <div
                    className={
                      "relative rounded-3xl rounded-tl-none bg-white/20 " +
                      "backdrop-blur-sm px-4 py-2.5"
                    }
                  >
                    <div className="text-sm text-white/95 leading-relaxed">
                      {data.most_reacted_message.content.length > 120
                        ? data.most_reacted_message.content.substring(0, 120) +
                          "..."
                        : data.most_reacted_message.content}
                    </div>
                  </div>
                  <div
                    className={
                      "absolute -bottom-2 -right-1 flex items-center gap-1 " +
                      "px-2 py-1 rounded-full bg-pink-500/20 backdrop-blur-sm " +
                      "ring-2 ring-pink-500/30"
                    }
                  >
                    <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                    <span className="text-xs font-semibold text-white">
                      {data.most_reacted_message.reaction_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

export default OverviewCard;
