document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const locationInput = document.getElementById("location");
    const weatherInfo = document.getElementById("weatherInfo");
    const error = document.getElementById("error");
    const tipsBtn = document.getElementById("tipsBtn");
    const tips = document.getElementById("tips");
    const rainChance = document.getElementById("rainChance");

    searchBtn.addEventListener("click", async () => {
        const location = locationInput.value;
        await getWeather("/weather", { location });
    });

    locationInput.addEventListener("keypress", async (e) => {
        if (e.key === "Enter") {
            const location = locationInput.value;
            await getWeather("/weather", { location });
        }
    });

    tipsBtn.addEventListener("click", () => {
        tips.classList.toggle("hidden");
        tipsBtn.innerHTML = tips.classList.contains("hidden") ? '<i class="fas fa-lightbulb"></i> Weather Tips' : '<i class="fas fa-times"></i> Hide Tips';
    });

    async function getWeather(url, data = {}) {
        try {
            const response = await fetch(url, {
                method: data.location ? "POST" : "GET",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: data.location ? `location=${encodeURIComponent(data.location)}` : undefined
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Unable to fetch weather data");
            }

            const result = await response.json();
            displayWeather(result);
        } catch (err) {
            error.textContent = err.message;
            error.classList.remove("hidden");
            weatherInfo.classList.add("hidden");
        }
    }

    function displayWeather(data) {
        document.getElementById("city").textContent = data.city;
        document.getElementById("tempC").textContent = data.temp_c;
        document.getElementById("tempF").textContent = data.temp_f;
        document.getElementById("feelsLikeC").textContent = data.feels_like_c;
        document.getElementById("feelsLikeF").textContent = data.feels_like_f;
        document.getElementById("humidity").textContent = data.humidity;
        document.getElementById("pressureAtm").textContent = data.pressure_atm;
        document.getElementById("windSpeed").textContent = data.wind_speed;
        document.getElementById("description").textContent = data.description;
        document.getElementById("weatherIcon").src = `http://openweathermap.org/img/wn/${data.icon}@2x.png`;

        rainChance.classList.toggle("hidden", !data.rain_chance);
        document.getElementById("rainPercentage").textContent = data.rain_chance;

        let advice = "<h3>☀️ Weather Tips</h3><ul>";

        if (data.is_hot) {
            advice += "<li>🌡️ It's very hot! Stay hydrated and seek shade.</li>";
            advice += "<li>👕 Wear light, loose-fitting clothes.</li>";
            advice += "<li>🕺 Avoid outdoor activities during peak hours.</li>";
        } else if (data.is_cold) {
            advice += "<li>❄️ It's quite cold! Layer your clothing.</li>";
            advice += "<li>🧣 Keep extremities warm: hat, gloves, socks.</li>";
            advice += "<li>🚰 Stay hydrated, even in cold weather.</li>";
        } else {
            advice += "<li>😎 Temperature is pleasant. Enjoy your day!</li>";
        }

        if (data.humidity > 70) {
            advice += "<li>💧 High humidity! You might feel warmer.</li>";
            advice += "<li>🏢 Stay in air-conditioned areas if possible.</li>";
        } else if (data.humidity < 30) {
            advice += "<li>🏜️ It's dry. Moisturize your skin.</li>";
            advice += "<li>💄 Use lip balm and eye drops if needed.</li>";
        }

        if (data.pressure_atm < 0.99) {
            advice += "<li>🌀 Low pressure may indicate a storm.</li>";
            advice += "<li>📻 Stay updated with local weather alerts.</li>";
        } else if (data.pressure_atm > 1.02) {
            advice += "<li>☀️ High pressure often means clear skies.</li>";
            advice += "<li>📸 Great time for outdoor photos!</li>";
        }

        if (data.is_rainy) {
            advice += "<li>☔ Rain alert! Carry an umbrella.</li>";
            advice += "<li>👢 Wear water-resistant shoes.</li>";
            advice += "<li>🚗 Drive carefully, roads may be slippery.</li>";
        }

        if (data.wind_speed > 10) {
            advice += "<li>🌬️ It's windy! Secure loose items outdoors.</li>";
            advice += "<li>🎨 Not the best day for outdoor painting!</li>";
        }

        advice += "</ul>";

        tips.innerHTML = advice;
        tips.classList.add("hidden");
        tipsBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Weather Tips';
        document.getElementById("weatherInfo").classList.remove("hidden");
        document.getElementById("error").classList.add("hidden");
    }
});