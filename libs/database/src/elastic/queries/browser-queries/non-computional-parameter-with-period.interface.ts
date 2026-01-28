import { subtractTimeFromDate } from 'libs/utils';
import { IEntityField } from 'libs/interfaces';
import { RangeTypeEnum } from 'libs/enums';

export function buildNonComputationalParameterElasticQuery(
  input: IEntityField[],
  entityName: string,
  sourceKey: string,
  data_delay: number,
) {
  const aggs: any = {};
  // const nullIdFields = input
  //   .filter((item) => item.id === null && item.fieldTag)
  //   .map((item) => item.fieldTag);
  const normalPeriodEntityFields = input.filter((item) => !item.fieldsPeriod);
  if (normalPeriodEntityFields.length > 0) {
    aggs['last_value'] = {
      filter: {
        range: {
          DateTime: subtractTimeFromDate(15, RangeTypeEnum.Minute, data_delay),
        },
      },
      aggs: {
        top_hits: {
          top_hits: {
            size: 1,
            sort: [
              {
                DateTime: {
                  order: 'desc',
                },
              },
            ],
            _source: {
              includes: normalPeriodEntityFields.map((item) => item.fieldTag),
            },
          },
        },
      },
    };
  }
  const specificPeriodEntityFields = input.filter(
    (item) => item.fieldsPeriod !== null,
  );
  if (specificPeriodEntityFields.length > 0) {
    input.forEach((item) => {
      const period = item.fieldsPeriod;
      if (!period?.functionName) return;

      aggs[item.fieldTag] = {
        filter: {
          range: {
            DateTime: subtractTimeFromDate(
              period.rangeValue,
              period.rangeType,
              data_delay,
            ),
          },
        },
        aggs: {
          [item.fieldTag]: {
            [period.functionName]: {
              field: item.fieldTag,
            },
          },
        },
      };
    });
  }

  // Construct the final query
  const query = {
    size: 0,
    query: {
      bool: {
        must: [
          {
            match: {
              'DeviceName.keyword': entityName,
            },
          },
          {
            wildcard: {
              'log.file.path.keyword': `*${sourceKey}*`,
            },
          },
        ],
      },
    },
    aggs,
  };
  return query;
}
