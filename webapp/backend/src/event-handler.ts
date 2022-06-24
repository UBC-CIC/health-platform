import AWS = require('aws-sdk');
import { SensorDao } from './ddb/sensor-dao';
var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
import timestreamInsert = require('./timestream/client-insert')

/**
 data: [
    {
      timestamp: '2022-06-16T22:55:12.946Z',
      measurement: '52.0',
      measurementType: 'HeartRateVariability'
    },
    {
      measurement: '61.0, 62.0, 62.0',
      timestamp: '2022-06-17T00:04:28.282Z, 2022-06-17T00:01:40.282Z, 2022-06-16T23:54:47.781Z',
      measurementType: 'HeartRate'
    },
    {
      measurementType: 'Steps',
      measurement: '574.0',
      timestamp: '2022-06-17T00:48:46.024Z'
    }
  ],
  sensorId: 'AE77891D-E9CD-4B11-AE49-F269E970D831'
}
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log('Event: ', event);

    // Query sensor information
    //
    const sensorDao = new SensorDao(ddb);
    const sensor = await sensorDao.getSensor(event.sensorId);

    if (!sensor) {
        console.error('Sensor not found');
        return;
    }

    console.log('sensorInfo: ', sensor);
    const patientId = sensor.patient_id;

    const client = new AWS.TimestreamWrite({
        region: "us-west-2",
        endpoint: `https://ingest-cell1.timestream.us-west-2.amazonaws.com`,
    });

    console.log("Created timestream query client");
    const timestreamClient = new timestreamInsert.HealthPlatformTimestreamInsertClient(client);
    await timestreamClient.writeEvent(patientId, sensor, event);

    const response = {
        statusCode: 200,
        body: JSON.stringify('Done')
    };

    return response
};
