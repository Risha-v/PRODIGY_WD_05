from flask import Flask, render_template, request, jsonify
import requests
from geopy.geocoders import Nominatim

app = Flask(__name__)

API_KEY = "e84e42b0a2ca546f0f8b95bd0570098a"
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

geolocator = Nominatim(user_agent="weather_app")

def get_weather(query):
    try:
        params = {"appid": API_KEY, "units": "metric"}

        if query.isdigit():
            params["zip"] = query + ",IN"
        elif "," in query:
            lat, lon = map(float, query.split(","))
            params["lat"] = lat
            params["lon"] = lon
        else:
            params["q"] = query + ",IN"

        response = requests.get(BASE_URL, params=params)
        data = response.json()

        if data.get("cod") != 200:
            return None

        temp_c = data["main"]["temp"]
        temp_f = (temp_c * 9/5) + 32
        feels_like_c = data["main"]["feels_like"]
        feels_like_f = (feels_like_c * 9/5) + 32
        pressure_hpa = data["main"]["pressure"]
        pressure_atm = pressure_hpa / 1013.25

        wind_speed = data["wind"]["speed"]
        rain_chance = 0
        if "rain" in data:
            rain_chance = data["rain"].get("3h", 0)  # Get 3-hour rain chance
        elif "pop" in data:
            rain_chance = data["pop"] * 100  # Convert probability to percentage

        weather_type = data["weather"][0]["main"].lower()
        is_rainy = "rain" in weather_type
        is_hot = temp_c > 35
        is_cold = temp_c < 10

        return {
            "city": data["name"],
            "temp_c": round(temp_c, 1),
            "temp_f": round(temp_f, 1),
            "feels_like_c": round(feels_like_c, 1),
            "feels_like_f": round(feels_like_f, 1),
            "humidity": data["main"]["humidity"],
            "pressure_hpa": pressure_hpa,
            "pressure_atm": round(pressure_atm, 3),
            "description": data["weather"][0]["description"],
            "icon": data["weather"][0]["icon"],
            "is_rainy": is_rainy,
            "is_hot": is_hot,
            "is_cold": is_cold,
            "wind_speed": round(wind_speed, 1),
            "rain_chance": round(rain_chance),
        }
    except:
        return None

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/weather", methods=["POST"])
def weather():
    query = request.form.get("location")
    data = get_weather(query)
    if not data:
        return jsonify({"error": "Location not found or invalid input"}), 404
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)