import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Careers() {
    const [careers, setCareers] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const res = await api.get("/careers/");
                setCareers(res.data);
            } catch (err) {
                console.log("Error fetching careers", err);
            }
        };

        fetchCareers();
    }, []);

    return (
        <div className="flex flex-col p-20 relative z-20">
            <h1 className="text-white font-bold text-3xl">Careers</h1>

            <div className="flex flex-row mt-10 gap-6 flex-wrap">
                {careers.map((item) => (
                    <div
                        key={item.id}
                        className="flex flex-col justify-between w-[300px] h-[400px] chat_color rounded-2xl p-4"
                    >
                        <h1 className="text-white text-xl">{item.name}</h1>

                        <p className="text-white flex-1 mt-2 overflow-auto">
                            {item.description}
                        </p>

                        <button
                            onClick={() =>
                                navigate(`/chat?career=${encodeURIComponent(item.name)}`)
                            }
                            className="mt-4 btn text-black px-4 py-2 rounded-lg hover:bg-gray-200"
                        >
                            Learn More →
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
