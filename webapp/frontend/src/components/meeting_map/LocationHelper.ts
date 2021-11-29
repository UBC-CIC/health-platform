import { Signer } from "@aws-amplify/core";
import { Auth } from "aws-amplify";
import mapboxgl from "mapbox-gl";
let credentials: any;
const mapName = "firstrespondermap";

//Effects: request to load map resource from amazon location service
function transformRequest(url: string, resourceType: string) {
    if (resourceType === "Style" && !url.includes("://")) {
        // resolve to an AWS URL
        url = `https://maps.geo.us-east-1.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
    }
    if (url.includes("amazonaws.com")) {
        // only sign AWS requests (with the signature as part of the query string)
        return {
            url: Signer.signUrl(url, {
                access_key: credentials.accessKeyId,
                secret_key: credentials.secretAccessKey,
                session_token: credentials.sessionToken,
            }),
        };
    }
    // Don't sign
    return { url: url || "" };
}

class LocationServiceHelper {
    //create a map instance with center location, then return it
    async constructMapWithCenter(container: HTMLDivElement, center: mapboxgl.LngLat) {
        credentials = await Auth.currentCredentials();
        let map = new mapboxgl.Map({
            container: container,
            center: center,
            zoom: 3,
            minZoom: 3,
            style: mapName,
            pitch: 0,
            maxPitch: 0,
            transformRequest,
        });

        return map
    }

}

export default LocationServiceHelper