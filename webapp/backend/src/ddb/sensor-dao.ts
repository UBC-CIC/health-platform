import { DocumentClient } from "aws-sdk/clients/dynamodb";

export type Sensor = {
    "patient_id": string;
    "sensor_id": string;
    "sensor_types": [string];
    "watermark": string;
    "client_key": string;
    "secret_key": string;
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
    
    /**
     * Updates a sensor
     */
     async updateSensor(sensor: Sensor): Promise<Boolean> {
        const params = {
            TableName: process.env.SENSOR_MAPPING_TABLE_NAME!,
            Item: sensor
        };
        await this.db.put(params).promise();
        return true;
    }

    /**
     * Retrieves all sensors that operate on the 'pull' model 
     * (e.g. requires pulling data from an external source)
     * 
     * @returns The list of sensors
     */
    async getAllPullSensors(): Promise<Sensor[] | null> {
        const params: DocumentClient.ScanInput = {
            TableName: process.env.SENSOR_MAPPING_TABLE_NAME!,
        };

        const sensors: Sensor[] = [];

        while (true) {
            const sensorRes = await this.db
                .scan(params)
                .promise();
            console.log('sensorRes: ', sensorRes);
            if (!sensorRes.ScannedCount) {
                console.error('Sensor not found');
                return null;
            }

            if (sensorRes.Items) {
                for (const item of sensorRes.Items) {
                    const sensor = item as Sensor;
                    if (sensor.watermark) {
                        // Having a watermark indicates that the sensor is an external sensor
                        sensors.push(item as Sensor);
                    }
                }
            }

            if (!sensorRes.LastEvaluatedKey) {
                break;
            }
            params.ExclusiveStartKey = sensorRes.LastEvaluatedKey;
        }

        return sensors;
    }
}
