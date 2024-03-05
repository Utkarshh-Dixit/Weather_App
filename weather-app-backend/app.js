const express = require('express');
const cors = require('cors');
const fetch = require('isomorphic-fetch');

const app = express();

app.use(cors());

const API_KEY = 'c11fe930682e3e90e384777e8dd0f947'; // Your API key from OpenWeatherMap or any other weather API

app.get('/', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    console.log('lat:', lat);
    const weatherData = await fetchWeatherData(lat, lon);
    console.log('weatherData:', weatherData);
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function fetchWeatherData(lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  console.log('data:', data);
  const currentWeather = {
    temperature: data.main.temp,
    description: data.weather[0].description,
    city: data.name,
    wind: data.wind.speed,
    date: new Date(data.dt * 1000).toLocaleDateString(),
    sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
    sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
  };

  return { currentWeather };
}

// Endpoint to fetch 5-day weather forecast
app.get('/api/fivedaysweather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const weatherData = await fetchFiveDaysWeatherData(lat, lon);
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Function to fetch 5-day weather forecast data from OpenWeatherMap API
async function fetchFiveDaysWeatherData(lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  console.log('5-day forecast data:', data);

  // Extract and process forecast data
  const forecastData = data.list.map(forecastItem => ({
    dt: forecastItem.dt,
    main: forecastItem.main,
    weather: forecastItem.weather,
    clouds: forecastItem.clouds,
    wind: forecastItem.wind,
    visibility: forecastItem.visibility,
    pop: forecastItem.pop,
    sys: forecastItem.sys,
    dt_txt: forecastItem.dt_txt,
  }));

  // Extract city information
  const cityInfo = {
    id: data.city.id,
    name: data.city.name,
    coord: data.city.coord,
    country: data.city.country,
    population: data.city.population,
    timezone: data.city.timezone,
    sunrise: new Date(data.city.sunrise * 1000).toLocaleTimeString(),
    sunset: new Date(data.city.sunset * 1000).toLocaleTimeString(),
  };

  console.log('forecastData:', forecastData);
  return { forecastData, cityInfo };
  // return { cod: data.cod, message: data.message, cnt: data.cnt, list: forecastData, city: cityInfo };
}


module.exports = app;
