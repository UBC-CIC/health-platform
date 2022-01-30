import { ColumnInfo, QueryRequest, Row, TimestreamQuery } from "@aws-sdk/client-timestream-query";


export interface HealthPlatformQueryResponse {
    columns: ColumnInfo[];
    rows: Row[];
}

export class HealthPlatformTimestreamClient {
    client: TimestreamQuery

    constructor(client: TimestreamQuery) {
        this.client = client;
    }

    buildQuery(): string {
        return `
            SELECT
                time,
                fleet,
                truck_id,
                make,
                model,
                measure_name,
                load
            FROM "sampleDB".IoTMulti
            WHERE truck_id = '1234546252'`;
    }

    async getAllRows(query: string, nextToken?: string): Promise<HealthPlatformQueryResponse> {
        const params: QueryRequest = {
            QueryString: query
        };

        console.log(`Querying ${query}`);
        const rows: Row[] = [];
        let columns: ColumnInfo[] = [];
        do {
            console.log(`Querying...`);
            if (nextToken) {
                console.log(`Pagination requested: ${nextToken}`);
                params.NextToken = nextToken;
            }
    
            const response = await this.client.query(params);
            console.log(`Got response...`);
            if (response.Rows) {
                rows.push(...response.Rows);
            }
            if (response.ColumnInfo) {
                columns = response.ColumnInfo;
            }
            nextToken = response.NextToken;
        } while (nextToken);
        console.log(`Number of rows found: ${rows.length}`);

        return {
            columns: columns,
            rows: rows,
        };
    }
}
