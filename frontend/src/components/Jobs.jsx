import { useState, useEffect } from 'react';
import shadow1 from '../assets/s1.png';
import Navbar from './Navbar';

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [searchQuery, setSearchQuery] = useState('software engineer');
    const [location, setLocation] = useState('');
    const [sortBy, setSortBy] = useState('relevance');
    const resultsPerPage = 20;

    const fetchJobs = async (page = 1) => {
        setLoading(true);
        setError(null);
        
        try {
            // Using The Muse API - CORS enabled and free
            const baseUrl = 'https://www.themuse.com/api/public/jobs';
            
            // Build query parameters
            const params = new URLSearchParams({
                page: page,
                descending: 'true',
                ...(searchQuery && { search: searchQuery }),
                ...(location && { location: location }),
                results_per_page: resultsPerPage
            });

            const response = await fetch(`${baseUrl}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.results) {
                // Transform Muse API data to match your component's expected format
                const transformedJobs = data.results.map(job => ({
                    id: job.id,
                    title: job.name,
                    company: { display_name: job.company.name },
                    location: { 
                        display_name: job.locations && job.locations.length > 0 
                            ? job.locations.map(loc => loc.name).join(', ') 
                            : 'Remote / Anywhere' 
                    },
                    description: job.contents ? job.contents.replace(/<[^>]*>/g, '').substring(0, 300) + '...' : 'No description available',
                    salary_min: 0, // Muse API doesn't provide salary
                    salary_max: 0,
                    salary_currency: 'USD',
                    created: job.publication_date,
                    redirect_url: job.refs.landing_page,
                    category: { 
                        label: job.categories && job.categories.length > 0 
                            ? job.categories[0].name 
                            : 'IT Jobs' 
                    },
                    levels: job.levels && job.levels.length > 0 ? job.levels[0].name : 'Not specified',
                    publication_date: new Date(job.publication_date).toLocaleDateString()
                }));
                
                setJobs(transformedJobs);
                setTotalResults(data.total || 0);
                
                // Calculate total pages
                const total = data.total || 0;
                const calculatedPages = Math.ceil(total / resultsPerPage);
                setTotalPages(calculatedPages);
            } else {
                setJobs([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setError('Unable to fetch jobs. Please try again later.');
            setJobs(getMockJobs());
            setTotalPages(5);
            setTotalResults(100);
        } finally {
            setLoading(false);
        }
    };

    // Mock data function as fallback
    const getMockJobs = () => {
        return [
            {
                id: '1',
                title: 'Senior Software Engineer',
                company: { display_name: 'Google' },
                location: { display_name: 'Mountain View, CA' },
                description: 'We are looking for a Senior Software Engineer to join our team. You will work on cutting-edge technologies and help shape the future of search and AI.',
                salary_min: 150000,
                salary_max: 250000,
                salary_currency: 'USD',
                created: new Date().toISOString(),
                redirect_url: 'https://www.google.com/about/careers',
                category: { label: 'Software Engineering' },
                levels: 'Senior Level',
                publication_date: new Date().toLocaleDateString()
            },
            {
                id: '2',
                title: 'Frontend Developer',
                company: { display_name: 'Microsoft' },
                location: { display_name: 'Seattle, WA' },
                description: 'Join our team to build amazing user experiences. Work with React, TypeScript, and modern web technologies to create responsive and accessible applications.',
                salary_min: 120000,
                salary_max: 180000,
                salary_currency: 'USD',
                created: new Date(Date.now() - 86400000).toISOString(),
                redirect_url: 'https://careers.microsoft.com',
                category: { label: 'Frontend Development' },
                levels: 'Mid Level',
                publication_date: new Date(Date.now() - 86400000).toLocaleDateString()
            },
            {
                id: '3',
                title: 'DevOps Engineer',
                company: { display_name: 'Amazon' },
                location: { display_name: 'Austin, TX' },
                description: 'Looking for a DevOps engineer to help scale our infrastructure. Experience with AWS, Kubernetes, Docker, and CI/CD pipelines required.',
                salary_min: 130000,
                salary_max: 190000,
                salary_currency: 'USD',
                created: new Date(Date.now() - 172800000).toISOString(),
                redirect_url: 'https://www.amazon.jobs',
                category: { label: 'DevOps' },
                levels: 'Mid Level',
                publication_date: new Date(Date.now() - 172800000).toLocaleDateString()
            },
            {
                id: '4',
                title: 'Data Scientist',
                company: { display_name: 'Meta' },
                location: { display_name: 'New York, NY' },
                description: 'Join our data science team to solve complex problems. Work with large datasets, machine learning models, and help drive business decisions.',
                salary_min: 140000,
                salary_max: 210000,
                salary_currency: 'USD',
                created: new Date(Date.now() - 259200000).toISOString(),
                redirect_url: 'https://www.metacareers.com',
                category: { label: 'Data Science' },
                levels: 'Senior Level',
                publication_date: new Date(Date.now() - 259200000).toLocaleDateString()
            },
            {
                id: '5',
                title: 'Product Manager',
                company: { display_name: 'Apple' },
                location: { display_name: 'Cupertino, CA' },
                description: 'Lead product development for consumer applications. Work with cross-functional teams to define product strategy and roadmap.',
                salary_min: 160000,
                salary_max: 240000,
                salary_currency: 'USD',
                created: new Date(Date.now() - 345600000).toISOString(),
                redirect_url: 'https://www.apple.com/careers',
                category: { label: 'Product Management' },
                levels: 'Senior Level',
                publication_date: new Date(Date.now() - 345600000).toLocaleDateString()
            }
        ];
    };

    useEffect(() => {
        fetchJobs(currentPage);
    }, [currentPage, searchQuery, location, sortBy]);

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

    const formatSalary = (min, max, currency = 'USD') => {
        if (!min && !max) return 'Salary not specified';
        
        const formatAmount = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        };

        if (min && max) {
            if (min === max) {
                return formatAmount(min);
            }
            return `${formatAmount(min)} - ${formatAmount(max)}`;
        }
        if (min) return `From ${formatAmount(min)}`;
        if (max) return `Up to ${formatAmount(max)}`;
        return 'Salary not specified';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not specified';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const getCompanyName = (job) => {
        if (job.company && job.company.display_name) {
            return job.company.display_name;
        }
        return job.company_name || 'Company not specified';
    };

    const getLocation = (job) => {
        if (job.location && job.location.display_name) {
            return job.location.display_name;
        }
        if (job.location) {
            return job.location;
        }
        return 'Location not specified';
    };

    const getDescription = (job) => {
        if (job.description) {
            // Remove HTML tags and truncate
            const plainText = job.description.replace(/<[^>]*>/g, '');
            return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
        }
        return 'No description available';
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
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
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
                        {startPage > 2 && <span className="px-2 text-white">...</span>}
                    </>
                )}
                
                {pageNumbers.map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition ${
                            currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}
                    >
                        {page}
                    </button>
                ))}
                
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-2 text-white">...</span>}
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
                
                {totalResults > 0 && (
                    <div className="ml-4 text-white">
                        Page {currentPage} of {totalPages} ({totalResults} jobs)
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-black flex flex-col">
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
                    <div className="bg-gray-900 rounded-xl p-6 mb-8">
                        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-white text-sm font-medium mb-2">Job Title / Keywords</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g., software engineer, data scientist"
                                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-white font-medium mb-2">Location (optional)</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="e.g., New York, London"
                                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-white font-medium mb-2">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-gray-800 border text-white border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="date">Most Recent</option>
                                </select>
                            </div>
                            
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition hover:bg-blue-700"
                                >
                                    Search Jobs
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
                            {error} {jobs.length > 0 && " Showing sample data."}
                        </div>
                    )}

                    {/* Jobs Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="inline-block text-white animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-400">Loading job listings...</p>
                            </div>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-12 bg-gray-900 rounded-xl">
                            <h3 className="text-xl font-medium mb-2 text-white">No jobs found</h3>
                            <p className="text-gray-400">Try adjusting your search criteria</p>
                        </div>
                    ) : (
                        <>
                            <div className="mb-4 flex text-white justify-between items-center">
                                <div className="text-white">
                                    Showing {jobs.length} jobs on page {currentPage} of {totalPages}
                                </div>
                                <div className="text-sm text-white">
                                    Powered by The Muse API
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {jobs.map((job) => (
                                    <div key={job.id} className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition border border-gray-800 hover:border-gray-700">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold mb-1 text-white">{job.title}</h3>
                                                <p className="text-blue-400 font-medium">{getCompanyName(job)}</p>
                                            </div>
                                            {job.category && (
                                                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                                    {job.category.label || 'IT Jobs'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center text-gray-300">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                <span>{getLocation(job)}</span>
                                            </div>
                                            
                                            {job.levels && (
                                                <div className="flex items-center text-gray-300">
                                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{job.levels}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center text-gray-300">
                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                <span>Posted {formatDate(job.created || job.publication_date)}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                            {getDescription(job)}
                                        </p>

                                        <div className="flex justify-between items-center">
                                            <a
                                                href={job.redirect_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-blue-700"
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
                            <h3 className="text-lg font-medium mb-2 text-white">About This Job Search</h3>
                            <p className="text-gray-400 mb-4">
                                This page uses The Muse API to display job listings. 
                                You can search for jobs by title, keyword, and location. The API provides up-to-date 
                                information from various companies.
                            </p>
                            <div className="text-sm text-gray-500">
                                Note: Some job details may be limited due to API constraints. 
                                Click "View Details" to see the full listing on the original job board.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
