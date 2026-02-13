import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, GraduationCap, ChevronDown, Users, Loader2, UserX, Sparkles, MapPin, MessageSquare, Phone, Send, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface Mentor {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  xp_points: number;
}

const SearchMentors = () => {
  const { isAuthenticated } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingMentorId, setBookingMentorId] = useState<string | null>(null);
  const [dmMentorId, setDmMentorId] = useState<string | null>(null);
  const [dmMessage, setDmMessage] = useState("");
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/mentors');
      if (!res.ok) throw new Error('Failed to fetch mentors');
      const data = await res.json();
      setMentors(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load mentors.");
    } finally {
      setLoading(false);
    }
  };

  const bookCall = async (mentorId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to book a call");
      return;
    }
    setBookingMentorId(mentorId);
    try {
      const token = localStorage.getItem('koutuhal_token');
      const res = await fetch('/api/v1/mentors/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mentor_id: mentorId, session_type: "call", message: "I'd like to book a call with you." }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Booking failed');
      }
      toast.success("Call request sent! The mentor will be notified.");
      setSentRequests(prev => new Set(prev).add(mentorId));
    } catch (err: any) {
      toast.error(err.message || "Failed to book call");
    } finally {
      setBookingMentorId(null);
    }
  };

  const sendDM = async (mentorId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to send a message");
      return;
    }
    if (!dmMessage.trim()) {
      toast.error("Please type a message");
      return;
    }

    try {
      const token = localStorage.getItem('koutuhal_token');
      const res = await fetch('/api/v1/mentors/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mentor_id: mentorId, session_type: "dm", message: dmMessage }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to send message');
      }
      toast.success("Message sent to mentor!");
      setDmMentorId(null);
      setDmMessage("");
      setSentRequests(prev => new Set(prev).add(mentorId));
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    }
  };

  const filteredMentors = mentors.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-neutral-900 dark:bg-black text-white dark:text-slate-100 transition-colors duration-300">
      <div className="container mx-auto max-w-7xl px-4 pt-32 pb-12 text-center">
        <h1 className="text-4xl font-bold text-white mx-auto">
          Let's Find You The Perfect Near Peer
        </h1>
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto mb-8 px-4">
        <div className="bg-neutral-900 p-2 rounded-full shadow-lg border border-neutral-800 flex flex-col md:flex-row items-center gap-2">
          <div className="flex items-center gap-2 px-4 py-2 border-r border-neutral-800 w-full md:w-auto">
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Search By</p>
              <p className="text-sm font-bold text-[#ADFF44] flex items-center gap-1">
                Name / Bio <ChevronDown className="w-3 h-3" />
              </p>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <Input
              className="border-none shadow-none focus-visible:ring-0 text-base font-medium placeholder:text-neutral-400 h-10"
              placeholder="Search mentors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="rounded-full bg-[#ADFF44] hover:bg-[#9BE63D] text-black px-8 h-10 w-full md:w-auto text-base font-medium transition-all shadow-md hover:shadow-lg shadow-[#ADFF44]/20">
            Find Near Peers
          </Button>
        </div>
      </div>

      {/* Pill Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-12 px-4">
        {[
          { label: 'Workplace', icon: Briefcase },
          { label: 'College', icon: GraduationCap },
          { label: 'Name', icon: Users },
          { label: 'Industry', icon: Briefcase, active: true },
          { label: 'Function', icon: Sparkles },
          { label: 'Journey', icon: MapPin }
        ].map((filter) => (
          <button
            key={filter.label}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${filter.active
              ? 'bg-[#ADFF44]/5 border-[#ADFF44]/30 text-[#ADFF44] shadow-sm ring-2 ring-[#ADFF44]/20'
              : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:border-[#ADFF44]/30 hover:text-[#ADFF44] hover:bg-neutral-900'
              }`}
          >
            {filter.icon && <filter.icon className="w-4 h-4" />}
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-7xl px-4 pb-20">

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#ADFF44] animate-spin mb-4" />
            <p className="text-neutral-400">Loading mentors...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchMentors} className="bg-[#ADFF44] text-black">Retry</Button>
          </div>
        )}

        {!loading && !error && filteredMentors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
              <UserX className="w-10 h-10 text-neutral-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Mentors Available Yet</h2>
            <p className="text-neutral-400 max-w-md leading-relaxed">
              No mentors have joined the platform yet. As mentors sign up and set their role, they'll appear here. You can be the first — sign up as a Mentor!
            </p>
          </div>
        )}

        {!loading && !error && filteredMentors.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-xl font-bold text-neutral-300">Available Mentors</h2>
              <span className="bg-[#ADFF44] text-black text-xs font-bold px-3 py-1 rounded-full shadow-md shadow-[#ADFF44]/20">{filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMentors.map((mentor) => (
                <div key={mentor.id} className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 hover:border-[#ADFF44]/30 transition-all group relative">
                  {/* Sent badge */}
                  {sentRequests.has(mentor.id) && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Requested
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ADFF44]/20 to-neutral-800 flex items-center justify-center text-xl font-bold text-[#ADFF44] overflow-hidden border-2 border-neutral-700 group-hover:border-[#ADFF44]/50 transition-colors">
                      {mentor.avatar_url ? (
                        <img src={mentor.avatar_url} alt={mentor.name} className="w-full h-full object-cover" />
                      ) : (
                        mentor.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-[#ADFF44] transition-colors">{mentor.name}</h3>
                      <Badge variant="outline" className="border-[#ADFF44]/30 text-[#ADFF44] bg-[#ADFF44]/5 text-[10px]">
                        Mentor
                      </Badge>
                    </div>
                  </div>

                  {mentor.bio && (
                    <p className="text-neutral-400 text-sm line-clamp-2 mb-4">{mentor.bio}</p>
                  )}

                  {!mentor.bio && (
                    <p className="text-neutral-500 text-sm italic mb-4">Available for mentoring</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-neutral-500">{mentor.xp_points} XP</span>
                  </div>

                  {/* DM Input - Expandable */}
                  {dmMentorId === mentor.id && (
                    <div className="mb-3 space-y-2">
                      <Input
                        placeholder="Type your message..."
                        value={dmMessage}
                        onChange={(e) => setDmMessage(e.target.value)}
                        className="bg-neutral-800 border-neutral-700 text-white text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && sendDM(mentor.id)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-[#ADFF44] text-black text-xs h-8" onClick={() => sendDM(mentor.id)}>
                          <Send className="w-3 h-3 mr-1" /> Send
                        </Button>
                        <Button size="sm" variant="outline" className="border-white/10 text-neutral-400 text-xs h-8" onClick={() => { setDmMentorId(null); setDmMessage(""); }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-neutral-400 hover:text-[#ADFF44] hover:border-[#ADFF44]/30 h-9 text-xs"
                      onClick={() => {
                        if (dmMentorId === mentor.id) {
                          setDmMentorId(null);
                          setDmMessage("");
                        } else {
                          setDmMentorId(mentor.id);
                        }
                      }}
                      disabled={sentRequests.has(mentor.id)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" /> Send DM
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#ADFF44] text-black hover:bg-[#9BE63D] h-9 text-xs font-bold"
                      onClick={() => bookCall(mentor.id)}
                      disabled={bookingMentorId === mentor.id || sentRequests.has(mentor.id)}
                    >
                      {bookingMentorId === mentor.id ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Phone className="w-3 h-3 mr-1" />
                      )}
                      Book Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchMentors;
