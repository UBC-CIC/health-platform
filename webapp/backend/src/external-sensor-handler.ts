import AWS = require('aws-sdk');
import { HealthPlatformTimestreamInsertClient, MetricsData } from './timestream/client-insert';
import { Sensor, SensorDao } from './ddb/sensor-dao';
const https = require('https');

var ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

/**
 * Called regularly to fetch data for sensors with an external API
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
            if (sensor.sensor_types[0] === "AIRTHINGS_WAVEPLUS") {
                console.log("found AIRTHINGS_WAVEPLUS")
                const tokenObj = await getAirthingsToken(sensor);
                await processAirthingsData(sensor, tokenObj.accessToken, tokenObj.tokenType);
            }
        }
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('Done')
    };

    return response
};

const getAirthingsToken = async (sensor: Sensor): Promise<any> => {
    console.log("getAirthingsToken")

    return new Promise((resolve) => {
        var postData = JSON.stringify({
            'grant_type' : 'client_credentials',
            'client_id' : sensor.client_key,
            'client_secret' :  sensor.secret_key,
            'scope' : ["read:device:current_values"],
        });
    
        var options = {
            hostname: 'accounts-api.airthings.com',
            port: 443,
            path: '/v1/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };
    
        var req = https.request(options, (res: any) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);
    
            var body = '';
            res.on('data', function (chunk: any) {
                console.log("process " + chunk);
                body = body + chunk;
            });
        
            res.on('end', async function() {
              console.log("Body :" + body);
                if (res.statusCode === 200) {
                    const tokenObj = JSON.parse(body);
                    const accessToken = tokenObj["access_token"];
                    const tokenType = tokenObj["token_type"];
                    resolve({
                        "accessToken": accessToken,
                        "tokenType": tokenType,
                    });
                }
            });
        });
    
        req.on('error', (e: any) => {
            console.error(e);
            resolve({});
        });
    
        req.write(postData);
        req.end();
    });
}

const processAirthingsData = async (sensor: Sensor, accessToken: string, tokenType: string): Promise<any> => {
    console.log("processAirthingsData")
    return new Promise((resolve) => {
        var options = {
            hostname: 'ext-api.airthings.com',
            port: 443,
            path: `/v1/devices/${sensor.sensor_id}/latest-samples`,
            method: 'GET',
            headers: {
                'Authorization': `${tokenType} ${accessToken}`
            }
        };

        var req = https.request(options, (res: any) => {
            console.log('statusCode:', res.statusCode);
            console.log('headers:', res.headers);

            var body = '';
            res.on('data', function (chunk: any) {
                body = body + chunk;
            });
        
            res.on('end', async function() {
                console.log("Body :" + body);
                if (res.statusCode === 200) {
                    const tokenObj = JSON.parse(body)["data"];

                    // TODO: This is dependent on the sensor type
                    const co2 = tokenObj["co2"];
                    const humidity = tokenObj["humidity"];
                    const pressure = tokenObj["pressure"];
                    const radonShortTermAvg = tokenObj["radonShortTermAvg"];
                    const temp = tokenObj["temp"];
                    const voc = tokenObj["voc"];
                    const pm1 = tokenObj["pm1"];
                    const pm25 = tokenObj["pm25"];
                    const time = new Date(tokenObj["time"] * 1000).toISOString();

                    if (time > sensor.watermark) {
                        const client = new AWS.TimestreamWrite({
                            region: "us-west-2",
                            endpoint: `https://ingest-cell1.timestream.us-west-2.amazonaws.com`,
                        });

                        console.log("Created timestream query client");
                        const timestreamClient = new HealthPlatformTimestreamInsertClient(client);
                        await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "CO2", co2, time));
                        await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "Humidity", humidity, time));
                        await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "Pressure", pressure, time));
                        await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "Radon", radonShortTermAvg, time));
                        await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "Temperature", temp, time));
                        await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "VOC", voc, time));
                        await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "PM1", pm1, time));
                        await timestreamClient.writeEvent(sensor.patient_id, sensor, getEvent(sensor, "PM2.5", pm25, time));

                        console.log("Updating high watermark");
                        sensor.watermark = time;
                        const sensorDao = new SensorDao(ddb);
                        await sensorDao.updateSensor(sensor);

                        resolve(true);
                    } else {
                        console.log("Time is before high watermark");
                        resolve(false);
                    }
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
