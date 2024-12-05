import axios from "axios";
import ApiStatus from "./api-status-schema.js";
import dotenv from "dotenv";

dotenv.config();

const baseURL = process.env.API_URL;

// data types for each params
// type must be movie or show
// tmdbId must be a string
// title must be a string
// releaseYear must be a number
// season must be a string
// episode must be a string

const routes = [
    { name: "RSMX", url: "/rsmx/scrape", params: { type: "movie", tmdbId: "299534" } },
    { name: "IUMX", url: "/iumx/scrape", params: { type: "movie", tmdbId: "299534" } },
    { name: "CFMX", url: "/cfmx/scrape", params: { type: "movie", tmdbId: "299534", title: "avengers endgame", releaseYear: 2019 } },
    { name: "AFMX", url: "/afmx/scrape", params: { type: "movie", tmdbId: "299534", title: "avengers endgame", releaseYear: 2019 } },
    { name: "TASF", url: "/tasf/scrape", params: { type: "movie", tmdbId: "299534" } },
    { name: "ESMX", url: "/esmx/scrape", params: { type: "movie", tmdbId: "299534" } },
    { name: "AEMX", url: "/aemx/scrape", params: { type: "movie", tmdbId: "299534" } },
];

export async function checkApiStatus() {
    const apiStatuses = [];
    const timeout = 20000; // 20 seconds
    for (const route of routes) {
        try {
            const response = await axios.get(`${baseURL}${route.url}`, { params: route.params, timeout: timeout });
            apiStatuses.push({
                routeName: route.name,
                working: response.status === 200,
                lastUpdated: new Date(),
            });
        } catch (err) {
            const isTimeoutError = err.code === "ECONNABORTED";
            let errorMessage = isTimeoutError ? "Request timed out when fetching status!" : err.message;
            
            if (err.response && err.response.data && err.response.data.error) {
                errorMessage = err.response.data.error;
            } else if (err.response && err.response.data) {
                errorMessage = JSON.stringify(err.response.data);
            }
            
            apiStatuses.push({
                routeName: route.name,
                working: false,
                lastUpdated: new Date(),
                error: errorMessage,
            })
        }
    }

    return apiStatuses;
};

export async function saveApiStatus(apiStatuses) {
    try {
        await ApiStatus.deleteMany({});
        await ApiStatus.insertMany(apiStatuses);
        console.log("API status saved successfully!");
    } catch (err) {
        console.error("Error saving API status:", err);
    }
}