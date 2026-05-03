import { useState, useEffect, useCallback } from 'react';
import shadow1 from '../assets/s1.png';
import Navbar from './Navbar';

// ─── Adzuna Credentials ───────────────────────────────────────────────────────
const ADZUNA_APP_ID  = '69cf489d';
const ADZUNA_APP_KEY = 'fc11d0a0c326a4b958531d0c684992f6';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job }) {
    const salary = formatSalary(job.salary_min, job.salary_max);
    const badge  = contractBadge(job);

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 hover:border-blue-500/50 hover:bg-gray-800/60 transition-all duration-200">
            {/* Top row */}
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base leading-snug line-clamp-2">
                        {job.title}
                    </h3>
                    <p className="text-blue-400 text-sm font-medium mt-0.5 truncate">
                        {job.company?.display_name || 'Company not specified'}
                    </p>
                </div>
                {job.category?.label && (
                    <span className="shrink-0 text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {job.category.label}
                    </span>
                )}
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-1.5 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                    <LocationIcon />
                    {job.location?.display_name || 'Location not specified'}
                </span>
                {badge && (
                    <span className="flex items-center gap-2">
                        <BriefcaseIcon />
                        {badge}
                    </span>
                )}
                <span className="flex items-center gap-2">
                    <CalendarIcon />
                    Posted {formatDate(job.created)}
                </span>
                {salary && (
                    <span className="flex items-center gap-2 text-emerald-400 font-medium">
                        <SalaryIcon />
                        {salary}
                    </span>
                )}
            </div>

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">
                {getDescription(job)}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <a
                    href={job.redirect_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-150"
                >
                    View Details →
                </a>
                <button className="text-gray-500 hover:text-white text-sm transition-colors duration-150">
                    Save
                </button>
            </div>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, totalResults, onPageChange }) {
    if (totalPages <= 1) return null;

    const maxButtons = 5;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end   = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    const Btn = ({ page, label, disabled, active }) => (
        <button
            onClick={() => !disabled && onPageChange(page)}
            disabled={disabled}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                    ? 'bg-blue-600 text-white'
                    : disabled
                    ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {label ?? page}
        </button>
    );

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-10">
            <Btn page={currentPage - 1} label="← Prev" disabled={currentPage === 1} />

            {start > 1 && (
                <>
                    <Btn page={1} />
                    {start > 2 && <span className="text-gray-600 px-1">…</span>}
                </>
            )}

            {pages.map((p) => (
                <Btn key={p} page={p} active={p === currentPage} />
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span className="text-gray-600 px-1">…</span>}
                    <Btn page={totalPages} />
                </>
            )}

            <Btn page={currentPage + 1} label="Next →" disabled={currentPage === totalPages} />

            {totalResults > 0 && (
                <span className="ml-4 text-gray-500 text-sm">
                    Page {currentPage} / {totalPages} &nbsp;·&nbsp; {totalResults.toLocaleString()} jobs
                </span>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Jobs() {
    const [jobs, setJobs]                 = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [currentPage, setCurrentPage]   = useState(1);
    const [totalPages, setTotalPages]     = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // Input fields (controlled — do NOT trigger fetches on change)
    const [searchInput,   setSearchInput]   = useState('software engineer');
    const [locationInput, setLocationInput] = useState('');
    const [sortInput,     setSortInput]     = useState('relevance');
    const [countryInput,  setCountryInput]  = useState('us');

    // Submitted state — fetch only fires when this changes (on form submit)
    const [submitted, setSubmitted] = useState({
        query:    'software engineer',
        location: '',
        sort:     'relevance',
        country:  'us',
    });

    const fetchJobs = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            // Adzuna endpoint: /v1/api/jobs/{country}/search/{page}  (1-indexed)
            const base = `https://api.adzuna.com/v1/api/jobs/${submitted.country}/search/${page}`;

            const params = new URLSearchParams({
                app_id:           ADZUNA_APP_ID,
                app_key:          ADZUNA_APP_KEY,
                results_per_page: RESULTS_PER_PAGE,
                sort_by:          submitted.sort,
                content_type:     'application/json',
                ...(submitted.query    && { what:  submitted.query }),
                ...(submitted.location && { where: submitted.location }),
            });

            const response = await fetch(`${base}?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Adzuna API error: ${response.status}`);
            }

            const data = await response.json();

            if (data?.results?.length) {
                setJobs(data.results);
                setTotalResults(data.count ?? 0);
                setTotalPages(Math.max(1, Math.ceil((data.count ?? 0) / RESULTS_PER_PAGE)));
            } else {
                setJobs([]);
                setTotalPages(1);
                setTotalResults(0);
            }
        } catch (err) {
            console.error('fetchJobs error:', err);
            setError('Could not reach the Adzuna API. Please check your connection and try again.');
            setJobs([]);
            setTotalPages(1);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    }, [submitted]);

    useEffect(() => {
        fetchJobs(currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, submitted]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setSubmitted({
            query:    searchInput,
            location: locationInput,
            sort:     sortInput,
            country:  countryInput,
        });
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-black flex flex-col">
            {/* Grid background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        repeating-linear-gradient(0deg,  #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px),
                        repeating-linear-gradient(90deg, #d1d5db 0px, #d1d5db 1px, transparent 1px, transparent 100px)
                    `,
                    backgroundSize: '100px 100px',
                    opacity: 0.07,
                }}
            />

            {/* Shadow overlay */}
            <div className="fixed inset-0 z-[1] pointer-events-none">
                <img src={shadow1} alt="" className="w-full h-full object-cover opacity-70" />
            </div>

            <Navbar />

            <main className="relative z-10 flex-1 px-4 py-8 lg:px-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                            Job Listings
                        </h1>
                        <p className="text-gray-400 mt-1">Find your next career opportunity</p>
                    </div>

                    {/* Search Form */}
                    <form
                        onSubmit={handleSearch}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8"
                    >
                        <div className="flex flex-col lg:flex-row gap-4">

                            {/* Keywords */}
                            <div className="flex-1">
                                <label className="block text-white text-sm font-medium mb-2">
                                    Job Title / Keywords
                                </label>
                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="e.g. graphic designer, data scientist"
                                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                                />
                            </div>

                            {/* Location */}
                            <div className="lg:w-48">
                                <label className="block text-white text-sm font-medium mb-2">
                                    Location
                                    <span className="ml-1 text-gray-500 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    placeholder="e.g. New York, London"
                                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
                                />
                            </div>

                            {/* Country */}
                            <div className="lg:w-44">
                                <label className="block text-white text-sm font-medium mb-2">
                                    Country
                                </label>
                                <select
                                    value={countryInput}
                                    onChange={(e) => setCountryInput(e.target.value)}
                                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort */}
                            <div className="lg:w-40">
                                <label className="block text-white text-sm font-medium mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={sortInput}
                                    onChange={(e) => setSortInput(e.target.value)}
                                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="date">Most Recent</option>
                                    <option value="salary">Salary</option>
                                </select>
                            </div>

                            {/* Submit */}
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full lg:w-auto bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-150"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Active filter tags */}
                        {(submitted.query || submitted.location) && (
                            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                {submitted.query && (
                                    <span className="bg-blue-900/40 border border-blue-700/50 text-blue-300 px-3 py-1 rounded-full">
                                        🔍 {submitted.query}
                                    </span>
                                )}
                                {submitted.location && (
                                    <span className="bg-blue-900/40 border border-blue-700/50 text-blue-300 px-3 py-1 rounded-full">
                                        📍 {submitted.location}
                                    </span>
                                )}
                                <span className="bg-gray-800 border border-gray-700 text-gray-400 px-3 py-1 rounded-full">
                                    🌍 {COUNTRIES.find(c => c.code === submitted.country)?.label}
                                </span>
                            </div>
                        )}
                    </form>

                    {/* Error banner */}
                    {error && (
                        <div className="flex items-start gap-3 bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm">
                            <span className="mt-0.5">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-64 gap-4">
                            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400 text-sm">Loading job listings…</p>
                        </div>

                    ) : jobs.length === 0 ? (
                        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-2xl">
                            <p className="text-4xl mb-4">🔍</p>
                            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
                            <p className="text-gray-400 text-sm">
                                Try a different keyword, broader location, or switch country.
                            </p>
                        </div>

                    ) : (
                        <>
                            {/* Results meta */}
                            <div className="flex flex-wrap justify-between items-center mb-5 gap-2">
                                <p className="text-gray-400 text-sm">
                                    Showing <span className="text-white font-medium">{jobs.length}</span> of{' '}
                                    <span className="text-white font-medium">{totalResults.toLocaleString()}</span> jobs
                                    {submitted.query && (
                                        <> for <span className="text-white font-medium">"{submitted.query}"</span></>
                                    )}
                                    {submitted.location && (
                                        <> in <span className="text-white font-medium">{submitted.location}</span></>
                                    )}
                                </p>
                                <p className="text-gray-600 text-xs">Powered by Adzuna</p>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                                {jobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalResults={totalResults}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-800">
                        <p className="text-gray-600 text-sm">
                            Job data sourced from{' '}
                            <a
                                href="https://www.adzuna.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                Adzuna
                            </a>
                            . Click "View Details" to see the full listing on the original job board.
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const LocationIcon = () => (
    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const BriefcaseIcon = () => (
    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
);

const SalaryIcon = () => (
    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
    </svg>
);
