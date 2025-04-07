const mongoose=require('mongoose')
const weatherSearchSchema = new mongoose.Schema({
    location: String,
    startDate: Date,
    endDate: Date,
    forecastData: Object,
    createdAt: { type: Date, default: Date.now },
  });
module.exports=mongoose.model('weatherRequest', weatherSearchSchema)