import shadow1 from '../assets/s1.png';
import { Link } from 'react-router-dom';
import { IoHome, IoSettings, IoLogOut, IoMenu, IoClose, IoChevronBack, IoChevronForward, IoRefresh } from "react-icons/io5";
import { GoArrowUpRight } from "react-icons/go";
import { HiUserCircle } from "react-icons/hi2";
import { useState, useEffect, useRef } from 'react';
import { FaArrowUp, FaUser, FaRobot, FaTrash, FaSpinner } from "react-icons/fa";
import api from '../api';
import { useSearchParams } from "react-router-dom";

export default function ChatbotUI() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatSliderOpen, setChatSliderOpen] = useState(false);
    const hot_careers = ["AI Engineering", "Data Mining", "Data Science"];
    const [topic, setTopic] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [user, setUser] = useState({});
    const [searchParams] = useSearchParams();
    const career = searchParams.get("career");
    const [hasAutoSent, setHasAutoSent] = useState(false);
    const [threadId, setThreadId] = useState("");
    const [clearLoading, setClearLoading] = useState(false);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading]);

    // Fetch user and load conversation
    useEffect(() => {
        const initializeUserChat = async () => {
            try {
                // Fetch user info
                const userResponse = await api.get('/users/me/');
                console.log('User info response:', userResponse.data.full_name);
                setUser(userResponse.data);
                console.log('User object value:',user);
                
                // Load user's conversation
                await loadUserMessages();
                
                console.log('User chat initialized');
            } catch (err) {
                console.error('Failed to initialize user chat', err);
            }
        };
        
        initializeUserChat();
    }, []);

    // Handle career parameter
    useEffect(() => {
        if (career && !hasAutoSent && messages.length === 0) {
            const timer = setTimeout(() => {
                const careerQuestion = `Tell me about ${career} career. What skills are required, job prospects, salary range, and how to get started?`;
                setTopic(careerQuestion);
                sendMessage(careerQuestion);
                setHasAutoSent(true);
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [career, hasAutoSent, messages.length]);

    // Load user's messages
    const loadUserMessages = async () => {
        setLoadingHistory(true);
        try {
            console.log('Loading user messages...');
            const response = await api.get('/api/messages/');
            console.log('User messages response:', response.data);
            
            if (response.data && response.data.messages) {
                // Convert backend format to UI format
                const uiMessages = response.data.messages.map((msg, index) => ({
                    id: `${Date.now()}_${index}_${msg.type}`,
                    sender: msg.type === 'human' ? 'user' : 'ai',
                    text: msg.content,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                
                setMessages(uiMessages);
                setThreadId(response.data.thread_id || "");
                
                console.log(`Loaded ${uiMessages.length} messages`);
            } else {
                setMessages([]);
                setThreadId("");
                console.log('No messages found');
            }
        } catch (err) {
            console.error('Failed to load messages:', err);
            // Don't clear existing messages on error
        } finally {
            setLoadingHistory(false);
        }
    };

    // Refresh messages
    const refreshMessages = async () => {
        await loadUserMessages();
    };

    const handleHotCareerClick = (career) => {
        sendMessage(`Tell me about ${career} career`);
    };

    const handleSendMessage = () => {
        if (!topic.trim() || loading) return;
        sendMessage(topic);
        setTopic("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const sendMessage = async (messageText) => {
        if (!messageText.trim() || loading) return;
        
        // Create user message
        const userMessage = {
            id: `temp_${Date.now()}_user`,
            sender: 'user',
            text: messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Create AI placeholder
        const aiMessage = {
            id: `temp_${Date.now()}_ai`,
            sender: 'ai',
            text: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Add both messages immediately
        setMessages(prev => [...prev, userMessage, aiMessage]);
        setLoading(true);

        try {
            // Call API
            const response = await api.post('/api/chat/', {
                message: messageText
            });

            console.log('API Response:', response.data);

            if (!response.data || !response.data.response) {
                throw new Error('No response from server');
            }

            const aiText = response.data.response;

            // Update thread ID
            if (response.data.thread_id) {
                setThreadId(response.data.thread_id);
            }

            // Simulate streaming
            for (let i = 0; i <= aiText.length; i++) {
                await new Promise(r => setTimeout(r, 5));
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessage.id 
                        ? { ...msg, text: aiText.slice(0, i) }
                        : msg
                ));
            }

            // After streaming, replace temp messages with final ones
            if (response.data.messages && response.data.messages.length > 0) {
                setTimeout(() => {
                    // Convert to UI format
                    const finalMessages = response.data.messages.map((msg, idx) => ({
                        id: `final_${Date.now()}_${idx}_${msg.type}`,
                        sender: msg.type === 'human' ? 'user' : 'ai',
                        text: msg.content,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }));
                    
                    // Remove temp messages and add final ones
                    setMessages(prev => {
                        const filtered = prev.filter(msg => 
                            !msg.id.startsWith('temp_') && !msg.id.startsWith('final_')
                        );
                        return [...filtered, ...finalMessages];
                    });
                }, 300);
            }

        } catch (err) {
            console.error('Send message error:', err);
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessage.id 
                    ? { ...msg, text: 'Error: Could not get response. Please try again.' }
                    : msg
            ));
        } finally {
            setLoading(false);
        }
    };

    // Clear conversation - FIXED VERSION
    const clearConversation = async () => {
        if (!window.confirm('Are you sure you want to clear all conversation history? This action cannot be undone.')) {
            return;
        }
        
        setClearLoading(true);
        try {
            const response = await api.post('/api/clear-chat/',{ confirm: true });
            
            if (response.data && response.data.status === 'success') {
                setMessages([]);
                setThreadId("");
                alert('Conversation cleared successfully!');
                
            } else {
                throw new Error(response.data?.message || 'Failed to clear chat');
            }
        } catch (err) {
            console.error('Failed to clear conversation:', err);
            alert(`Failed to clear conversation: ${err.message}`);
        } finally {
            setClearLoading(false);
        }
    };

    // Get welcome message
    const getWelcomeMessage = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning!";
        if (hour < 18) return "Good afternoon!";
        return "Good evening!";
    };

    // Render message content with line breaks
    const renderMessageContent = (text) => {
        return text.split('\n').map((line, i) => (
            <span key={i}>
                {line}
                {i < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-black flex flex-col lg:flex-row">
            {/* Grid Background */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        repeating-linear-gradient(0deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px),
                        repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px)
                    `,
                    backgroundSize: '100px 100px',
                    opacity: 0.1,
                }}
            />

            {/* Shadow Overlay */}
            <div className="absolute inset-0 z-10">
                <img src={shadow1} alt="Shadow Overlay" className="w-full h-full object-cover opacity-70" />
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden p-4 z-30 flex items-center justify-between bg-black/50 backdrop-blur-sm">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 rounded-lg hover:bg-gray-700 transition">
                    {sidebarOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
                </button>
                <Link to="/"><h1 className="text-white font-bold text-[20px]">Career Advisor</h1></Link>
                <div className="w-10"></div>
            </div>

            {/* Sidebar */}
            <div className={`fixed lg:static inset-y-0 left-0 z-30 w-64 lg:w-auto transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out p-4 bg-black/80 lg:bg-transparent backdrop-blur-lg lg:backdrop-blur-none lg:z-20 h-screen lg:h-auto overflow-y-auto`}>
                <div className='relative mt-4 p-4 flex justify-center items-center rounded-3xl flex-col'>
                    <Link to="/" onClick={() => setSidebarOpen(false)}>
                        <h1 className="text-white font-bold text-[20px] mb-10">Career Advisor</h1>
                    </Link>
                </div>
                <ul className="space-y-6">
                    <li><Link to="/" className="flex items-center gap-3 text-white p-2 rounded-lg hover:bg-gray-700 transition" onClick={() => setSidebarOpen(false)}><IoHome size={20} /> Home</Link></li>
                    <li><Link to="/settings" className="flex items-center gap-3 text-white p-2 rounded-lg hover:bg-gray-700 transition" onClick={() => setSidebarOpen(false)}><IoSettings size={20} /> Settings</Link></li>
                    <li><Link to="/logout" className="flex items-center gap-3 text-white p-2 rounded-lg hover:bg-gray-700 transition" onClick={() => setSidebarOpen(false)}><IoLogOut size={20} /> Logout</Link></li>
                </ul>
                
                {/* Chat Management */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className='text-white ml-3 font-bold text-xl'>Your Chat</h1>
                        <button
                            onClick={refreshMessages}
                            disabled={loadingHistory}
                            className="text-white p-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                            title="Refresh messages"
                        >
                            <IoRefresh size={18} />
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        <button
                            onClick={clearConversation}
                            disabled={clearLoading || loadingHistory}
                            className="flex items-center gap-2 text-white p-3 rounded-lg bg-red-900/30 hover:bg-red-800/40 transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {clearLoading ? (
                                <>
                                    <FaSpinner className="animate-spin" size={16} />
                                    <span>Clearing...</span>
                                </>
                            ) : (
                                <>
                                    <FaTrash size={16} />
                                    <span>Clear Conversation</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <h1 className='mt-7 text-white ml-3 font-bold text-xl'>Hot Careers</h1>
                <ul className="space-y-6 mt-8">
                    {hot_careers.map(item => (
                        <li key={item} className="flex items-center justify-between text-white p-3 rounded-lg chat_color hover:chat_color_hover transition cursor-pointer" onClick={() => handleHotCareerClick(item)}>
                            <span>{item}</span><GoArrowUpRight size={15} />
                        </li>
                    ))}
                </ul>
                <div className='flex flex-col chat_color rounded-lg mt-5 p-4 justify-center items-center'>
                    <HiUserCircle size={80} color='white' />
                    <h1 className='text-white font-bold mt-2'>{user ? user.full_name : 'Loading...'}</h1>
                    {/* {threadId && (
                        <div className="mt-2 text-xs text-gray-400 text-center">
                            <p className="font-medium text-gray-300">Your Thread:</p>
                            <p className="font-mono text-xs bg-gray-800/50 p-2 rounded mt-1 break-all">
                                {threadId.slice(0, 30)}...
                            </p>
                        </div>
                    )} */}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="relative z-10 flex-1 flex flex-col p-4 lg:p-6 w-full mt-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-white text-xl lg:text-2xl">Your Career Chat</h2>
                        {user && (
                            <p className="text-gray-400 text-sm mt-1">
                                {getWelcomeMessage()} Welcome back, <span className="text-blue-400">{user.username}</span>!
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => setChatSliderOpen(!chatSliderOpen)}
                        className="flex items-center gap-2 text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition duration-300"
                    >
                        {chatSliderOpen ? (
                            <>
                                <IoChevronForward size={18} />
                                <span className="hidden lg:inline">Hide Details</span>
                            </>
                        ) : (
                            <>
                                <IoChevronBack size={18} />
                                <span className="hidden lg:inline">Show Details</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Loading State */}
                {loadingHistory && (
                    <div className="mb-4 p-4 bg-blue-900/20 border border-blue-800/30 rounded-xl flex items-center justify-center">
                        <FaSpinner className="animate-spin text-blue-400 mr-3" size={20} />
                        <span className="text-blue-300">Loading your conversation...</span>
                    </div>
                )}

                {/* Chat Container */}
                <div className="flex flex-col lg:flex-row flex-1 gap-4">
                    {/* Messages Box - FIXED WITH SCROLL */}
                    <div
                        ref={chatContainerRef}
                        className={`${chatSliderOpen ? 'lg:w-3/5' : 'lg:w-full'} flex flex-col transition-all duration-500 ease-in-out`}
                    >
                        <div 
                            className="flex-1 chat_color rounded-xl p-4 flex flex-col gap-4 overflow-y-auto min-h-[60vh] lg:min-h-[65vh] chat-scrollbar"
                            style={{ maxHeight: 'calc(100vh - 280px)' }} // Fixed height for scrolling
                        >
                            {messages.length === 0 && !loadingHistory ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <FaRobot className="text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-300 text-lg">Welcome to your personal career chat!</p>
                                    <p className="text-gray-400 text-sm mt-2">Ask about careers, skills, or select from Hot Careers</p>
                                    <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
                                        <p className="text-gray-300 text-sm">Your conversations are automatically saved.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* {messages.length > 0 && (
                                        <div className="text-center mb-4 p-3 bg-blue-900/20 rounded-lg sticky top-0 z-10">
                                            <p className="text-blue-300 text-sm">
                                                {messages.length} message{messages.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    )} */}

                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.sender === 'ai' && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                        <FaRobot size={14} className="text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                                                <div className={`rounded-2xl p-4 ${msg.sender === 'user'
                                                    ? 'bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-800/30'
                                                    : 'bg-gray-800/50 border border-gray-700/50'
                                                    }`}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {msg.sender === 'user' ? (
                                                            <FaUser size={10} className="text-blue-400" />
                                                        ) : (
                                                            <FaRobot size={10} className="text-purple-400" />
                                                        )}
                                                        <span className={`text-xs font-medium ${msg.sender === 'user' ? 'text-blue-400' : 'text-purple-400'}`}>
                                                            {msg.sender === 'user' ? 'You' : 'Career Advisor'}
                                                        </span>
                                                        <span className="text-gray-500 text-xs">• {msg.time}</span>
                                                    </div>
                                                    <p className="text-white whitespace-pre-wrap">
                                                        {renderMessageContent(msg.text)}
                                                    </p>
                                                </div>
                                            </div>

                                            {msg.sender === 'user' && (
                                                <div className="flex-shrink-0 order-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center border border-gray-700">
                                                        <FaUser size={14} className="text-white" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {loading && (
                                        <div className="flex gap-3 justify-start">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                    <FaRobot size={14} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 max-w-[80%]">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    </div>
                                                    <span className="text-gray-400 text-sm">AI is thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className='flex flex-col lg:flex-row w-full gap-4 mt-4'>
                            <input
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={career ? `Ask more about ${career}...` : "Ask about careers, skills, or job opportunities..."}
                                className="chat_color text-white placeholder-gray-400 rounded-xl h-14 lg:h-16 p-4 pr-14 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                                disabled={loading || loadingHistory}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!topic.trim() || loading || loadingHistory}
                                className={`flex items-center justify-center chat_color ${topic.trim() ? 'hover:chat_color_hover' : 'opacity-50 cursor-not-allowed'} text-white font-bold py-3 px-6 lg:px-8 rounded-xl transition duration-300 h-14 lg:h-16 whitespace-nowrap min-w-[120px]`}
                            >
                                <span className="mr-2">Send</span>
                                <FaArrowUp size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Slider Panel - FIXED WITH SCROLL */}
                    {chatSliderOpen && (
                        <div className="lg:w-2/5 transition-all duration-500 ease-in-out">
                            <div className="chat_color rounded-xl p-4 lg:p-6 h-full flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-white text-lg lg:text-xl font-bold">Chat Details</h3>
                                    <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                                        Personal
                                    </span>
                                </div>

                                <div className="space-y-6 flex-1 overflow-y-auto chat-scrollbar pr-2">
                                    {/* User Info */}
                                    <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                                <FaUser size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-semibold">{user ? user.username : 'User'}</h4>
                                                <p className="text-gray-400 text-xs">Career Advisor Chat</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="text-center p-3 bg-black/30 rounded-lg">
                                                <div className="text-xl font-bold text-blue-400">{messages.filter(m => m.sender === 'user').length}</div>
                                                <div className="text-gray-400 text-xs mt-1">Your Messages</div>
                                            </div>
                                            <div className="text-center p-3 bg-black/30 rounded-lg">
                                                <div className="text-xl font-bold text-purple-400">{messages.filter(m => m.sender === 'ai').length}</div>
                                                <div className="text-gray-400 text-xs mt-1">AI Responses</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-4">
                                        <h4 className="text-white font-semibold mb-3">Quick Actions</h4>
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => sendMessage("What are the most in-demand skills right now?")}
                                                className="w-full text-left p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition text-gray-300 text-sm disabled:opacity-50"
                                                disabled={loading}
                                            >
                                                In-demand skills
                                            </button>
                                            <button
                                                onClick={() => sendMessage("How do I start a career in tech?")}
                                                className="w-full text-left p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition text-gray-300 text-sm disabled:opacity-50"
                                                disabled={loading}
                                            >
                                                Starting in tech
                                            </button>
                                            <button
                                                onClick={() => sendMessage("What programming languages should I learn?")}
                                                className="w-full text-left p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition text-gray-300 text-sm disabled:opacity-50"
                                                disabled={loading}
                                            >
                                                Programming languages
                                            </button>
                                        </div>
                                    </div>

                                    {/* Thread Info */}
                                    {threadId && (
                                        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl p-4">
                                            <h4 className="text-white font-semibold mb-3">Session Info</h4>
                                            <div className="text-xs">
                                                <p className="text-gray-400 mb-1">Thread ID:</p>
                                                <p className="text-gray-300 font-mono bg-gray-900/30 p-2 rounded break-all">
                                                    {threadId}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-2">
                                                    Your conversation is saved with this ID
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-800/50">
                                    <button
                                        onClick={refreshMessages}
                                        disabled={loadingHistory}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 hover:from-blue-600/40 hover:to-purple-600/40 border border-blue-800/30 rounded-xl text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {loadingHistory ? (
                                            <>
                                                <FaSpinner className="animate-spin" size={16} />
                                                <span>Refreshing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <IoRefresh size={16} />
                                                <span>Refresh Chat</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Suggestions */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        onClick={() => sendMessage("What are the most in-demand skills right now?")}
                        className="text-sm text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-800/50 px-4 py-2 rounded-lg transition border border-gray-800/50 disabled:opacity-50"
                        disabled={loading || loadingHistory}
                    >
                        In-demand skills
                    </button>
                    <button
                        onClick={() => sendMessage("How do I start a career in tech?")}
                        className="text-sm text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-800/50 px-4 py-2 rounded-lg transition border border-gray-800/50 disabled:opacity-50"
                        disabled={loading || loadingHistory}
                    >
                        Starting in tech
                    </button>
                    <button
                        onClick={() => sendMessage("What programming languages should I learn?")}
                        className="text-sm text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-800/50 px-4 py-2 rounded-lg transition border border-gray-800/50 disabled:opacity-50"
                        disabled={loading || loadingHistory}
                    >
                        Programming languages
                    </button>
                </div>
            </div>

            {/* Custom Scrollbar CSS */}
            <style jsx="true">{`
                .chat-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #6366F1 #1F2937;
                }
                
                .chat-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                
                .chat-scrollbar::-webkit-scrollbar-track {
                    background: rgba(31, 41, 55, 0.3);
                    border-radius: 10px;
                    margin: 4px 0;
                }
                
                .chat-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #6366F1, #8B5CF6, #EC4899);
                    border-radius: 10px;
                    border: 2px solid rgba(31, 41, 55, 0.5);
                }
                
                .chat-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #818CF8, #A78BFA, #F472B6);
                }
                
                /* Fix for input area staying at bottom */
                .flex-1 {
                    flex: 1 1 0%;
                    min-height: 0;
                }
            `}</style>
        </div>
    );
}