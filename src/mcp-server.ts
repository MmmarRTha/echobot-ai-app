import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

const server = new McpServer({
  name: "MCP Server",
  version: "1.0.0",
});

server.tool(
  "fetch-weather",
  "Tool to fetch the current weather for a given city",
  {
    city: z.string().describe("The name of the city to fetch the weather for"),
  },
  async ({ city }) => {
    try {
      const response = await fetch(
        `${GEOCODING_API_URL}?name=${city}&count=10&language=en&format=json`
      );
      if (!response.ok) throw new Error("Failed to fetch geocoding data");
      const data = await response.json();

      if (!Array.isArray(data.results) || data.results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `No weather data found for city: ${city}`,
            },
          ],
        };
      }
      const { latitude, longitude } = data.results[0];

      const weatherResponse = await fetch(
        `${WEATHER_API_URL}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,is_day,precipitation,rain,cloud_cover,wind_speed_10m&forecast_days=1&temperature_unit=fahrenheit`
      );
      if (!weatherResponse.ok) throw new Error("Failed to fetch weather data");
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;
      const summary = `Weather for ${city}:
- Temperature: ${current.temperature_2m}\u00b0F
- Day/Night: ${current.is_day ? "Day" : "Night"}
- Precipitation: ${current.precipitation}mm
- Rain: ${current.rain}mm
- Cloud Cover: ${current.cloud_cover}%
- Wind Speed: ${current.wind_speed_10m} km/h`;
      return {
        content: [
          {
            type: "text",
            text: summary,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching weather data: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
