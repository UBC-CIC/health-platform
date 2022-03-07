import AWS = require('aws-sdk');
import { ColumnInfo, QueryRequest } from 'aws-sdk/clients/timestreamquery';


export interface HealthPlatformQueryResponse {
    columns: string[];
    rows: string[][];
}

export class HealthPlatformTimestreamQueryClient {
    client: AWS.TimestreamQuery

    constructor(client: AWS.TimestreamQuery) {
        this.client = client;
    }

    buildQuery(patientId: string, period: string, statistic: string, start: string, end: string): string {
        let statisticQueryVal = "";
        switch (statistic) {
            case "avg": {
                statisticQueryVal = "AVG(measurement)";
                break;
            }
            case "min": {
                statisticQueryVal = "MIN(measurement)";
                break;
            }
            case "p50": {
                statisticQueryVal = "APPROX_PERCENTILE(measurement, 0.5)";
                break;
            }
            case "p90": {
                statisticQueryVal = "APPROX_PERCENTILE(measurement, 0.9)";
                break;
            }
            case "p99": {
                statisticQueryVal = "APPROX_PERCENTILE(measurement, 0.99)";
                break;
            }
            case "max": {
                statisticQueryVal = "MAX(measurement)";
                break;
            }
            default: {
                console.log(`Unknown statistic encountered: ${statistic}`);
                return "";
            }
        }

        const validPeriodValues = ["1s", "1m", "5m", "1h", "1d"];
        if (!validPeriodValues.some(v => v === period)) {
            console.log(`Illegal period value encountered: ${period}`);
            return "";
        }

        if (!Date.parse(start) || !Date.parse(end)) {
            console.log(`Illegal start or end value encountered: ${start}, ${end}`);
            return "";
        }

        return `
            SELECT to_iso8601(BIN(time, ${period})) AS binned_timestamp,
                measurement_type,
                ROUND(${statisticQueryVal}, 2) AS measure_val
            FROM HealthDatabase.MetricsDataTable
            WHERE patient_id = '${patientId}'
            AND time BETWEEN from_iso8601_timestamp('${start}') AND from_iso8601_timestamp('${end}')
            GROUP BY BIN(time, ${period}), measurement_type
            ORDER BY measurement_type, binned_timestamp ASC
        `;
    }

    async getAllRows(query: string, nextToken?: string): Promise<HealthPlatformQueryResponse> {
        const params: QueryRequest = {
            QueryString: query
        };

        console.log(`Querying ${query}`);
        const rows: string[][] = [];
        let columns: ColumnInfo[] = [];
        do {
            console.log(`Querying...`);
            if (nextToken) {
                console.log(`Pagination requested: ${nextToken}`);
                params.NextToken = nextToken;
            }

            const response = await this.client.query(params).promise();
            console.log(`Got response with columns ${JSON.stringify(response.ColumnInfo)}`);
            const queriedRows = response.Rows.map(r => {
                return r.Data.map(d => {
                    if (d.ScalarValue) {
                        return d.ScalarValue
                    } else {
                        return ""
                    }
                });
            });
            rows.push(...queriedRows);
            columns = response.ColumnInfo;
            nextToken = response.NextToken;
        } while (nextToken);
        console.log(`Number of rows found: ${rows.length}`);

        return {
            columns: columns.map(c => {
                if (c.Name) {
                    return c.Name
                } else {
                    return ""
                }
            }),
            rows: rows,
        };
    }
}
