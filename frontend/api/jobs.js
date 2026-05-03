export default async function handler(req, res) {
    const {
        query = "software engineer",
        location = "",
        page = 1,
        country = "us",
        results_per_page = 20
    } = req.query;

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${process.env.ADZUNA_ID}&app_key=${process.env.ADZUNA_KEY}&what=${query}&where=${location}&results_per_page=${results_per_page}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.status(200).json(data);
    } catch {
        res.status(500).json({ error: "API failed" });
    }
}
