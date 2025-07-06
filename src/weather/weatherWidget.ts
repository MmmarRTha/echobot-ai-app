import {
  WeatherService,
  WeatherData,
  WeatherStatus,
  WEATHER_ICONS,
} from "./weather";

type WeatherCurrent = {
  rain: number;
  cloud_cover: number;
  is_day: string; // 'Day' | 'Night'
};

// Cloud cover threshold constants
const CLOUD_COVER_HEAVY = 70;
const CLOUD_COVER_PARTIAL = 30;

export class WeatherWidget {
  private container: HTMLElement;
  private weatherService: WeatherService;
  private isVisible = false;
  private currentCity: string = "Tijuana";

  constructor(container: HTMLElement) {
    this.container = container;
    this.weatherService = new WeatherService();
  }

  async initialize(): Promise<void> {
    this.renderLoading();
    try {
      // Try to get user's location
      const position = await this.getCurrentPosition();
      const city = await this.getCityFromCoords(
        position.coords.latitude,
        position.coords.longitude
      );
      this.currentCity = city;
      const weatherData = await this.weatherService.getWeatherByCity(city);
      this.render(weatherData);
    } catch (error) {
      console.log("Location access denied, using default city");
      // Fallback to a default city
      try {
        const weatherData = await this.weatherService.getWeatherByCity(
          this.currentCity
        );
        this.render(weatherData);
      } catch (fallbackError) {
        this.renderError("Unable to load weather data");
      }
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 10000,
        enableHighAccuracy: true,
      });
    });
  }

  private async getCityFromCoords(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en`
      );
      const data = await response.json();
      return data.name || "Unknown City";
    } catch (error) {
      return "Tijuana"; // Fallback
    }
  }

  private render(weather: WeatherData): void {
    // Convert rain and cloud_cover to numbers for type safety
    const icon = this.getWeatherIcon({
      rain: Number(weather.current.rain.replace(/[^\d.-]/g, "")),
      cloud_cover: Number(weather.current.cloud_cover.replace(/[^\d.-]/g, "")),
      is_day: weather.current.is_day,
    });

    this.container.innerHTML = `
      <div class="weather-widget bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-xl p-3 shadow-lg animate-fade-in">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-white font-semibold text-xl">${weather.city}</h2>
          <button id="weather-toggle" class="text-white/70 hover:text-white transition-colors" title="Toggle weather widget">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="weather-main mb-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-2">
              <span class="text-2xl">${icon}</span>
              <div>
                <div class="text-base font-bold text-white">${weather.current.temperature}</div>
                <div class="text-white/80 text-xs">${weather.current.is_day}</div>
              </div>
            </div>
            <div class="text-right text-white/80 text-xs pl-3">
              <div>Precipitation: ${weather.current.precipitation}</div>
              <div>Cloud Cover: ${weather.current.cloud_cover}</div>
            </div>
          </div>
        </div>
        
        <div class="weather-details grid grid-cols-2 gap-3 text-xs text-center">
          <div class="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
            <div class="text-white/60">Wind</div>
            <div class="text-white font-medium">${weather.current.wind_speed}</div>
          </div>
          <div class="bg-white/10 rounded-lg p-2 backdrop-blur-sm">
            <div class="text-white/60">Rain</div>
            <div class="text-white font-medium">${weather.current.rain}</div>
          </div>
        </div>
        
        <div class="mt-3 flex justify-between items-center">
          <button id="refresh-weather" class="text-white/70 hover:text-white text-xs transition-colors flex items-center gap-1">
            <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            </span>
            <span>Refresh</span>
          </button>
          <button id="change-city" class="text-white/70 hover:text-white text-xs transition-colors flex items-center gap-1">
            <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-3.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
            </span>
            <span>Change City</span>
          </button>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.isVisible = true;
  }

  private getWeatherIcon(current: WeatherCurrent): string {
    if (current.rain > 0) return WEATHER_ICONS[WeatherStatus.Rain];
    if (current.cloud_cover > CLOUD_COVER_HEAVY)
      return WEATHER_ICONS[WeatherStatus.Cloudy];
    if (current.cloud_cover > CLOUD_COVER_PARTIAL)
      return WEATHER_ICONS[WeatherStatus.PartlyCloudy];
    return current.is_day === "Day" ? WEATHER_ICONS[WeatherStatus.Clear] : "🌙";
  }

  private renderError(message: string): void {
    this.container.innerHTML = `
      <div class="weather-widget bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg animate-fade-in">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-white font-semibold text-lg">Weather</h3>
          <button id="weather-toggle" class="text-white/70 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="text-center text-white/80">
          <div class="text-2xl mb-2">🌧️</div>
          <div>${message}</div>
          <button id="retry-weather" class="mt-2 text-white/70 hover:text-white text-sm transition-colors">
            Retry
          </button>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.isVisible = true;
  }

  private setupEventListeners(): void {
    const toggleBtn = this.container.querySelector("#weather-toggle");
    const refreshBtn = this.container.querySelector("#refresh-weather");
    const retryBtn = this.container.querySelector("#retry-weather");
    const changeCityBtn = this.container.querySelector("#change-city");

    toggleBtn?.addEventListener("click", () => {
      this.toggle();
    });

    refreshBtn?.addEventListener("click", () => {
      this.refresh();
    });

    retryBtn?.addEventListener("click", () => {
      this.initialize();
    });

    changeCityBtn?.addEventListener("click", () => {
      this.showCityInput();
    });
  }

  private showCityInput(): void {
    const city = prompt("Enter city name:", this.currentCity);
    if (city && city.trim()) {
      this.currentCity = city.trim();
      this.refresh();
    }
  }

  private toggle(): void {
    if (this.isVisible) {
      this.container.style.display = "none";
      this.isVisible = false;
    } else {
      this.container.style.display = "block";
      this.isVisible = true;
    }
  }

  private renderLoading(): void {
    this.container.innerHTML = `
      <div class="weather-widget bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 shadow-lg animate-fade-in flex items-center justify-center min-h-[100px]">
        <span class="text-white text-lg">Loading weather...</span>
      </div>
    `;
  }

  async refresh(): Promise<void> {
    this.renderLoading();
    try {
      const weatherData = await this.weatherService.getWeatherByCity(
        this.currentCity
      );
      this.render(weatherData);
    } catch (error) {
      this.renderError("Unable to refresh weather data");
    }
  }
}
