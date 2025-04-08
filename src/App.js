import logo from './logo.svg';
import axios from 'axios'
import './App.css';
import countries from './CountryCodes';

import React, { useState, useEffect } from 'react';

const API_URL="http://localhost:5000/api/weather"
function App() {
  const [location, setLocation]=useState('')
  const [weatherData, setWeatherData]=useState([])
  // const [history, setHistory]=useState([])
  const [startDate, setStartDate]=useState('')
  const [endDate, setEndDate]=useState('')
  const [editingId, setEditingId]=useState(null)
  const detectLatLonFromZip = async (zipcode) => {
    // List of countries to try
    const GEO_API_KEY = process.env.REACT_APP_GEO_API_KEY;

    // // 1. Try OpenWeather direct API (global search)
    // try {
    //   const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${zipcode}&limit=1&appid=${GEO_API_KEY}`;
    //   const res = await axios.get(geoUrl);
    //   const place = res.data[0];
    //   if (place) {
    //     return { lat: parseFloat(place.lat), lon: parseFloat(place.lon) };
    //   }
    // } catch (_) {}

    // 2. First try US first explicitly
    try {
      const res = await axios.get(`https://api.zippopotam.us/US/${zipcode}`);
      const place = res.data.places[0];
      return {
        lat: parseFloat(place.latitude),
        lon: parseFloat(place.longitude),
      };
    } catch (_) {}
    // 1. Try OpenWeather with CN hint
  try {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${zipcode},CN&limit=1&appid=${GEO_API_KEY}`;
    const res = await axios.get(geoUrl);
    const place = res.data[0];
    if (place) {
      return { lat: parseFloat(place.lat), lon: parseFloat(place.lon) };
    }
  } catch (err) {
    console.warn(`OpenWeather CN query failed for ${zipcode}:`, err.message);
  }

    // 3. Try other countries if US fails
    for (const country of countries) {
      if (country === 'US') continue; // already tried
      try {
        const res = await axios.get(`https://api.zippopotam.us/${country}/${zipcode}`);
        const place = res.data.places[0];
        return {
          lat: parseFloat(place.latitude),
          lon: parseFloat(place.longitude),
        };
      } catch (_) {}
    }

    // 4. Nothing worked
    throw new Error('Could not resolve location from ZIP');
  };
  
  const resolveLocation=async(input)=>{
    const GEO_API_KEY=process.env.REACT_APP_GEO_API_KEY
    const coordMatch=input.trim().match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/)
    if(coordMatch){
      return {lat: parseFloat(coordMatch[1]), lon: parseFloat(coordMatch[3])}
    }
    const zipRegex = /^\d{5,6}$/;
    if (zipRegex.test(input.trim())) {
      // Try Zippopotam API for country detection
      const zipInfo = await detectLatLonFromZip(input.trim());
      if (zipInfo) return zipInfo;
    }
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(input)}&limit=1&appid=${GEO_API_KEY}`;
    const geoRes = await axios.get(geoUrl);
    if (geoRes.data && geoRes.data.length > 0) {
      const { lat, lon } = geoRes.data[0];
      return { lat, lon };
    }
    throw new Error('Could not resolve location.');
  }
  const fetchWeather=async()=>{
    try{
      const response=await axios.get(API_URL)
      
      setWeatherData(response.data)
      // fetchHistory()
    }
    catch(error){
      alert("City is not found")
    }
  }
  const handleDelete=async(id)=>{
    await axios.delete(`${API_URL}/${id}`)
    fetchWeather()
  }
  const setDefaultDates=()=>{
    const today=new Date()
    const future=new Date()
    future.setDate(today.getDate()+5)
    setStartDate(today.toISOString().slice(0, 10))
    setEndDate(future.toISOString().slice(0, 10))
  }
  const handleSubmit=async(e)=>{
    e.preventDefault()
    console.log(`basic info: ${location} ${startDate} ${endDate}`)
    if(new Date(startDate)>new Date(endDate)){
      alert('start date must before end date')
    }
    try {
      const {lat, lon}=await resolveLocation(location)
      console.log(`latitide longtitide${lat}, ${lon}`)
      const locationStr=`${lat}, ${lon}`
      if (editingId) {
        console.log(`basic info in editingID: ${locationStr} ${startDate} ${endDate}`)
        await axios.put(`${API_URL}/${editingId}`, { location:locationStr, startDate, endDate });
        setEditingId(null);
      } else {
        console.log(`basic info in post: ${locationStr} ${startDate} ${endDate}`)
        await axios.post(API_URL, { location:locationStr, startDate, endDate });
      }

      setLocation('');
      setDefaultDates()
      fetchWeather();
    } catch (err) {
      alert('Location not found or invalid input');
    }
  }
  const handleEdit=(item)=>{
    setLocation(item.location)
    setStartDate(item.startDate.slice(0, 10))
    setEndDate(item.endDate.slice(0, 10))
    setEditingId(item._id)
  }
  useEffect(() => {
    setDefaultDates()
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(async(position)=>{
        const {longitude, latitude}=position.coords
        try {
          // console.log("process.env is", process.env)
          const GEO_API_KEY=process.env.REACT_APP_GEO_API_KEY
          // console.log("default api key", GEO_API_KEY)
          const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${GEO_API_KEY}`;
          const geoRes = await axios.get(geoUrl);
          const city = geoRes.data[0]?.name;
          if (city) setLocation(city);
        } catch (err) {
          console.error('Failed to fetch city name from coordinates', err);
        }
      })
    }
    fetchWeather();
  }, []);
  return (
    <div className="App">
      <h1>Weather App</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Enter Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <button type="submit">{editingId ? 'Update' : 'Submit'}</button>
      </form>
      <h2>📜 Saved Forecast Requests</h2>
      {weatherData.map((item) => (
        <div key={item._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <p><strong> Location:</strong> {item.location}</p>
          <p><strong> Dates:</strong> {item.startDate.slice(0,10)} ➡ {item.endDate.slice(0,10)}</p>
          <button onClick={() => handleEdit(item)}>✏️ Edit</button>
          <button onClick={() => handleDelete(item._id)}>🗑️ Delete</button>

          {item.forecastData && item.forecastData.length > 0 && (
            <div>
              <h4> Forecast:</h4>
              <ul>
                {item.forecastData.map((entry, idx) => (
                  <li key={idx}>
                    {entry.dt_txt}: {entry.main.temp}°C - {entry.weather[0].description}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
