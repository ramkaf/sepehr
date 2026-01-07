export const buildJarghoyeh2MeteoLastValueQuery = () => ({
  size: 1,
  sort: [{ DateTime: { order: 'desc' } }],
  _source: [
    'Wind_speed_(WSP)',
    'Wind_direction_(WD)',
    'Ambient_temperature',
    'PV_Rain',
    'Relative_Humidity_Act',
    'Air_Pressure_Act',
  ],
  query: {
    bool: {
      filter: [{ wildcard: { 'DeviceName.keyword': 'Weather station*' } }],
    },
  },
});
