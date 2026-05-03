import { useState, useEffect, useCallback } from 'react';
import shadow1 from '../assets/s1.png';
import Navbar from './Navbar';

const RESULTS_PER_PAGE = 20;

const COUNTRIES = [
    { code: 'us', label: 'United States' },
    { code: 'gb', label: 'United Kingdom' },
    { code: 'ca', label: 'Canada' },
    { code: 'au', label: 'Australia' },
    { code: 'de', label: 'Germany' },
    { code: 'fr', label: 'France' },
    { code: 'in', label: 'India' },
    { code: 'sg', label: 'Singapore' },
    { code: 'nl', label: 'Netherlands' },
    { code: 'br', label: 'Brazil' },
];

// ─── Helpers ─────────────────────────────────────────
const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    } catch {
        return 'Invalid date';
    }
};

const formatSalary = (min, max) => {
    if (!min && !max) return null;
    const fmt = (n) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency', currency: 'USD',
            minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(n);
    if (min && max) return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max)}`;
};

const getDescription = (job) => {
    if (!job.description) return 'No description available.';
    const plain = job.description.replace(/<[^>]*>/g, '');
    return plain.length > 220 ? plain.substring(0, 220) + '…' : plain;
};

const contractBadge = (job) => {
    const parts = [];
    if (job.contract_time) parts.push(job.contract_time.replace('_', ' '));
    if (job.contract_type) parts.push(job.contract_type);
    return parts.length ? parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' · ') : null;
};

// ─── Job Card ─────────────────────────────────────────
function JobCard({ job }) {
    const salary = formatSalary(job.salary_min, job.salary_max);
    const badge  = contractBadge(job);

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 hover:border-green-500/30 transition-all duration-300">
            <h3 className="text-white font-semibold text-base sm:text-lg line-clamp-2">{job.title}</h3>
            <p className="text-green-400 text-xs sm:text-sm">{job.company?.display_name}</p>

            <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-1">
                <span>📍</span> {job.location?.display_name}
            </p>

            {salary && <p className="text-green-400 text-sm sm:text-base font-medium">{salary}</p>}

            <p className="text-gray-500 text-xs sm:text-sm line-clamp-3">{getDescription(job)}</p>

            <a
                href={job.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-black px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base text-center hover:opacity-90 transition-all duration-300"
            >
                View Details
            </a>
        </div>
    );
}

// ─── Pagination Component ────────────────────────────
function Pagination({ currentPage, totalResults, resultsPerPage, onPageChange }) {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    
    if (totalPages <= 1) return null;
    
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };
    
    return (
        <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all text-sm sm:text-base"
            >
                Previous
            </button>
            
            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    className={`px-3 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                        currentPage === page
                            ? 'btn text-black'
                            : page === '...' 
                            ? 'bg-transparent cursor-default' 
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                    }`}
                    disabled={page === '...'}
                >
                    {page}
                </button>
            ))}
            
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all text-sm sm:text-base"
            >
                Next
            </button>
        </div>
    );
}

// ─── Loading Skeleton ─────────────────────────────────
function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 sm:p-6 animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-700 rounded mb-3 w-3/4"></div>
                    <div className="h-3 sm:h-4 bg-gray-700 rounded mb-2 w-1/2"></div>
                    <div className="h-3 sm:h-4 bg-gray-700 rounded mb-4 w-2/3"></div>
                    <div className="h-3 sm:h-4 bg-gray-700 rounded mb-2 w-full"></div>
                    <div className="h-3 sm:h-4 bg-gray-700 rounded mb-4 w-5/6"></div>
                    <div className="h-8 sm:h-10 bg-gray-700 rounded w-full"></div>
                </div>
            ))}
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────
export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    const [searchInput, setSearchInput] = useState('software engineer');
    const [locationInput, setLocationInput] = useState('');
    const [countryInput, setCountryInput] = useState('us');

    const [submitted, setSubmitted] = useState({
        query: 'software engineer',
        location: '',
        country: 'us',
    });

    // ✅ FIXED FETCH (calls your backend)
    const fetchJobs = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page,
                country: submitted.country,
                results_per_page: RESULTS_PER_PAGE,
                ...(submitted.query && { query: submitted.query }),
                ...(submitted.location && { location: submitted.location }),
            });

            const response = await fetch(`/api/jobs?${params.toString()}`);

            if (!response.ok) throw new Error("API error");

            const data = await response.json();

            setJobs(data.results || []);
            setTotalResults(data.count || 0);

        } catch (err) {
            console.error(err);
            setError("Failed to load jobs");
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [submitted]);

    useEffect(() => {
        fetchJobs(currentPage);
    }, [currentPage, submitted, fetchJobs]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setSubmitted({
            query: searchInput,
            location: locationInput,
            country: countryInput,
        });
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-x-hidden">
            {/* Grid Background */}
            <div
                className="fixed inset-0 -z-20"
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
            <div className="fixed inset-0 -z-10">
                <img src={shadow1} alt="Shadow Overlay" className="w-full h-full object-cover opacity-70" />
            </div>

            <div className="relative">
                <Navbar />

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 lg:mb-10">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
                            Find Your Dream Job
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base mt-2">
                            Discover thousands of opportunities worldwide
                        </p>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-8 sm:mb-10">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="flex-1">
                                <input
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Job title, keywords, or company"
                                    className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 border border-gray-700 focus:border-transparent transition-all text-sm sm:text-base"
                                />
                            </div>
                            
                            <div className="flex-1">
                                <input
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    placeholder="City, state, or remote"
                                    className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 border border-gray-700 focus:border-transparent transition-all text-sm sm:text-base"
                                />
                            </div>
                            
                            <div className="sm:w-48">
                                <select
                                    value={countryInput}
                                    onChange={(e) => setCountryInput(e.target.value)}
                                    className="w-full p-3 sm:p-4 rounded-lg bg-gray-900/70 text-white outline-none focus:ring-2 focus:ring-green-500 border border-gray-700 focus:border-transparent transition-all text-sm sm:text-base cursor-pointer"
                                >
                                    {COUNTRIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <button className="btn text-black px-6 sm:px-8 py-3 sm:p-4 rounded-lg font-semibold hover:opacity-90 transition-all duration-300">
                                Search Jobs
                            </button>
                        </div>
                    </form>

                    {/* Results Count */}
                    {!loading && !error && jobs.length > 0 && (
                        <div className="mb-4 sm:mb-6 text-gray-400 text-sm sm:text-base">
                            Found <span className="text-green-400 font-semibold">{totalResults}</span> jobs
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && <LoadingSkeleton />}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-12 sm:py-20">
                            <div className="text-red-400 text-base sm:text-lg mb-4">{error}</div>
                            <button 
                                onClick={() => fetchJobs(currentPage)}
                                className="btn text-black px-6 py-2 rounded-lg"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && !error && jobs.length === 0 && (
                        <div className="text-center py-12 sm:py-20">
                            <div className="text-gray-400 text-base sm:text-lg mb-4">No jobs found matching your criteria</div>
                            <button 
                                onClick={() => {
                                    setSearchInput('software engineer');
                                    setLocationInput('');
                                    setCountryInput('us');
                                    handleSearch(new Event('submit'));
                                }}
                                className="btn text-black px-6 py-2 rounded-lg"
                            >
                                Reset Search
                            </button>
                        </div>
                    )}

                    {/* Jobs Grid - Responsive */}
                    {!loading && !error && jobs.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {jobs.map(job => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalResults={totalResults}
                                resultsPerPage={RESULTS_PER_PAGE}
                                onPageChange={setCurrentPage}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
