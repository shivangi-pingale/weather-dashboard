import express from "express";
import axios from "axios"; 
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const openweathermap_API_key = process.env.OPENWEATHER_API_KEY;
const geoapify_API_key = process.env.GEOAPIFY_API_KEY;
let units = "metric";

app.use(express.static("\public"));

app.get("/", async (req, res) => {
    console.log("OpenWeatherMap key: ",openweathermap_API_key);
    const { lat, lon } = req.query;

    // first visit (no location yet)
    if (!lat || !lon) {
        return res.render("index.ejs", {
            data: null,
            aqiData: null,
            timezone: null
        });
    }
    try{
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openweathermap_API_key}&units=${units}`);
        const aqiResponse = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${openweathermap_API_key}`);
        const geoResponse = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${geoapify_API_key}`);
        const timezone = geoResponse.data.features[0].properties.timezone.name;

        console.log("API response:", response.data);
        console.log("AQI response", aqiResponse.data);
        res.render("index.ejs",{data: response.data, 
            aqiData: aqiResponse.data, 
            timezone:timezone, geoData: 
            geoResponse.data,
            lat,
            lon
        });
    } catch(error){
        console.error(`Error: ${error}`);
        res.render("index.ejs", {
            data: null,
            aqiData: null,
            timezone: null
        });
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})