import logo from './logo.svg';
import axios from 'axios'
import './App.css';
import countries from './CountryCodes';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import React, { useState, useEffect } from 'react';
const libraries = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};
const center = { lat: 37.7749, lng: -122.4194 };
const API_URL="http://localhost:5000/api/weather"
function App() {
  const [location, setLocation]=useState('')
  const [weatherData, setWeatherData]=useState([])
  const [locationInput, setLocationInput] = useState('');
  const [startDate, setStartDate]=useState('')
  const [endDate, setEndDate]=useState('')
  const [editingId, setEditingId]=useState(null)
  const [mapCoords, setMapCoords] = useState(null);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const detectLatLonFromZip = async (zipcode) => {
    // List of countries to try
    const GEO_API_KEY = process.env.REACT_APP_GEO_API_KEY;

    

    // 1. First try US first explicitly
    try {
      const res = await axios.get(`https://api.zippopotam.us/US/${zipcode}`);
      const place = res.data.places[0];
      return {
        lat: parseFloat(place.latitude),
        lon: parseFloat(place.longitude),
      };
    } catch (_) {}
    // 2. Try OpenWeather with CN hint
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
    
    // 1. Coordinate input (e.g., "39.90, 116.39")
    const coordMatch=input.trim().match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/)
    if(coordMatch){
      return {lat: parseFloat(coordMatch[1]), lon: parseFloat(coordMatch[3])}
    }
    // 2. Search by zip
    const zipRegex = /^\d{5,6}$/;
    if (zipRegex.test(input.trim())) {
      // Try Zippopotam API for country detection
      const zipInfo = await detectLatLonFromZip(input.trim())
      if (zipInfo) return zipInfo;
    }
    // 3. Search by landmark, city, etc.
    try {
      const OPENCAGE_API_KEY=process.env.REACT_APP_OPENCAGE_API_KEY
      // console.log(`opencage api key: ${OPENCAGE_API_KEY}`)
      const openCageRes = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(input)}&key=${OPENCAGE_API_KEY}&limit=1`);
      if (openCageRes.data.results.length > 0) {
        const { lat, lng } = openCageRes.data.results[0].geometry;
        return { lat, lon: lng };
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
    throw new Error('Could not resolve location.');
  }

  const fetchWeather=async()=>{
    try{
      const response=await axios.get(API_URL)
      setWeatherData(response.data)
      
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
    // console.log(`basic info: ${location} ${startDate} ${endDate}`)
    
    try {
      const {lat, lon}=await resolveLocation(location)
      // console.log(`latitide longtitide${lat}, ${lon}`)
      const coords=`${lat}, ${lon}`
      if (editingId) {
        console.log(`basic info in editingID: ${coords} ${startDate} ${endDate} ${locationInput}`)
        await axios.put(`${API_URL}/${editingId}`, { location:coords, startDate, endDate, locationInput });
        setEditingId(null);
      } else {
        console.log(`basic info in post: ${coords} ${startDate} ${endDate} ${locationInput}`)
        await axios.post(API_URL, { location:coords, startDate, endDate, locationInput});
      }
      setMapCoords({lat, lon});
      setLocation('');
      setDefaultDates()
      fetchWeather()
    } catch (err) {
      alert('Location not found or invalid input');
    }
  }
  const handleMapClick = (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();
    setMapCoords({ lat: clickedLat, lon: clickedLng });
    setLocation(`${clickedLat}, ${clickedLng}`);
    setLocationInput(`${clickedLat}, ${clickedLng}`);
  };
  const handleEdit=(item)=>{
    setLocation(item.location)
    // setStartDate(item.startDate.slice(0, 10))
    // setEndDate(item.endDate.slice(0, 10))
    setEditingId(item._id)
  }
  const handleExport=()=>{
    const jsonData=JSON.stringify(weatherData, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `weather_export_${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
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
          if (city) {
            setLocation(city);
            setLocationInput(city);
            setMapCoords({ lat: latitude, lon: longitude }); 
          }
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
      <p style={{ fontStyle: "italic", fontSize: "0.9em" }}>by Ranxin Li</p>
      <button
        onClick={() =>
          window.open("https://www.linkedin.com/school/pmaccelerator/", "_blank")
        }
        className="info-button"
      >
        ℹ️ PM Accelerator Info
      </button>
      
      <h2>📜 Saved Forecast Requests</h2>
      <div className="weather-chat">
        <div className="messages">
          {weatherData.map((item) => (
            <div key={item._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
              <p><strong> Location:</strong> {item.locationInput}</p>
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
                        <img 
                          src={`http://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`} 
                          alt={entry.weather[0].description} 
                          style={{ width: '40px', verticalAlign: 'middle', marginLeft: '10px' }} 
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {isLoaded && mapCoords && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={10}
              center={{ lat: mapCoords.lat, lng: mapCoords.lon }}
              onClick={handleMapClick}
            >
              <Marker position={{ lat: mapCoords.lat, lng: mapCoords.lon }} />
            </GoogleMap>
          )}
      </div>
      <div className="input-container">
        <form onSubmit={handleSubmit} className="location-form">
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value)
              setLocationInput(e.target.value)
            }}
            placeholder="Enter Location"
            className="location-input"
            
          />
          <button type="submit" className="submit-btn">Submit</button>
        </form>
          <div className="button-row">
            <button className="export-button" onClick={handleExport}>Export as JSON</button>
          </div>
      </div>
    </div>
  );
}

export default App;
