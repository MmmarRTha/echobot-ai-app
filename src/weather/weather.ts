import { z } from "zod";

export interface HourlyWeatherData {
  time: string[];
  temperature_2m: number[];
}

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
  hourly: HourlyWeatherData;
}

const GeocodingResponseSchema = z.object({
  results: z
    .array(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .nonempty(),
});

const WeatherResponseSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    is_day: z.number(),
    precipitation: z.number(),
    rain: z.number(),
    cloud_cover: z.number(),
    wind_speed_10m: z.number(),
  }),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
  }),
});

export enum WeatherStatus {
  Clear = "clear",
  Cloudy = "cloudy",
  Rain = "rain",
  Snow = "snow",
  Storm = "storm",
  Fog = "fog",
  PartlyCloudy = "partly cloudy",
}

export const WEATHER_ICONS: Record<WeatherStatus, string> = {
  [WeatherStatus.Clear]: "☀️",
  [WeatherStatus.Cloudy]: "☁️",
  [WeatherStatus.Rain]: "🌧️",
  [WeatherStatus.Snow]: "❄️",
  [WeatherStatus.Storm]: "⛈️",
  [WeatherStatus.Fog]: "🌫️",
  [WeatherStatus.PartlyCloudy]: "⛅",
};

export class WeatherService {
  async getWeatherByCity(city: string): Promise<WeatherData> {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`
      );
      const data = await response.json();

      // Validate geocoding response
      const geoResult = GeocodingResponseSchema.safeParse(data);
      if (!geoResult.success) {
        throw new Error(
          `Invalid geocoding response: ${geoResult.error.message}`
        );
      }

      const { latitude, longitude } = geoResult.data.results[0];

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,is_day,precipitation,rain,cloud_cover,wind_speed_10m&forecast_days=1&temperature_unit=fahrenheit`
      );

      const weatherData = await weatherResponse.json();

      // Validate weather response
      const weatherResult = WeatherResponseSchema.safeParse(weatherData);
      if (!weatherResult.success) {
        throw new Error(
          `Invalid weather response: ${weatherResult.error.message}`
        );
      }

      const current = weatherResult.data.current;
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
        hourly: weatherResult.data.hourly,
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
    const lowerDesc = description.toLowerCase();
    for (const key of Object.values(WeatherStatus)) {
      if (lowerDesc.includes(key)) {
        return WEATHER_ICONS[key as WeatherStatus];
      }
    }
    return "🌤️";
  }
}
