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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-white font-semibold">{job.title}</h3>
            <p className="text-blue-400 text-sm">{job.company?.display_name}</p>

            <p className="text-gray-400 text-sm">
                📍 {job.location?.display_name}
            </p>

            {salary && <p className="text-green-400">{salary}</p>}

            <p className="text-gray-500 text-sm">{getDescription(job)}</p>

            <a
                href={job.redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn text-black px-4 py-2 rounded-lg"
            >
                View Details
            </a>
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
    }, [currentPage, submitted]);

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
        <div className="min-h-screen bg-black text-white p-6">
            <Navbar />

            <h1 className="text-3xl font-bold mb-6">Jobs</h1>

            <form onSubmit={handleSearch} className="flex gap-4 mb-6">
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="p-2 rounded bg-gray-800"
                />

                {/* <input
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    className="p-2 rounded bg-gray-800"
                /> */}

                <select
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    className="p-2 rounded bg-gray-800"
                >
                    {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                </select>

                <button className="btn px-4 text-black py-2 rounded">
                    Search
                </button>
            </form>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-400">{error}</p>}

            <div className="grid grid-cols-3 gap-4">
                {jobs.map(job => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
}
