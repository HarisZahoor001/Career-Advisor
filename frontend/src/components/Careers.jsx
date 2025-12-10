import { useState, useEffect } from "react"
import api from "../api"


export default function Careers() {

    const [careers, setCareers] = useState(null)

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const response = await api.get('/careers/');
                setCareers(response.data);
                console.log('Fetched user:', response.data);
            } catch (err) {
                console.error('Failed to fetch user info', err);
            }
        };
        fetchCareers();
    }, []);
    return (
        <div className="flex flex-col p-20">
            <h1 className="text-white font-bold text-3xl">Careers</h1>
            <div className="flex flex-row mt-10">
                {
                    careers?.map((items)=>(<div className="flex flex-col justify-center items-end w-[300px] h-[400px] chat_color rounded-2xl p-4">
                    <h1 className="text-white text-xl">{items.name}</h1>
                    <p className="text-white">
                        {items.description}
                    </p>
                </div>))
                }
            </div>
        </div>
    )
}
