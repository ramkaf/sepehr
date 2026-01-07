export const buildSantralPlantPerformanceAllValueQuery = (
  nominalPower: string,
  date_histogram: any,
  range: any,
  irradiationDevices: string[], // e.g. ["Irradiation 1", "Irradiation 2", "Irradiation 3", "Irradiation 4"]
  irradiationParameter: string,
  dcToAcMax: string,
) => ({
  size: 0,
  _source: [irradiationParameter, 'Air_temperature_act', 'kW_tot', 'DateTime'],
  query: {
    bool: {
      must: [
        {
          terms: {
            'DeviceName.keyword': [
              ...irradiationDevices,
              'Weather station',
              'ION METER',
            ],
          },
        },
        { range },
      ],
    },
  },
  aggs: {
    intervals: {
      date_histogram,
      aggs: {
        // --- Dynamic irradiation aggregation ---
        max_irradiance: {
          avg: {
            script: {
              source: `
                if (${JSON.stringify(
                  irradiationDevices,
                )}.contains(doc['DeviceName.keyword'].value)) {
                  if (doc['${irradiationParameter}'].size() > 0 && doc['${irradiationParameter}'].value > 0) {
                    return doc['${irradiationParameter}'].value;
                  }
                }
                return null;
              `,
            },
          },
        },
        // --- Static aggregations ---
        max_temp: {
          max: { field: 'Air_temperature_act' },
        },
        max_abs_ptotal: {
          avg: {
            script: {
              source: `
                if (doc['DeviceName.keyword'].value == 'ION METER') {
                  if (doc['kW_tot'].size() > 0 && doc['kW_tot'].value > 0) {
                    return Math.abs(doc['kW_tot'].value);
                  }
                }
                return null;
              `,
            },
          },
        },
        performance: {
          bucket_script: {
            buckets_path: {
              ptotal: 'max_abs_ptotal',
              irradiance: 'max_irradiance',
            },
            script: `
              if (params.ptotal > 0 && params.irradiance > 0) {
                return (params.ptotal * 100000) / ((${nominalPower}/${dcToAcMax} )* params.irradiance);
              } else {
                return 0;
              }
            `,
          },
        },
      },
    },
  },
});
