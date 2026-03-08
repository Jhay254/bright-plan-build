import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { detectCrisisLanguage } from "@/lib/safety";
import { insertCrisisFlag } from "@/lib/crisis-flags";
import CrisisBanner from "./CrisisBanner";
import SessionFeedback from "./SessionFeedback";
import type { Database } from "@/integrations/supabase/types";

type Session = Database["public"]["Tables"]["cocoon_sessions"]["Row"];
type Message = Database["public"]["Tables"]["session_messages"]["Row"];
type SessionStatus = Database["public"]["Enums"]["session_status"];

const STATUS_LABELS: Record<SessionStatus, { label: string; color: string }> = {
  requested: { label: "Waiting for volunteer", color: "text-sunlight" },
  matched: { label: "Volunteer matched — ready to begin", color: "text-fern" },
  active: { label: "Session active", color: "text-forest" },
  wrap_up: { label: "Wrapping up", color: "text-ember" },
  closed: { label: "Session ended", color: "text-driftwood" },
  cancelled: { label: "Cancelled", color: "text-care-alert" },
};

const ChatRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [volunteerCrisisAlert, setVolunteerCrisisAlert] = useState(false);
  const [participantAliases, setParticipantAliases] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch session and messages
  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      const { data } = await supabase
        .from("cocoon_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (data) setSession(data);
    };

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("session_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };

    fetchSession();
    fetchMessages();
  }, [sessionId]);

  // Fetch participant aliases
  useEffect(() => {
    if (!session) return;
    const ids = [session.seeker_id, session.volunteer_id].filter(Boolean) as string[];
    if (ids.length === 0) return;

    const fetchAliases = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, alias")
        .in("user_id", ids);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((p) => (map[p.user_id] = p.alias));
        setParticipantAliases(map);
      }
    };
    fetchAliases();
  }, [session?.seeker_id, session?.volunteer_id]);

  // Realtime messages subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`messages-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Realtime session status subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cocoon_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          setSession(payload.new as Session);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to crisis flags for volunteer alerts
  useEffect(() => {
    if (!sessionId || !user) return;

    const channel = supabase
      .channel(`crisis-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "crisis_flags",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          // Show alert to volunteer (the seeker already sees the CrisisBanner)
          if (session && user.id === session.volunteer_id) {
            setVolunteerCrisisAlert(true);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId, user, session]);

  const sendMessage = useCallback(async () => {
    if (!user || !sessionId || !newMessage.trim()) return;
    const content = newMessage.trim();

    // Crisis detection
    const isCrisis = detectCrisisLanguage(content);
    if (isCrisis) {
      setShowCrisis(true);
    }

    setSending(true);
    setNewMessage("");
    try {
      const { data: msgData, error } = await supabase
        .from("session_messages")
        .insert({
          session_id: sessionId,
          sender_id: user.id,
          content,
        })
        .select("id")
        .single();
      if (error) throw error;

      // 8.1: Write crisis flag to DB
      if (isCrisis && msgData) {
        await (supabase as any).from("crisis_flags").insert({
          session_id: sessionId,
          message_id: msgData.id,
        });
      }
    } catch (e: any) {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  }, [user, sessionId, newMessage, toast]);

  const transitionSession = async (newStatus: SessionStatus) => {
    try {
      const { data, error } = await supabase.rpc("transition_session", {
        _session_id: sessionId!,
        _new_status: newStatus,
      });
      if (error) throw error;
      if (newStatus === "closed") {
        setShowFeedback(true);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const acceptSession = async () => {
    try {
      const { data, error } = await supabase.rpc("volunteer_accept_session", {
        _session_id: sessionId!,
      });
      if (error) throw error;
      if (!data) {
        toast({ title: "Session already taken", variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (showFeedback && session) {
    return (
      <SessionFeedback
        sessionId={session.id}
        volunteerId={session.volunteer_id}
        role={role ?? "seeker"}
        onComplete={() => navigate("/app/cocoon")}
      />
    );
  }

  if (!session) {
    return (
      <div className="px-6 pt-8">
        <div className="animate-pulse-gentle text-forest font-heading">Loading session…</div>
      </div>
    );
  }

  const isSeeker = user?.id === session.seeker_id;
  const isVolunteer = user?.id === session.volunteer_id;
  const canChat = (isSeeker || isVolunteer) && (session.status === "active" || session.status === "wrap_up");
  const statusInfo = STATUS_LABELS[session.status];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate("/app/cocoon")} className="text-driftwood hover:text-forest">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-bark text-sm truncate">{session.topic}</p>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-driftwood" />
            <p className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</p>
          </div>
        </div>

        {/* Session controls */}
        {session.status === "requested" && isVolunteer !== true && role === "volunteer" && (
          <Button size="sm" variant="default" onClick={acceptSession}>Accept</Button>
        )}
        {session.status === "matched" && (isSeeker || isVolunteer) && (
          <Button size="sm" variant="default" onClick={() => transitionSession("active")}>
            Start Session
          </Button>
        )}
        {session.status === "active" && (isSeeker || isVolunteer) && (
          <Button size="sm" variant="secondary" onClick={() => transitionSession("wrap_up")}>
            Wrap Up
          </Button>
        )}
        {session.status === "wrap_up" && (isSeeker || isVolunteer) && (
          <Button size="sm" variant="outline" onClick={() => transitionSession("closed")}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> End Session
          </Button>
        )}
      </div>

      {/* Crisis Banner (for seeker) */}
      {showCrisis && <CrisisBanner />}

      {/* Volunteer crisis alert */}
      {volunteerCrisisAlert && (
        <div className="bg-ember/10 border-2 border-ember rounded-echo-md p-4 mx-4 mt-2 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-5 w-5 text-ember" />
            <p className="font-heading font-semibold text-bark text-sm">
              Crisis language detected
            </p>
          </div>
          <p className="text-xs text-driftwood">
            The seeker may be experiencing a crisis. Follow the Echo crisis protocol: stay calm, listen actively, and refer to emergency resources if needed.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs text-driftwood"
            onClick={() => setVolunteerCrisisAlert(false)}
          >
            Acknowledge
          </Button>
        </div>
      )}

      {/* Waiting state */}
      {session.status === "requested" && isSeeker && (
        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div>
            <div className="w-16 h-16 rounded-full bg-mist flex items-center justify-center mx-auto mb-4 animate-pulse-gentle">
              <Clock className="h-8 w-8 text-forest" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-bark mb-2">Finding your volunteer</h2>
            <p className="text-sm text-driftwood max-w-xs">
              A trained volunteer will be matched with you shortly. You'll be notified when they're ready.
            </p>
            <Button
              variant="ghost"
              className="mt-6 text-care-alert"
              onClick={() => transitionSession("cancelled")}
            >
              Cancel request
            </Button>
          </div>
        </div>
      )}

      {/* Messages area */}
      {(session.status !== "requested" || !isSeeker) && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {session.status === "matched" && messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-fern font-medium">Volunteer matched!</p>
              <p className="text-xs text-driftwood mt-1">Click "Start Session" to begin your conversation.</p>
            </div>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            const alias = participantAliases[msg.sender_id] ?? "Unknown";

            if (msg.is_system) {
              return (
                <div key={msg.id} className="text-center">
                  <p className="text-xs text-driftwood bg-sand inline-block px-3 py-1 rounded-echo-pill">
                    {msg.content}
                  </p>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] ${isMine ? "order-2" : ""}`}>
                  <p className={`text-[10px] mb-0.5 ${isMine ? "text-right" : "text-left"} text-driftwood`}>
                    {isMine ? "You" : alias}
                  </p>
                  <div
                    className={`px-4 py-2.5 rounded-echo-lg text-sm leading-relaxed ${
                      isMine
                        ? "bg-forest text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border text-bark rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[10px] mt-0.5 text-driftwood ${isMine ? "text-right" : ""}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input bar */}
      {canChat && (
        <div className="border-t border-border bg-card px-4 py-3 shrink-0 safe-area-bottom">
          <div className="flex items-end gap-2 max-w-lg mx-auto">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, 2000))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message…"
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 rounded-echo-lg border border-stone bg-background text-bark placeholder:text-driftwood/60 focus:border-fern focus:outline-none text-sm max-h-32"
              style={{ minHeight: "40px" }}
            />
            <Button
              size="icon"
              variant="default"
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="shrink-0 h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Closed state */}
      {session.status === "closed" && !showFeedback && (
        <div className="border-t border-border bg-dawn px-4 py-4 text-center shrink-0">
          <p className="text-sm text-driftwood mb-2">This session has ended.</p>
          <Button variant="outline" size="sm" onClick={() => setShowFeedback(true)}>
            Leave Feedback
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
