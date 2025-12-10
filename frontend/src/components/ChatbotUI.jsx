import shadow1 from '../assets/s1.png';
import { Link } from 'react-router-dom';
import { IoHome, IoSettings, IoLogOut, IoMenu, IoClose, IoChevronBack, IoChevronForward } from "react-icons/io5";
import { GoArrowUpRight } from "react-icons/go";
import { HiUserCircle } from "react-icons/hi2";
import { useState, useEffect, useRef } from 'react';
import { FaArrowUp, FaUser, FaRobot } from "react-icons/fa";
import api from '../api';

export default function ChatbotUI() {
    const OPENAI_API_KEY = "sks-proj-qOs7k67pRkQs7sRBYVM1RskQ-Nok8rGVVXwrs8dehrBC8-Ztps6_2xnIn8WV1uGHhRySWJdQ43T3BlbkFJv5p-LOD-GT1uy8JwckNPxPdTP6rftbLsy6D-D7goWh4-KB4-NuhWD9Ubpyk3dLqHgS-EN6txYA";

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [chatSliderOpen, setChatSliderOpen] = useState(false); 
    const hot_careers = ["AI Engineering", "Data Mining", "Data Science"];
    const [topic, setTopic] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [user,setUser]=useState(null);
    
    // Scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/users/me/');
                setUser(response.data);
                console.log('Fetched user:', response.data);
            } catch (err) {
                console.error('Failed to fetch user info', err);
            }
        };
        fetchUser();
    }, []); 

    const handleHotCareerClick = (career) => sendMessage(career);

    const handleSendMessage = () => {
        if (!topic.trim()) return;
        sendMessage(topic);
        setTopic("");
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const sendMessage = async (message) => {
        // Add user message
        setMessages(prev => [...prev, { sender: 'user', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        // Add placeholder for AI
        setMessages(prev => [...prev, { sender: 'ai', text: '', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        setLoading(true);

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "You are a helpful career advisor AI." },
                        { role: "user", content: message }
                    ],
                    max_tokens: 200
                })
            });

            const data = await response.json();
            const aiText = data.choices[0].message.content;

            // Simulate streaming by adding one character at a time
            for (let i = 0; i <= aiText.length; i++) {
                await new Promise(r => setTimeout(r, 20));
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = aiText.slice(0, i);
                    return newMessages;
                });
            }

        } catch (err) {
            console.error(err);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = "Error: Could not fetch response.";
                return newMessages;
            });
        } finally {
            setLoading(false);
        }
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
                    <li><Link className="flex items-center gap-3 text-white p-2 rounded-lg hover:bg-gray-700 transition" onClick={() => setSidebarOpen(false)}><IoHome size={20} /> Home</Link></li>
                    <li><Link className="flex items-center gap-3 text-white p-2 rounded-lg hover:bg-gray-700 transition" onClick={() => setSidebarOpen(false)}><IoSettings size={20} /> Settings</Link></li>
                    <li><Link to="logout/" className="flex items-center gap-3 text-white p-2 rounded-lg hover:bg-gray-700 transition" onClick={() => setSidebarOpen(false)}><IoLogOut size={20} /> Logout</Link></li>
                </ul>
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
                    <h1 className='text-white font-bold mt-2'>{user ? user.username : 'Loading...'}</h1>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="relative z-10 flex-1 flex flex-col p-4 lg:p-6 w-full mt-10">
                <div className="flex items-center justify-between mb-4 ">
                    <h2 className="text-white text-xl lg:text-2xl">Chat Area</h2>
                    
                    {/* Chat Slider Toggle Button */}
                    <button 
                        onClick={() => setChatSliderOpen(!chatSliderOpen)}
                        className="flex items-center gap-2 text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition duration-300"
                    >
                        {chatSliderOpen ? (
                            <>
                                <IoChevronForward size={18} />
                                <span className="hidden lg:inline">Hide Chat</span>
                            </>
                        ) : (
                            <>
                                <IoChevronBack size={18} />
                                <span className="hidden lg:inline">Show Chat</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Chat Container with Slider */}
                <div className="flex flex-col lg:flex-row flex-1 gap-4 ">
                    {/* Chat Messages Box - Slideable */}
                    <div 
                        ref={chatContainerRef}
                        className={`${
                            chatSliderOpen 
                                ? 'lg:w-3/5 lg:translate-x-0 lg:opacity-100' 
                                : 'lg:w-full lg:translate-x-0 lg:opacity-100'
                        } flex flex-col transition-all duration-500 ease-in-out`}
                    >
                        {/* Messages Container with FIXED Scrollbar */}
                        <div className="flex-1 chat_color rounded-xl p-4 flex flex-col gap-4 overflow-y-auto min-h-[60vh] lg:min-h-[65vh] chat-scrollbar"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#6366F1 #1F2937',
                            }}
                        >
                            
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <FaRobot className="text-gray-400 mb-4" size={48} />
                                    <p className="text-gray-300 text-lg">Start a conversation!</p>
                                    <p className="text-gray-400 text-sm">Ask about careers or select from Hot Careers</p>
                                </div>
                            )}
                            
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                                            <p className="text-white">{msg.text}</p>
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
                            <div ref={chatEndRef}></div>
                        </div>

                        {/* Input Area */}
                        <div className='flex flex-col lg:flex-row w-full gap-4 mt-4'>
                            <input
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message or select a hot career..."
                                className="chat_color text-white placeholder-gray-400 rounded-xl h-14 lg:h-16 p-4 pr-14 w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!topic.trim()}
                                className={`flex items-center justify-center chat_color ${topic.trim() ? 'hover:chat_color_hover' : 'opacity-50 cursor-not-allowed'} text-white font-bold py-3 px-6 lg:px-8 rounded-xl transition duration-300 h-14 lg:h-16 whitespace-nowrap min-w-[120px]`}
                            >
                                <span className="mr-2">Send</span>
                                <FaArrowUp size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Slider Panel - Opens when toggled */}
                    <div className={`${
                        chatSliderOpen 
                            ? 'lg:w-2/5 lg:translate-x-0 lg:opacity-100 lg:block' 
                            : 'lg:w-0 lg:translate-x-full lg:opacity-0 lg:hidden'
                    } transition-all duration-500 ease-in-out overflow-hidden`}>
                        <div className="chat_color rounded-xl p-4 lg:p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white text-lg lg:text-xl font-bold">Career Insights</h3>
                                <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full">
                                    Real-time
                                </span>
                            </div>
                            
                            {/* Slider Content */}
                            <div className="space-y-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                {/* Stats Cards */}
                                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-300 text-sm">Active Conversations</span>
                                        <span className="text-green-400 text-lg font-bold">24</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-3/4"></div>
                                    </div>
                                </div>
                                
                                {/* Quick Tips */}
                                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-4">
                                    <h4 className="text-white font-semibold mb-3">Quick Career Tips</h4>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            <span className="text-gray-300 text-sm">Update your skills every 6 months</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                            <span className="text-gray-300 text-sm">Build a strong portfolio with real projects</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                            <span className="text-gray-300 text-sm">Network regularly on LinkedIn</span>
                                        </li>
                                    </ul>
                                </div>
                                
                                {/* Trending Careers */}
                                <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-4">
                                    <h4 className="text-white font-semibold mb-3">Trending Now</h4>
                                    <div className="space-y-3">
                                        {["Prompt Engineering", "DevOps", "Cloud Security", "MLOps"].map((career, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg hover:bg-gray-900/50 transition cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                        idx === 0 ? 'bg-blue-500/20' : 
                                                        idx === 1 ? 'bg-purple-500/20' : 
                                                        idx === 2 ? 'bg-green-500/20' : 'bg-orange-500/20'
                                                    }`}>
                                                        <span className="text-xs font-bold text-white">{idx + 1}</span>
                                                    </div>
                                                    <span className="text-gray-200 text-sm">{career}</span>
                                                </div>
                                                <GoArrowUpRight size={14} className="text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Chat Stats */}
                                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl p-4">
                                    <h4 className="text-white font-semibold mb-3">Your Chat Stats</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="text-center p-3 bg-black/30 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-400">{messages.filter(m => m.sender === 'user').length}</div>
                                            <div className="text-gray-400 text-xs mt-1">Questions Asked</div>
                                        </div>
                                        <div className="text-center p-3 bg-black/30 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-400">{messages.filter(m => m.sender === 'ai').length}</div>
                                            <div className="text-gray-400 text-xs mt-1">AI Responses</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Slider Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-800/50">
                                <button 
                                    onClick={() => handleSendMessage("Give me career statistics and insights")}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 hover:from-blue-600/40 hover:to-purple-600/40 border border-blue-800/30 rounded-xl text-white transition flex items-center justify-center gap-2"
                                >
                                    <span>Get Detailed Insights</span>
                                    <GoArrowUpRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Suggestions */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <button 
                        onClick={() => handleSendMessage("What are the most in-demand skills right now?")}
                        className="text-sm text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-800/50 px-4 py-2 rounded-lg transition border border-gray-800/50"
                    >
                        In-demand skills
                    </button>
                    <button 
                        onClick={() => handleSendMessage("How do I start a career in tech?")}
                        className="text-sm text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-800/50 px-4 py-2 rounded-lg transition border border-gray-800/50"
                    >
                        Starting in tech
                    </button>
                    <button 
                        onClick={() => handleSendMessage("What programming languages should I learn?")}
                        className="text-sm text-gray-300 hover:text-white bg-gray-800/30 hover:bg-gray-800/50 px-4 py-2 rounded-lg transition border border-gray-800/50"
                    >
                        Programming languages
                    </button>
                </div>
            </div>

            {/* Add the scrollbar CSS to the global scope */}
            <style jsx="true">{`
                /* Chat scrollbar styling - This will apply globally */
                .chat-scrollbar {
                    overflow-y: auto !important;
                }
                
                /* For WebKit browsers */
                .chat-scrollbar::-webkit-scrollbar {
                    width: 8px !important;
                }
                
                .chat-scrollbar::-webkit-scrollbar-track {
                    background: rgba(31, 41, 55, 0.5) !important;
                    border-radius: 10px !important;
                    margin: 4px 0 !important;
                }
                
                .chat-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #6366F1, #8B5CF6, #EC4899) !important;
                    border-radius: 10px !important;
                    border: 2px solid rgba(31, 41, 55, 0.3) !important;
                }
                
                .chat-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #818CF8, #A78BFA, #F472B6) !important;
                }
                
                /* Force scrollbar to always be visible */
                .chat-scrollbar {
                    scrollbar-width: thin !important;
                    scrollbar-color: #6366F1 #1F2937 !important;
                }
                
                /* Ensure the container has proper height for scrolling */
                .chat-scrollbar {
                    max-height: calc(65vh - 2rem) !important;
                }
            `}</style>
        </div>
    );
}