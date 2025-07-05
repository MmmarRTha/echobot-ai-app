export interface WeatherData {
  city: string;
  current: {
    temperature: string;
    is_day: string;
    precipitation: string;
    rain: string;
    cloud_cover: string;
    wind_speed: string;
  };
  hourly: any;
}

export class WeatherService {
  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`
      );
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error(`No weather data found for city: ${city}`);
      }

      const { latitude, longitude } = data.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,is_day,precipitation,rain,cloud_cover,wind_speed_10m&forecast_days=1&temperature_unit=fahrenheit`
      );

      const weatherData = await weatherResponse.json();

      const current = weatherData.current;
      return {
        city: city,
        current: {
          temperature: `${current.temperature_2m}°F`,
          is_day: current.is_day ? "Day" : "Night",
          precipitation: `${current.precipitation}mm`,
          rain: `${current.rain}mm`,
          cloud_cover: `${current.cloud_cover}%`,
          wind_speed: `${current.wind_speed_10m} km/h`,
        },
        hourly: weatherData.hourly,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching weather data: ${error.message}`);
      } else {
        throw new Error("Error fetching weather data: Unknown error");
      }
    }
  }

  getWeatherIcon(description: string): string {
    const iconMap: { [key: string]: string } = {
      clear: "☀️",
      cloudy: "☁️",
      rain: "��️",
      snow: "❄️",
      storm: "⛈️",
      fog: "🌫️",
      "partly cloudy": "⛅",
    };

    const lowerDesc = description.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerDesc.includes(key)) {
        return icon;
      }
    }
    return "🌤️";
  }
}
