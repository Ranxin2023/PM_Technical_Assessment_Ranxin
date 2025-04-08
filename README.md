# Weather APP
## Introduction
A full-stack weather forecasting application that allows users to:
- Search weather forecasts by location and date range
- View forecasts powered by the [OpenWeatherMap API](https://openweathermap.org/api)
- Automatically detect user location using browser geolocation
- Store and manage past weather queries (CRUD operations)
- Built with **React**, **Node.js**, **Express**, and **MongoDB**

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
Node.js

Express.js

Axios (for server-side API fetch)

Mongoose + MongoDB

API Used
OpenWeatherMap API (for weather + reverse geolocation)
## How to get the Openweather API Key
1. Go to [Openweather Official Link](https://home.openweathermap.org/users/sign_up)
2. Create an account (or log in)
3. Visit the [API Keys](https://home.openweathermap.org/api_keys) section
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