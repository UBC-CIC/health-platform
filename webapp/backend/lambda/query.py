import awswrangler as wr
import boto3
import json


def handler(event, context):
    s3 = boto3.client('s3') 

    bucket = 'health-platform-iot-parquetmetricsbucket-1us5r4db3cfwo'

    result = s3.list_objects(Bucket=bucket, Prefix="data/", Delimiter='/')
    for o in result.get('CommonPrefixes'):
        print(o.get('Prefix'))
    print("---")

    # Retrieving the data directly from Amazon S3
    df = wr.s3.read_parquet("s3://health-platform-iot-parquetmetricsbucket-1us5r4db3cfwo/data/year=2021/month=12/day=21/hour=01/", dataset=True)

    df = df[df["heartrate"].notna()]
    timestamp = df["timestamp"].astype(int).tolist()
    heartrate = df["heartrate"].astype(float).tolist()

    print(timestamp)
    print(heartrate)

    return {
        "timestamp": timestamp,
        "heartrate": heartrate
    }

if __name__ == "__main__":
    event = []
    context = []
    handler(event, context)
