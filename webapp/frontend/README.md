# Health Platform Frontend

Contains React code that runs the webapp.

| Index                                                                     | Description                                               |
|:--------------------------------------------------------------------------|:----------------------------------------------------------| 
| [Prerequisites](#prerequisites)                                           | Check that previous instructions have been followed       |
| [Update AWS Constants](#step-1-update-aws-constants)                      | Update Cognito and Appsync constants                      |
| [Deploy Amplify Website](#step-2-deploy-amplify-website)                  | Deploy Amplify website                                    |
| [Frontend Development Setup](#step-3-frontend-development-setup-optional) | (Optional) Setup frontend environment for development     |

## Prerequisites

* Ensure graphql dependencies are available.
Follow the instructions [here](../backend/src/common/README.md) to do so.
* Make sure backend infrastructure and code is deployed. If its not deployed follow these [instructions](../backend/README.md) to do so.

## Step 1: Update AWS Constants
Add the AWS configuration for cognito and appsync end point so that frontend website can call backend APIS. Commit below configuration at `frontend/src/aws-exports.json`:-

```
{
    "HealthPlatformAppSync": {
      "GraphQLEndpoint": "",
      "Region": "us-west-2",
      "GraphQLAuthorizationType": "AMAZON_COGNITO_USER_POOLS",
      "DangerouslyConnectToHTTPEndpointForTesting": false
    },
    "HealthPlatformCognito": {
      "UserPoolClientId": "",
      "Region": "us-west-2",
      "UserPoolId": "",
      "AuthenticatedRole": "",
      "IdentityPoolId": "",
      "UserPoolDomainPrefix": "health-platform-admin",
      "UnauthenticatedRole": ""
    }
}
```
`Note`: Login to AWS console to get the AppSync GraphQL API endpoint and Cognito configuration. **Ensure your console is in the us-west-2 region to find these constants**.

### GraphQLEndpoint

Navigate to the AppSync page in the AWS console and click on healthPlatformAdminsGraphQLAPI.

![alt text](/docs/images/deployment_guide/appsync.PNG)

Select settings from the sidebar, and copy the API URL which will be your GraphQLEndpoint.

![alt text](/docs/images/deployment_guide/appsync_endpoint.PNG)

### Cognito Constants

#### UserPoolId and UserClientId

Navigate to the Cognito Page in the AWS console and select Manage User Pools from the main page.

Select the health-platform-admin-user-pool.

![alt text](/docs/images/deployment_guide/cognito_user_pool.PNG)

Under General Settings you will find the UserPoolId.

![alt text](/docs/images/deployment_guide/user_pool_id.PNG)

Under App Clients you will find the UserPoolClientId.

![alt text](/docs/images/deployment_guide/user_pool_client_id.PNG)

#### IdentityPoolId

Next, navigate back to the Cognito Page in the AWS console and select Manage Identitiy Pools from the main page.

Select HealthPlatformIdentityPool_XXXXXXXXXXXX. Be careful not to select HealthPlatformIdentityPool.

![alt text](/docs/images/deployment_guide/cognito_identity_pool.PNG)

Select Edit Identity Pool in the top right corner.

![alt text](/docs/images/deployment_guide/cognito_identity_pool_2.PNG)

Here you will find the IdentityPoolId

![alt text](/docs/images/deployment_guide/cognito_identity_pool_id.PNG)

#### AuthenticatedRole and UnauthenticatedRole

Next, head to the IAM page in the AWS console. Select Roles from the sidebar and search for HealthPlatform_Website. 2 Roles should appear from the search.

![alt text](/docs/images/deployment_guide/iam.PNG)

Find the AuthenticatedRole and UnauthenticatedRole by copying the respective ARNs.

![alt text](/docs/images/deployment_guide/iam_authenticated.PNG)
![alt text](/docs/images/deployment_guide/iam_unauthenticated.PNG)

Commit your updated file before continuing onto the next step.

## Step 2: Deploy Amplify Website

Ensure you are logged into your AWS account and click the Deploy To Amplify Console button to begin the website deployment.

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/UBC-CIC/health-platform/tree/main)

The following page will appear after clicking the button. Ensure the correct region us-west-2 (Oregon) is selected. Click the connect to Github button and connect to your Github account.

![alt text](/docs/images/deployment_guide/amplify_1.PNG)

After connecting your Github account this window should appear. Click save and deploy to begin the deployment.

![alt text](/docs/images/deployment_guide/amplify_2.PNG)

The deployment will take a few minutes. Wait until the status of Verify is green.

![alt text](/docs/images/deployment_guide/amplify_3.PNG)

Next click on Rewrites and redirects from the sidebar and click edit.

- You will need to set up an Amplify rewrite condition with the following settings:
    - Source address: ```</^((?!\.(css|gif|ico|jpg|js|png|txt|svg|woff|ttf)$).)*$/>```
    - Target address: ```/index.html```
    - Type: ```200 (Rewrite)```

Refer to [AWS's Page on Single Page Apps](https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html#redirects-for-single-page-web-apps-spa) for further information why this is necessary.

It should look like this after you have added the above require condition.

![alt text](/docs/images/deployment_guide/amplify_4.PNG)

Your webapp is now deployed! Click on the generated Amplify link to open the webapp.

![alt text](/docs/images/deployment_guide/amplify_5.png)

Proceeed with [Frontend Development Setup](#step-3-frontend-development-setup-optional) if you would like to further develop the webapp. Otherwise, head to our [User Guide](/docs/UserGuide.md) to learn how to use the webapp.

## Step 3: Frontend Development Setup (Optional)
This step is only required if you would like to further develop the frontend website and be able to run a localhost. If you would like to just deploy the Amplify website, only follow the instructions up to [Step 2](#step-2-deploy-amplify-website) and ignore this section.

### Prerequisites

* Ensure graphql dependencies are available.
Follow the instructions [here](..backend/src/common/README.md) to do so.
* Make sure backend infrastructure and code is deployed. If its not deployed follow these [instructions](../backend/README.md) to do so.
* Once the backend is deployed, create `aws-exports.json` file as described above to point to correct AppSync API and Cognito user pool.

### Steps

Install the core dependencies:

```
npm install
npm run build
```

Start local server:

```
npm start
```

## Available scripts
### `npm install`
This installs the node modules specified in `package.json`.
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

