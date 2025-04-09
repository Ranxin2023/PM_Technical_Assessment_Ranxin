# Weather APP
## Introduction
A full-stack weather forecasting application that allows users to:
- Search weather forecasts by location and date range
- View forecasts powered by the [OpenWeatherMap API](https://openweathermap.org/api)
- Shows 5-day weather forecasts with icons
- Uses a live Google Map to select a location
- Automatically detect user location using browser geolocation
- Store and manage past weather queries (CRUD operations)
- Built with **React**, **Node.js**, **Express**, and **MongoDB**
- Exports weather data as JSON
- Looks like a conversational weather assistant

## Features
### **Flexible location input**
- City Names: `Beijing`, `New York`, `Tokyo`
- Coordinates: `40.7128,-74.0060`
- ZIP codes: `94016`, `10001`

## Tech Stack 
### Frontend
- React (Hooks)
- Axios
- HTML/CSS

### Backend
- Node.js

- Express.js

- Axios (for server-side API fetch)

- Mongoose + MongoDB

## API Used
- OpenWeatherMap API (for weather + reverse geolocation)
## How to get each api keys
### How to get the Openweather API Key
1. Go to [Openweather Official Link](https://home.openweathermap.org/users/sign_up)
2. Click **Sign Up** or **Log In**
3. Visit the [API Keys](https://home.openweathermap.org/api_keys) section

### OpenCage Geocoder API Key
1. Go to [OpenCage Official Link](https://opencagedata.com)
2. Click **Get API Key** or **Sign Up**
3. After email verification, go to the `dashboard`
4. Your API key will be visible there.
5. Copy and add to `.env`:
```env
REACT_APP_OPENCAGE_API_KEY=your_opencage_key_here
```
### Google Maps JavaScript API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Log in and click **Select Project** → **New Project**
3. Give your project a name, e.g. `WeatherApp`, and click **Create**
4. After project creation, go to **APIs & Services** > **Library**
5. Search: `Maps JavaScript API`
6. Click on it → Click `Enable`
7. 
## How to Set up Mongo DB
1. Download from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB on the default port (`mongodb://localhost:27017`)
3. Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud-hosted DB

## Installation & Setup
1. Clone the Repo

```bash
git clone https://github.com/your-username/weather-app.git
```

2. Backend Setup
```bash
cd backend
npm install

```
- Create a `.env` file in /backend:
```env
MONGO_URL=mongodb://localhost:27017/weatherApp
OPENWEATHER_API_KEY=your_openweather_api_key

```
- Start Backend
```bash
node server.js
```
3. Frontend Setup
```bash
npm install
```
- create a `.env` file in the root:
```env
REACT_APP_GEO_API_KEY=your_openweather_api_key

```
4. Start the App
```bash
npm run dev

```
5. Create a `.env` file in the root folder
```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/WeatherAPP

REACT_APP_GEO_API_KEY=your_openweather_geo_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
REACT_APP_OPENCAGE_API_KEY=your_opencage_key
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_js_key
```
6. Visit http://localhost:3000

## Project Structure
```pgsql
weather-app/
├── backend/
│   ├── server.js
│   └── modules/
│       └── WeatherRequest.js
├── .env
├── package.json
├── src/
│   ├── App.js
│   └── index.js

```

## Special Functionalities
### Map-Based Location Picker
- Click anywhere on the map to set a location
- Coordinates update automatically
- Forecast refreshes instantly

### Export Forecast as JSON
- Click "Export as JSON" to download all current forecasts

### Weather Icons
- Each forecast has an emoji/icon next to its description:
| Description     | Icon |
|-----------------|------|
| clear sky       | ☀️   |
| few clouds      | 🌤️   |
| overcast clouds | ☁️   |
| rain            | 🌧️   |
| thunderstorm    | ⛈️   |
| snow            | 🌨️   |
| mist            | 🌫️   |

## Author
- Ranxin Li
- Click the “Info” button in the app to learn about the [Product Manager Accelerator](https://www.linkedin.com/school/pmaccelerator/) program.

## Acknowledgements
- OpenWeather API
- OpenCage Geocoder
- Google Maps Platform
- PM Accelerator