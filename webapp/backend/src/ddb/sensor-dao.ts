import { DocumentClient } from "aws-sdk/clients/dynamodb";

export type Sensor = {
    "patient_id": string;
    "sensor_id": string;
    "sensor_type": string;
};

export class SensorDao {
    db: DocumentClient

    constructor(db: DocumentClient) {
        this.db = db;
    }

    /**
     * Retrieves a sensor based on its ID
     * 
     * @param sensorId The sensor ID
     * @returns The sensor if it exists.
     */
    async getSensor(sensorId: string): Promise<Sensor | null> {
        const params: DocumentClient.QueryInput = {
            TableName: process.env.SENSOR_MAPPING_TABLE_NAME!,
            ExpressionAttributeValues: {
                ':pkVal': sensorId,
            },
            ExpressionAttributeNames: {
                '#PK': 'sensor_id',
            },
            KeyConditionExpression: '#PK = :pkVal',
        };

        // Query sensor information
        const sensorRes = await this.db
            .query(params)
            .promise();
        console.log('sensorRes: ', sensorRes);
        if (!sensorRes.ScannedCount) {
            console.error('Sensor not found');
            return null;
        }

        const sensorInfo = sensorRes.Items![0] as Sensor;
        return sensorInfo;
    }
}
