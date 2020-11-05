'use strict';


require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const PORT = process.env.PORT || 4000;

let app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.send('Welcome to Home Page!!');
});

app.get('/location', locationHandler);

app.get('/weather', weatherHandler);
app.get('/trails', trailHandler);

app.use('*', notFoundHandler);
app.use(errorHandler);

function locationHandler(request, response) {
  const city = request.query.city;
  superagent(
    `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`
  ).then((res) => {
    console.log(res);
    const geoData = res.body;
    const locationData = new Locations(city, geoData);
    response.status(200).json(locationData);

  }).catch((err) => errorHandler(err, request, response));

}



function Locations(city, geoData) {
  this.search_query = city;
  this.formatted_qurey = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;

}


function weatherHandler(request, response) {
  superagent(
    `https://api.weatherbit.io/v2.0/forecast/daily?city=${request.query.search_query}&key=${process.env.WEATHER_API_KEY}`
  ).then((weatherRes) => {
    console.log(weatherRes);
    const weatherSummary = weatherRes.body.data.map((weatherData) => {
      return new Weather(weatherData);
    });
    response.status(200).json(weatherSummary);
  })
    .catch((err) => errorHandler(err, request, response));

}
function Weather(weatherData) {

  this.forecast = weatherData.weather.description;
  this.time = new Date(weatherData.valid_date).toDateString();
}
function trailHandler(request, response) {
  superagent(


  ).then((trailRes) => {
    console.log(trailRes);
    const trailSummary = trailRes.body.data.map((trailData) => {
      return new Trail(trailData);
    });
    response.status(200).json(trailSummary);
  })
    .catch((err) => errorHandler(err, request, response));
}


function Trail(trailData) {

  this.name = trailData.name;
  this.location = trailData.location;
  this.length = trailData.length;
  this.stars = trailData.stars;
  this.star_votes = trailData.star_votes;
  this.summary = trailData.summary;
  this.trail_url = trailData.trail_url;
  this.conditions = trailData.conditions;
  this.condition_date = trailData.condition_date;
  this.condition_time = trailData.condition_time;
}

function notFoundHandler(request, response) {
  response.status(404).send('PAGE NOT FOUND');
}


function errorHandler(error, request, response) {
  response.status(500).send(error);
}

app.listen(PORT, () => console.log(`Server is Running well on PORT ${PORT}`));
