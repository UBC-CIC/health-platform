## Step 1: Device Setup
1. Unbox your Airthings Device and follow the steps in the setup guide provided in the box
<img src="../images/airthings_images/airthings_unbox.jpg" width=80%>
<img src="../images/airthings_images/setup_guide_airthings_1.jpg" width=80%>

2. You should now have an Airthings Device that is connected to the internet, paired to your phone and an Airthings account. 
3. Make note of the device serial number that appears when pairing, it is also visible near the battery compartment.
<img src="../images/airthings_images/airthings_bluetoothsn.png" width=80%>
<img src="../images/airthings_images/airthings_battery_compartment.jpg" width=80%>

## Step 2: API Register and Setup
1. Login to your [Airthings Dashboard](https://accounts.airthings.com/login?client_id=dashboard&redirect_uri=https://dashboard.airthings.com)
2. Navigate to the Integrations page from the sidebar. Click on API -> Request API Client 
<img src="../images/airthings_images/airthings_integration_board.png">

3. Fill out the name and description fields as deemed appropriate and ensure the following options match those in this image
<img src="../images/airthings_images/create_client_dashboard.png">

4. Click Save; the page will now display a ‘client id’ on the top right and a ‘client secret’ at the bottom. Take note of these values.
<img src="../images/airthings_images/create_client_dashboard_2.png">


## Step 3: Health Platform Device Integration
1. Log into the Health Platform website and navigate to the Patients page
<img src="../images/dashboard_user_guide/patients_dashboard.PNG">

2. Find the patient you want to add the sensor to, navigate to the sensor column, click on Manage -> Add Sensor 

3. Select the sensor type to be an Air Things Wave Plus. Then enter the Sensor ID, Client ID and Secret key which you got from your Airthings Dashboard. Select Add.
<img src="../images/airthings_images/health_platform_addsensor.png">

4. The Airthings sensor will now have been added to the dashboard and you will start to see CO2, Humidity, Pressure, Radon, Temperature, VOC, PM1 and PM2.5 readings. 
<img src="../images/airthings_images/health_platform_envdashboard.png">

## Troubleshooting
- If you have issues connecting your device to an enterprise wifi network, need the device IP, MAC Address and other details, check out the article provided by Airthings over here: https://help.airthings.com/en/articles/5379100-view-the-functionality-of-the-reset-button


