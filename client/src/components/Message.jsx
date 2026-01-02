import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Send, User } from "lucide-react";

const Message = () => {
  const { doctorId } = useParams();
  const location = useLocation();
  const [doctor, setDoctor] = useState(location.state?.doctor || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (doctorId && !doctor) {
      fetchDoctor();
    }
    fetchMessages();
  }, [doctorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDoctor = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${doctorId}`);
      const data = await response.json();
      setDoctor(data);
    } catch (error) {
      console.error("Error fetching doctor:", error);
    }
  };

  const fetchMessages = async () => {
    if (!doctorId) return;
    
    try {
      setLoading(true);
      console.log("Fetching messages for doctorId:", doctorId);
      const response = await fetch(`http://localhost:5000/api/whatsapp/${doctorId}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !doctorId) return;

    try {
      setSending(true);
      const response = await fetch("http://localhost:5000/api/whatsapp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          message: newMessage,
          sender: "patient"
        }),
      }) 

      const data = await response.json();

      if (data.success) {
        setMessages([...messages, data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getColorForDoctor = (name) => {
    if (!name) return 'from-[#00b894] to-[#009b7d]';
    const colors = [
      'from-[#00b894] to-[#009b7d]',
      'from-[#0984e3] to-[#0652dd]',
      'from-[#6c5ce7] to-[#5f3dc4]',
      'from-[#fd79a8] to-[#e84393]',
      'from-[#fdcb6e] to-[#f39c12]',
      'from-[#00cec9] to-[#00a8a8]'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#1a1a1a]" style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>
      {/* Import Manrope font */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}
      </style>

      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(240,255,240,1)_0,_rgba(230,250,240,0.5)_100%)]" />

      <div className="relative flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Doctor Header Card */}
          {doctor && (
            <div className="mb-6 group relative rounded-3xl bg-white/40 backdrop-blur-xl p-6 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white/50 bg-gradient-to-br ${getColorForDoctor(doctor.name)} flex items-center justify-center`}>
                  <User className="h-8 w-8 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-[#009b7d] mb-1">
                    Ask Your Query
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1a]">
                    Dr. {doctor.name}
                  </h1>
                  <p className="text-sm font-medium text-[#2a2a2a] mt-1">
                    {doctor.qualification} • {doctor.specialization}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Container */}
          <div className="group relative rounded-3xl bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Messages Area */}
            <div className="relative z-10 h-[500px] overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-[#e0f5ed] border-t-[#009b7d] animate-spin" />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[#2a2a2a] font-medium text-center">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-4 shadow-md ${
                          msg.sender === 'patient'
                            ? 'bg-gradient-to-br from-[#00b894] to-[#009b7d] text-white rounded-br-sm'
                            : 'bg-white/80 backdrop-blur-sm text-[#1a1a1a] rounded-bl-sm border border-white/60'
                        }`}
                      >
                        <p className="text-sm font-medium break-words">{msg.message}</p>
                       <p className={`text-xs mt-2 ${msg.sender === 'patient' ? 'text-white/70' : 'text-[#4a4a4a]'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit',minute: '2-digit' })}
                        </p>

                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="relative z-10 border-t border-white/60 bg-white/20 backdrop-blur-sm p-4">
              <form onSubmit={sendMessage} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 rounded-xl bg-white/80 backdrop-blur-sm border border-white/60 px-4 py-3 text-sm font-medium text-[#1a1a1a] placeholder:text-[#4a4a4a] focus:outline-none focus:ring-2 focus:ring-[#009b7d] focus:border-transparent transition-all shadow-sm"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="group/btn relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#00b894] to-[#009b7d] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_0_rgba(0,122,99,1),0_8px_20px_rgba(0,155,125,0.3)] transition-all hover:translate-y-0.5 hover:shadow-[0_2px_0_rgba(0,122,99,1),0_4px_15px_rgba(0,155,125,0.2)] active:translate-y-1 active:shadow-[0_0px_0_rgba(0,122,99,1),0_2px_10px_rgba(0,155,125,0.15)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_rgba(0,122,99,1),0_8px_20px_rgba(0,155,125,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009b7d] focus-visible:ring-offset-2"
                >
                  <Send className="h-4 w-4" />
                  {/* Shine effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 transition-opacity group-hover/btn:opacity-100" />
                </button>
              </form>
            </div>

            {/* Ambient glow */}
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#009b7d]/20 blur-3xl" />
          </div>

          {/* Info Card */}
          <div className="mt-6 group relative rounded-2xl bg-white/40 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(0,155,125,0.15)] border border-white/60 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 flex items-center gap-2 text-xs text-[#4a4a4a] font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-[#009b7d] shadow-[0_0_8px_rgba(0,155,125,0.6)]" />
              <span>Messages are private and secure. Response time may vary.</span>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Message;