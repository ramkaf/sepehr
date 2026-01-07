// If weatherParameter.fieldTag is typed as string, update the function
export function getWeatherFieldElasticPath(key: string) {
  const fieldMap = {
    weather_speed: 'data.wind.speed',
    weather_gust: 'data.wind.gust',
    weather_deg: 'data.wind.deg',
    weather_temp: 'data.main.temp',
    weather_feels_like: 'data.main.feels_like',
    weather_pressure: 'data.main.pressure',
    weather_humidity: 'data.main.humidity',
    weather_temp_min: 'data.main.temp_min',
    weather_temp_max: 'data.main.temp_max',
    weather_sea_level: 'data.main.sea_level',
    weather_grnd_level: 'data.main.grnd_level',
    weather_temp_kf: 'data.main.temp_kf',
    weather_description: 'data.weather.description',
  } as const;

  return fieldMap[key as keyof typeof fieldMap] || null;
}
