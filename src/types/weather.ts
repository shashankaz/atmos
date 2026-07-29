export interface Weather {
  conditionId: number;
  description: string;
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  sunrise: number;
  sunset: number;
  fetchedAt: number;
}
