import { useState, useEffect } from 'react';
import { FaUserGraduate, FaLightbulb, FaRocket, FaUsers, FaChartLine, FaHeart } from 'react-icons/fa';
import { GiArtificialIntelligence } from 'react-icons/gi';
import { RiTeamFill } from 'react-icons/ri';
import { MdVerified } from 'react-icons/md';
import shadow1 from '../assets/s1.png';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function About() {
    const [stats, setStats] = useState([
        { label: 'Careers Explored', value: '10,000+', icon: <FaUserGraduate /> },
        { label: 'AI Conversations', value: '50,000+', icon: <FaLightbulb /> },
        { label: 'Jobs Listed', value: '100,000+', icon: <FaRocket /> },
        { label: 'Happy Users', value: '5,000+', icon: <FaUsers /> }
    ]);

    const teamMembers = [
        {
            name: 'Haris Zahoor',
            role: 'AI & Career Expert',
            bio: 'Former tech recruiter turned AI enthusiast with 8+ years in HR tech',
            expertise: ['AI Systems', 'Career Coaching', 'Tech Recruitment'],
            avatarColor: 'from-blue-500 to-cyan-400'
        },
        {
            name: 'Sarah Johnson',
            role: 'Data Scientist',
            bio: 'Specializes in career trend analysis and predictive modeling',
            expertise: ['Data Analysis', 'Market Trends', 'ML Algorithms'],
            avatarColor: 'from-purple-500 to-pink-400'
        },
        {
            name: 'Marcus Lee',
            role: 'Full Stack Developer',
            bio: 'Builds seamless user experiences with cutting-edge technologies',
            expertise: ['React', 'Node.js', 'API Integration'],
            avatarColor: 'from-green-500 to-emerald-400'
        },
        {
            name: 'Priya Sharma',
            role: 'UX Designer',
            bio: 'Creates intuitive interfaces that guide users to their career goals',
            expertise: ['UI/UX Design', 'User Research', 'Prototyping'],
            avatarColor: 'from-orange-500 to-yellow-400'
        }
    ];

    const values = [
        {
            title: 'Personalized Guidance',
            description: 'Every career journey is unique. We tailor our AI to understand your specific goals, skills, and aspirations.',
            icon: <FaUserGraduate className="text-blue-400" />
        },
        {
            title: 'Data-Driven Insights',
            description: 'We combine real-time job market data with AI analysis to provide actionable career advice.',
            icon: <FaChartLine className="text-purple-400" />
        },
        {
            title: 'Cutting-Edge AI',
            description: 'Leveraging advanced AI to simulate real career conversations and provide meaningful guidance.',
            icon: <GiArtificialIntelligence className="text-green-400" />
        },
        {
            title: 'Community Focus',
            description: 'Building a supportive community where career seekers can learn and grow together.',
            icon: <RiTeamFill className="text-orange-400" />
        }
    ];

    const milestones = [
        { year: '2023', event: 'Career Advisor AI launched', description: 'Initial release with basic career guidance' },
        { year: '2024', event: '10,000 users milestone', description: 'Expanded career database and AI capabilities' },
        { year: '2024', event: 'Job Integration Added', description: 'Real-time job listings from global sources' },
        { year: 'Present', event: 'Ongoing Innovation', description: 'Continuous AI improvements and feature additions' }
    ];

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-black text-white">
            {/* Grid Background */}
            <div
                className="fixed inset-0 z-0"
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
            <div className="fixed inset-0 z-1">
                <img src={shadow1} alt="Shadow Overlay" className="w-full h-full object-cover opacity-70" />
            </div>
            <Navbar />
            {/* Main Content */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 px-4 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
                                <GiArtificialIntelligence className="text-3xl" />
                            </div>
                            <h1 className="text-5xl animate-fadeUp lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                                About Career Advisor 
                            </h1>
                            <p className="text-xl animate-fadeUp text-gray-300 max-w-3xl mx-auto">
                                Transforming career discovery with intelligent AI guidance and real-time market insights.
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                            {stats.map((stat, index) => (
                                <div key={index} className="chat_color rounded-2xl p-6 text-center transform hover:scale-105 transition duration-300">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4">
                                        <div className="text-2xl text-blue-400">{stat.icon}</div>
                                    </div>
                                    <div className="text-3xl font-bold mb-2">{stat.value}</div>
                                    <div className="text-gray-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-20 px-4 lg:px-8 bg-gradient-to-b from-black to-gray-900/50">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                            <div>
                                <h2 className="text-4xl font-bold mb-6 animate-fadeUp">Our Mission</h2>
                                <p className="text-gray-300 text-lg mb-6 animate-fadeUp">
                                    We believe everyone deserves access to personalized career guidance. Traditional career counseling is often expensive, inaccessible, or outdated. 
                                    Career Advisor AI bridges this gap by providing intelligent, data-driven career advice 24/7.
                                </p>
                                <p className="text-gray-300 text-lg animate-fadeUp">
                                    Our platform combines artificial intelligence with real-time job market data to help you discover career paths, develop skills, and find opportunities that match your aspirations.
                                </p>
                            </div>
                            <div className="chat_color rounded-2xl p-8">
                                <div className="aspect-video rounded-xl overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center">
                                        <div className="text-center p-8">
                                            <div className="text-6xl mb-4">🚀</div>
                                            <h3 className="text-2xl font-bold mb-2">Empowering Careers</h3>
                                            <p className="text-gray-400">Through AI & Innovation</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Values */}
                        <div className="mb-20">
                            <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {values.map((value, index) => (
                                    <div key={index} className="chat_color rounded-2xl p-6 transform hover:-translate-y-2 transition duration-300">
                                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-800/50 mb-4">
                                            {value.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                        <p className="text-gray-400">{value.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-20 px-4 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-4">Meet Our Team</h2>
                        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
                            Passionate professionals dedicated to revolutionizing career guidance through technology
                        </p>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="chat_color rounded-2xl p-6 transform hover:scale-105 transition duration-300">
                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${member.avatarColor} mx-auto mb-4 flex items-center justify-center text-3xl font-bold`}>
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <h3 className="text-xl font-bold text-center mb-1">{member.name}</h3>
                                    <p className="text-blue-400 text-center mb-4">{member.role}</p>
                                    <p className="text-gray-400 text-center text-sm mb-4">{member.bio}</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {member.expertise.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-800/50 rounded-full text-xs">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Technology Stack */}
                <section className="py-20 px-4 lg:px-8 bg-gradient-to-b from-gray-900/50 to-black">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">Our Technology</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="chat_color rounded-2xl p-8">
                                <div className="text-4xl mb-4">🤖</div>
                                <h3 className="text-2xl font-bold mb-4">AI-Powered Guidance</h3>
                                <p className="text-gray-400 mb-6">
                                    Advanced natural language processing for meaningful career conversations and personalized recommendations.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MdVerified className="text-green-400" />
                                        <span>Real-time career analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MdVerified className="text-green-400" />
                                        <span>Personalized learning paths</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MdVerified className="text-green-400" />
                                        <span>Skill gap identification</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="chat_color rounded-2xl p-8">
                                <div className="text-4xl mb-4">📊</div>
                                <h3 className="text-2xl font-bold mb-4">Real-Time Data</h3>
                                <p className="text-gray-400 mb-6">
                                    Aggregating millions of job listings and career trends to provide up-to-date market insights.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MdVerified className="text-green-400" />
                                        <span>Live job market analysis</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MdVerified className="text-green-400" />
                                        <span>Salary trend monitoring</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MdVerified className="text-green-400" />
                                        <span>Industry demand tracking</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="chat_color rounded-2xl p-8">
                                <div className="text-4xl mb-4">⚡</div>
                                <h3 className="text-2xl font-bold mb-4">Modern Stack</h3>
                                <p className="text-gray-400 mb-6">
                                    Built with cutting-edge technologies for performance, scalability, and user experience.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <MdVerified className="text-green-400" />
                                        <span>React & Tailwind CSS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MdVerified className="text-green-400" />
                                        <span>Django REST Framework</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MdVerified className="text-green-400" />
                                        <span>OpenAI Integration</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Journey Timeline */}
                <section className="py-20 px-4 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-4xl font-bold text-center mb-12">Our Journey</h2>
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 hidden lg:block"></div>
                            
                            {milestones.map((milestone, index) => (
                                <div key={index} className={`flex flex-col lg:flex-row items-center mb-12 lg:mb-20 ${index % 2 === 0 ? 'lg:flex-row-reverse' : ''}`}>
                                    <div className="lg:w-1/2 lg:px-8 mb-6 lg:mb-0">
                                        <div className="chat_color rounded-2xl p-6">
                                            <div className="text-sm text-blue-400 font-semibold mb-2">{milestone.year}</div>
                                            <h3 className="text-2xl font-bold mb-3">{milestone.event}</h3>
                                            <p className="text-gray-400">{milestone.description}</p>
                                        </div>
                                    </div>
                                    <div className="lg:w-1/2 flex justify-center lg:justify-center">
                                        <div className="relative">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-4 border-black"></div>
                                        </div>
                                    </div>
                                    <div className="lg:w-1/2 lg:px-8 text-center lg:text-left">
                                        <div className="text-6xl mb-4">{
                                            index === 0 ? '🚀' :
                                            index === 1 ? '📈' :
                                            index === 2 ? '💼' : '⚡'
                                        }</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 lg:px-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-6">Start Your Career Journey Today</h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of users who have found their career path with intelligent AI guidance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/jobs" className="btn text-black px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition">
                                Explore Careers
                            </Link>
                            <Link to="/chat" className="px-8 py-3 rounded-lg font-semibold text-lg border-2 border-blue-500 text-blue-400 hover:bg-blue-500/10 transition">
                                Chat with AI Advisor
                            </Link>
                        </div>
                        <div className="mt-12 flex items-center justify-center gap-2 text-gray-400">
                            <FaHeart className="text-red-400 animate-pulse" />
                            <span>Built with passion for career empowerment</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}