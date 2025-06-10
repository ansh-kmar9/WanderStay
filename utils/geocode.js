const axios = require("axios");

const geocodeLocation = async (location) => {
  const apiKey = process.env.GEOCODING_API_KEY; // Your OpenCage API key here
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    location
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (
      response.data &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const { lat, lng } = response.data.results[0].geometry;
      return { lat, lng };
    } else {
      throw new Error("No results found");
    }
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return null;
  }
};

module.exports = geocodeLocation;
