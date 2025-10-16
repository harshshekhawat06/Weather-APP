import React, { useEffect, useState } from 'react'
import './Weather.css'
console.log("API KEY IS:", import.meta.env.VITE_APP_ID);


import search_icon from '../assets/search.png'
import clear_icon from '../assets/clear.png'
import cloud_icon from '../assets/cloud.png'
import drizzle_icon from '../assets/drizzle.png'
import humidity_icon from '../assets/humidity.png'
import rain_icon from '../assets/rain.png'
import snow_icon from '../assets/snow.png'
import wind_icon from '../assets/wind.png'
import sun_icon from '../assets/sun.png'
import moon_icon from '../assets/moon.jpeg'

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");


  const allIcon = {
    "01d": clear_icon, "01n": clear_icon,
    "02d": cloud_icon, "02n": cloud_icon,
    "03d": cloud_icon, "03n": cloud_icon,
    "04d": drizzle_icon, "04n": drizzle_icon,
    "09d": rain_icon, "09n": rain_icon,
    "10d": rain_icon, "10n": rain_icon,
    "13d": snow_icon, "13n": snow_icon,
  };

  const search = async (city) => {
    try {
      setLoading(true);

      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=874cd53d2438f5d92d56eaca204be26f`
      );
      const geoData = await geoRes.json();
      if (!geoData.length) throw new Error("City not found");

      const { lat, lon, name } = geoData[0];

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=874cd53d2438f5d92d56eaca204be26f`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.cod !== 200) throw new Error(data.message);

      const icon = allIcon[data.weather[0].icon] || clear_icon;

      const countryToCapital = {
        "south korea": "Seoul",
        "india": "New Delhi",
        "usa": "Washington",
        "canada": "Ottawa",
        "uk": "London",
        "australia": "Canberra",
      };
      const fallbackCity = countryToCapital[city.toLowerCase()] || city;




      setWeatherData({
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        tempreature: Math.floor(data.main.temp),
        location: name, // Use clean name from geoData
        icon,
      });

      if (!recentSearches.includes(city)) {
        const updatedSearches = [city, ...recentSearches.slice(0, 4)];
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
      }
    } catch (error) {
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      search(e.target.value);
      e.target.value = '';
    }
  };

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${import.meta.env.VITE_APP_ID}`)
        .then(res => res.json())
        .then(data => search(data.name));
    });
  };

  const handleVoiceSearch = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (event) => {
      const city = event.results[0][0].transcript;
      search(city);
    };
    recognition.start();
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    detectLocation();
  }, []);

  return (
    <div className={`weather ${darkMode ? 'dark' : ''}`}>
      <div className='top-bar'>
        <div className='search-bar'>
          <input type="text" placeholder='Search' onKeyDown={handleSearch} />
          <img src={search_icon} alt="Search" onClick={handleVoiceSearch} />
        </div>
        <button className="theme-toggle" onClick={toggleDarkMode}>
          <img src={darkMode ? sun_icon : moon_icon} alt="Toggle theme" />
        </button>
      </div>

      {loading ? (
        <div className="loader"></div>
      ) : weatherData ? (
        <>
          <img src={weatherData.icon} alt="Weather" className='weather-icon' />
          <p className='temperature'>{weatherData.tempreature}°c</p>
          <p className='location'>{weatherData.location}</p>
          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="" />
              <div>
                <p>{weatherData.humidity} %</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="" />
              <div>
                <p>{weatherData.windSpeed}km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <h3>Recent Searches</h3>
          <div className="search-tags">
            {recentSearches.map((city, i) => (
              <button key={i} onClick={() => search(city)}>{city}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
