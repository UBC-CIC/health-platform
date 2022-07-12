import AWS = require('aws-sdk');
import { HealthPlatformTimestreamInsertClient, MetricsData } from './timestream/client-insert';
import { Sensor, SensorDao } from './ddb/sensor-dao';
const https = require('https');

var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/**
 * Called regularly to fetch data for Biostrap sensors from Biostrap API
 * 
 * Refer to Biostrap's API Documentation https://docs.api-beta.biostrap.com/ for more details on API GET requests
 */
export const handler = async (event: any = {}, context: any, callback: any): Promise<any> => {
    console.log('Event: ', event);

    // Query sensor information
    //
    const sensorDao = new SensorDao(ddb);
    const sensors = await sensorDao.getAllPullSensors();

    if (!sensors) {
        console.error('Sensor not found');
        return;
    }

    console.log('found sensors: ', sensors);
    
    for (const sensor of sensors) {
        console.log("going through sensors")
        if (sensor.sensor_types && sensor.sensor_types.length > 0) {
            if (sensor.sensor_types[0] === "BIOSTRAP") {
                console.log("found BIOSTRAP")
                const tokenObj = await getBiostrapUserID(sensor);
                await processBiostrapData(sensor, tokenObj.user_id);
            }
        }
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('Done')
    };

    return response
};

//Given a user's email, get the user ID 
const getBiostrapUserID = async (sensor: Sensor): Promise<any> => {
    console.log("getBiostrapUserID")

    return new Promise((resolve) => {
        var options = {
            hostname: 'api-beta.biostrap.com',
            port: 443,
            path: `/v1/organizations/users?page=1&items_per_page=1&q=${sensor.client_key}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `APIKey ${sensor.secret_key}`,
            }
        };
    
        var req = https.request(options, (res: any) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
    
            var body = '';
            res.on('data', function (chunk: any) {
                body = body + chunk;
                console.log(body)
            });
        
            res.on('end', async function() {
              console.log("Body :" + body);
                if (res.statusCode === 200) {
                    const tokenObj = JSON.parse(body);
                    const user_id = tokenObj.users[0].id
                    resolve({
                        "user_id": user_id,
                    });
                }
            });
        });
    
        req.on('error', (e: any) => {
            console.error(e);
            resolve({});
        });
    
        req.end();
    });
}

const processBiostrapData = async (sensor: Sensor, user_id: string): Promise<any> => {
    console.log("processBiostrapData")
    return new Promise((resolve) => {
        var options = {
            hostname: 'api-beta.biostrap.com',
            port: 443,
            path: `/v1/biometrics?last-timestamp=${sensor.watermark}&limit=50&user_id=${user_id}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `APIKey ${sensor.secret_key}`,
            }
        };

        var req = https.request(options, (res: any) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            var body = '';
            res.on('data', function (chunk: any) {
                body = body + chunk;
                console.log(body)
            });
            res.on('end', async function() {
                console.log("Body :" + body);
                if (Object.keys(JSON.parse(body)["data"]).length === 0) {
                    console.log("Error: Empty body, request aborted")
                    resolve(true)
                    return
                }
                if (res.statusCode === 200) {
                    const tokenObj = JSON.parse(body)["data"];
                    for await (const data of tokenObj) {
                        const time = new Date(data["timestamp"]).toISOString();
                        const watermark = new Date(Number(sensor.watermark)).toISOString();
                        if (time > watermark) {
                            const client = new AWS.TimestreamWrite({
                                region: "us-west-2",
                                endpoint: `https://ingest-cell1.timestream.us-west-2.amazonaws.com`,
                            });

                            console.log("Created timestream query client");
                            const timestreamClient = new HealthPlatformTimestreamInsertClient(client);
                            if (data["bpm"] != 0) {
                                const bpm = data["bpm"];
                                await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "HeartRate", bpm, time));
                            }
                            if (data["spo2"] != 0) {
                                const spo2 = data["spo2"]
                                await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "OxygenSaturation", spo2, time));
                            }
                            if (data["brpm"] != 0) {
                                const brpm = data["brpm"]
                                await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "RespiratoryRate", brpm, time));
                            }
                            if (data["hrv"] != 0) {
                                const hrv = data["hrv"]
                                await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "HeartRateVariability", hrv, time));
                            }

                            console.log("Updating high watermark");
                            sensor.watermark = data["timestamp"].toString();
                            const sensorDao = new SensorDao(ddb);
                            await sensorDao.updateSensor(sensor);
                        } else {
                            console.log("Time is before high watermark");
                            resolve(false);
                        }
                    }
                    resolve(true)  
                }
            });
        });

        req.on('error', (e: any) => {
            console.error(e);
            resolve(false);
        });

        req.end();
    });
}

const getEvent = (sensor: Sensor, type: string, val: number, time: string) => {
    return {
        "sensorId": sensor.sensor_id,
        "data": [
            {
                "measurementType": type,
                "measurement": val.toString(),
                "timestamp": time
            }
        ]   
    }
}
