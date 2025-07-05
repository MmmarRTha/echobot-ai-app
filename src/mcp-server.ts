import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

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
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`);
    const data = await response.json();

    if (data.length === 0) {
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

    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,is_day,precipitation,rain,cloud_cover,wind_speed_10m&forecast_days=1&temperature_unit=fahrenheit`);

    const weatherData = await weatherResponse.json();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weatherData, null, 2)
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
