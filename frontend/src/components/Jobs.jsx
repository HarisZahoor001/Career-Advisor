import { useState, useEffect } from 'react';
import shadow1 from '../assets/s1.png';
import Navbar from './Navbar';

export default function Jobs() {
    const APP_ID = '69cf489d';
    const API_KEY = 'fc11d0a0c326a4b958531d0c684992f6';
    
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('software engineer');
    const [location, setLocation] = useState('us');
    const resultsPerPage = 20;

    const fetchJobs = async (page = 1) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://api.adzuna.com/v1/api/jobs/${location}/search/${page}?` +
                `app_id=${APP_ID}&` +
                `app_key=${API_KEY}&` +
                `results_per_page=${resultsPerPage}&` +
                `what=${encodeURIComponent(searchQuery)}&` +
                `content-type=application/json`
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.results) {
                setJobs(data.results);
                const estimatedTotalPages = Math.ceil(1000 / resultsPerPage);
                setTotalPages(Math.min(estimatedTotalPages, 50));
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setJobs(getMockJobs());
            setTotalPages(5);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs(currentPage);
    }, [currentPage, searchQuery, location]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchJobs(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };

    const formatSalary = (min, max) => {
        if (!min && !max) return 'Salary not specified';
        if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
        if (min) return `From $${min.toLocaleString()}`;
        if (max) return `Up to $${max.toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getMockJobs = () => {
        return [
            {
                id: '1',
                title: 'Senior Software Engineer',
                company: { display_name: 'Tech Corp Inc.' },
                location: { display_name: 'San Francisco, CA' },
                description: 'Looking for a senior software engineer with 5+ years experience...',
                salary_min: 120000,
                salary_max: 180000,
                created: new Date().toISOString(),
                redirect_url: '#',
                category: { label: 'IT Jobs' }
            },
        ];
    };

    const Pagination = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
        
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="flex justify-center items-center gap-2 mt-8">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                >
                    Previous
                </button>
                
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="px-2">...</span>}
                    </>
                )}
                
                {pageNumbers.map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition ${
                            currentPage === page
                                ? 'btn text-white'
                                : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                    >
                        {page}
                    </button>
                ))}
                
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-2">...</span>}
                        <button
                            onClick={() => handlePageChange(totalPages)}
                            className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition"
                >
                    Next
                </button>
                
                <div className="ml-4 text-white">
                    Page {currentPage} of {totalPages}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-black flex flex-col">
            {/* Grid Background - FIXED POSITION */}
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

            {/* Shadow Overlay - FIXED POSITION */}
            <div className="fixed inset-0 z-1">
                <img src={shadow1} alt="Shadow Overlay" className="w-full h-full object-cover opacity-70" />
            </div>

            <div>
                <Navbar />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">Job Listings</h1>
                        <p className="text-gray-400">Find your next career opportunity</p>
                    </div>

                    {/* Search Form */}
                    <div className="chat_color rounded-xl p-6 mb-8">
                        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-white text-sm font-medium mb-2">Job Title / Keywords</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g., software engineer, data scientist"
                                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm  text-white font-medium mb-2">Location</label>
                                <select
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="bg-gray-900 border text-white border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="us">United States</option>
                                    <option value="gb">United Kingdom</option>
                                    <option value="au">Australia</option>
                                    <option value="ca">Canada</option>
                                    <option value="de">Germany</option>
                                    <option value="pk">Pakistan</option>
                                </select>
                            </div>
                            
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="btn text-black px-6 py-3 rounded-lg font-medium transition hover:opacity-90"
                                >
                                    Search Jobs
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Jobs Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="inline-block text-white animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-400">Loading job listings...</p>
                            </div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12 chat_color rounded-xl">
                            <h3 className="text-xl font-medium mb-2">No jobs found</h3>
                            <p className="text-gray-400">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex text-white justify-between items-center">
                                <div className="text-white">
                                    Showing {jobs.length} jobs on page {currentPage}
                                </div>
                                <div className="text-sm text-white">
                                    Powered by Career Advisor
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {jobs.map((job) => (
                                    <div key={job.id} className="chat_color rounded-xl p-6 hover:chat_color_hover transition border border-gray-800 hover:border-gray-700">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-1 text-white">{job.title}</h3>
                                                <p className="text-blue-400 font-medium">{job.company?.display_name}</p>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                                {job.category?.label || 'IT Jobs'}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center text-gray-300">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span>{job.location?.display_name || 'Location not specified'}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-gray-300">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4z" clipRule="evenodd" />
                                                </svg>
                                                <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-gray-300">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                <span>Posted {formatDate(job.created)}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                            {job.description || 'No description available'}
                                        </p>

                                        <div className="flex justify-between items-center">
                                            <a
                                                href={job.redirect_url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn px-4 py-2 text-black rounded-lg text-sm font-medium transition hover:opacity-90"
                                            >
                                                View Details
                                            </a>
                                            <button className="text-gray-400 hover:text-white text-sm">
                                                Save Job
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            <Pagination />
                        </>
                    )}

                    {/* API Info */}
                    <div className="mt-12 pt-8 border-t border-gray-800">
                        <div className="bg-gray-900 rounded-xl p-6">
                            <h3 className="text-lg font-medium mb-2">About This Job Search</h3>
                            <p className="text-gray-400 mb-4">
                                This page uses the Adzuna Jobs API to display real-time job listings. 
                                You can search for jobs by title, keyword, and location. The API provides up-to-date 
                                information from various job boards and company career sites.
                            </p>
                            <div className="text-sm text-gray-500">
                                Note: Some job descriptions may be truncated due to API limitations. 
                                Click "View Details" to see the full listing on the original job board.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}