import { useRef } from "react";
import { User, Clock, TrendingUp, Heart, Zap } from "lucide-react";
import Wrapper from "../Wrapper";

function PersonalCard({ data, isStoriesMode = false }) {
  const cardRef = useRef(null);
  
  if (!data.account_owner || !data.personal_stats) {
    return null;
  }
  
  const personal = data.personal_stats;
  
  // Get top 3 quickest and slowest response times
  const responseTimes = Object.entries(personal.your_response_times || {});
  const quickest = responseTimes
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3);
  const slowest = responseTimes
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  const formatHour = (hour) => {
    const h = hour % 12 || 12;
    const period = hour < 12 ? 'AM' : 'PM';
    return `${h}:00 ${period}`;
  };
  
  const formatTime = (minutes) => {
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours < 24) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  return (
    <Wrapper
      title="Your Stats"
      icon={<User className="w-6 h-6 text-white" />}
      cardRef={cardRef}
      isStoriesMode={isStoriesMode}
    >
      <div className="grid grid-cols-1 gap-3">
        {/* Best Friend */}
        {personal.best_friend && (
          <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="text-slate-300 text-xs mb-1">your best friend</div>
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold text-white">
                {personal.best_friend.name}
              </div>
              <Heart className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-xs text-white/50 mt-0.5">
              Most reactions & messages exchanged
            </div>
          </div>
        )}
        
        {/* Activity Comparison, Most Received Emoji & Peak Hour */}
        <div className="grid grid-cols-2 gap-3">
          {/* Activity Section - spans 2 rows */}
          <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10 row-span-2">
            <div className="text-slate-300 text-xs mb-2">your activity</div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs text-white/80">Rank</span>
              </div>
              <span className="text-lg font-bold text-white">
                #{personal.your_rank}
              </span>
            </div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-white/80">Messages</span>
              <span className="text-base font-semibold text-white">
                {personal.your_message_count?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/80">Level</span>
              <span className="text-xs font-semibold text-purple-400">
                {personal.your_activity_level}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-white/50 mb-1">
                {personal.your_percentage?.toFixed(1)}% of all messages
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                  style={{ width: `${Math.min(100, personal.your_percentage)}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Most Received Emoji - first row, second column */}
          {personal.your_most_received_emoji && (
            <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="text-slate-300 text-xs mb-1">
                most received
              </div>
              <div className="text-2xl mb-0.5">
                {personal.your_most_received_emoji.emoji}
              </div>
              <div className="text-sm font-bold text-white">
                {personal.your_most_received_emoji.count} times
              </div>
              <div className="text-xs text-white/50 mt-0.5">
                mostly from {personal.your_most_received_emoji.top_reactor}
              </div>
            </div>
          )}
          
          {/* Peak Hour - second row, second column */}
          {personal.your_active_hour !== null && personal.your_active_hour !== undefined && (
            <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <div className="text-slate-300 text-xs mb-1">peak hour</div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="text-xl font-bold text-white">
                  {formatHour(personal.your_active_hour)}
                </div>
              </div>
              <div className="text-xs text-white/50">
                Most active time
              </div>
            </div>
          )}
        </div>
        
        {/* Response Times */}
        {responseTimes.length > 0 && (
          <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <div className="text-slate-300 text-xs mb-2">your response times</div>
            <div className="grid grid-cols-2 gap-3">
              {quickest.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Zap className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-white/70">Quickest</span>
                  </div>
                  {quickest.map(([name, time]) => (
                    <div key={name} className="mb-1.5">
                      <div className="text-sm text-white font-medium truncate">
                        {name}
                      </div>
                      <div className="text-xs text-white/50">
                        {formatTime(time)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {slowest.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Clock className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-white/70">Slowest</span>
                  </div>
                  {slowest.map(([name, time]) => (
                    <div key={name} className="mb-1.5">
                      <div className="text-sm text-white font-medium truncate">
                        {name}
                      </div>
                      <div className="text-xs text-white/50">
                        {formatTime(time)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

export default PersonalCard;
