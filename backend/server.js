const express=require('express')
const mongoose=require('mongoose')
const axios=require("axios")
const cors=require("cors")
require('dotenv').config({ path: __dirname + '/../.env' });


const WeatherRequest=require('./modules/WeatherRequest')

const app=express()
const PORT = process.env.BACKEND_PORT||5000;
app.use(cors())
app.use(express.json())
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
const db=mongoose.connection

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// CURD
// create and loading
app.post('/api/weather', async(req, res)=>{
    const {location, startDate, endDate, locationInput}=req.body
    console.log(`Received request body:${JSON.stringify(req.body)}`)
    if(new Date(startDate)>new Date(endDate)){
        return res.status(400).json("Start must be behind the end date")
    }
    const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
    // console.log(`api key is${apiKey}`)
    let url;
    // Match lat,lon format
    const coordMatch = location.trim().match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);

    console.log(`location is ${location}`)
    if (coordMatch) {
        console.log('coordinate match')
        const [lat, lon] = location.split(',').map(x => parseFloat(x.trim()));
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    }

    console.log(`url is ${url}`)
    try{
        const response = await axios.get(url);
        console.log(`resonse data is ${response.data}`)
        const forecastData = response.data;
        const filtered = forecastData.list.filter(entry => {
        const dt = new Date(entry.dt_txt);
            return dt >= new Date(startDate) && dt <= new Date(endDate);
          });
          
        const newRequest = new WeatherRequest({
            location,
            locationInput,
            startDate,
            endDate,
            forecastData: filtered, 
        });
        
        const saved = await newRequest.save();
        res.status(201).json(saved);
        
    }
    catch(err){
        console.error(`error msg ${err.message}`)
        return res.status(404).json({ error: 'Location not found or weather API failed', detail: err.message })
    }
})

// read
app.get('/api/weather', async(req, res)=>{
    try {
        const all = await WeatherRequest.find().sort({ createdAt: -1 });
        res.json(all);
      } catch (err) {
        res.status(500).json({ error: 'Error fetching data' });
      }
})
// update
app.put('/api/weather/:id', async(req, res)=>{
    const {location, startDate, endDate, locationInput}=req.body
    if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: 'Start date must be before end date' });
      }
    try{
        const updated = await WeatherRequest.findByIdAndUpdate(
            req.params.id,
            { location, locationInput, startDate, endDate },
            { new: true }
          );
          res.json(updated);
    }
    catch(error){
        res.status(500).json({ error: 'Error updating entry' });
    }
})

// delete
app.delete('/api/weather/:id', async(req, res)=>{
    try{
        await WeatherRequest.findByIdAndDelete(req.params.id);
        res.json({message:"delete successfully"})
    }
    catch(error){
        res.status(500).json({errMsg:`Error in deleting the entry${error}`})
    }
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

