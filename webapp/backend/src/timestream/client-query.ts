import AWS = require('aws-sdk');
import { ColumnInfo, QueryRequest, QueryResponse, QueryString, Row } from 'aws-sdk/clients/timestreamquery';


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
        switch(statistic) {
            case "avg": {
                statisticQueryVal = "AVG(measure_value::double)";
                break;
            }
            case "min": {
                statisticQueryVal = "MIN(measure_value::double)";
                break;
            }
            case "p50": {
                statisticQueryVal = "APPROX_PERCENTILE(measure_value::double, 0.5)";
                break;
            }
            case "p90": {
                statisticQueryVal = "APPROX_PERCENTILE(measure_value::double, 0.9)";
                break; 
            }
            case "p99": {
                statisticQueryVal = "APPROX_PERCENTILE(measure_value::double, 0.99)";
                break; 
            }
            case "max": {
                statisticQueryVal = "MAX(measure_value::double)";
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

        // TODO: 
        // - patient_id is bigint in Timestream
        // - 
        // return `
        //     SELECT to_iso8601(BIN(time, ${period})) AS binned_timestamp,
        //         measure_name,
        //         ROUND(${statisticQueryVal}, 2) AS measure_val
        //     FROM HealthDatabase.MetricsDataTable
        //     WHERE patient_id = '${patientId}'
        //     AND time BETWEEN from_iso8601_timestamp('${start}') AND from_iso8601_timestamp('${end}')
        //     GROUP BY BIN(time, ${period}), measure_name
        //     ORDER BY measure_name, binned_timestamp ASC
        // `;
        return `
            SELECT to_iso8601(BIN(time, ${period})) AS binned_timestamp,
                measure_name,
                ROUND(${statisticQueryVal}, 2) AS measure_val
            FROM "devops-single".DevOps
            WHERE hostname = 'host-Hovjv'
            AND time BETWEEN from_iso8601_timestamp('${start}') AND from_iso8601_timestamp('${end}')
            GROUP BY BIN(time, ${period}), measure_name
            ORDER BY measure_name, binned_timestamp ASC
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
