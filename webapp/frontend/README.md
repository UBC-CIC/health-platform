# Health Platform Frontend

Contains React code that runs the webapp.

| Index                                                                     | Description                                               |
|:--------------------------------------------------------------------------|:----------------------------------------------------------| 
| [Prerequisites](#prerequisites)                                           | Check that previous instructions have been followed       |
| [Create Amplify IAM Role](#step-1-create-amplify-iam-role)                | Create the required Amplify IAM Role                      |
| [Deploy Amplify Website](#step-2-deploy-amplify-website)                  | Deploy Amplify website                                    |
| [Frontend Development Setup](#step-3-frontend-development-setup-optional) | (Optional) Setup frontend environment for development     |

## Prerequisites

* Ensure graphql dependencies are available.
Follow the instructions [here](../backend/src/common/README.md) to do so.
* Make sure backend infrastructure and code is deployed. If its not deployed follow these [instructions](../backend/README.md) to do so.

## Step 1: Create Amplify IAM Role

Before deploying the Amplify Website we need to create the IAM Role that associate the policies needed to implement this solution. Ensure you have navigated to the frontend directory and run the following command.

```
aws cloudformation deploy --template-file cfn-amplifyRole.yaml --stack-name amplifyconsole-healthplatform-backend-role --capabilities CAPABILITY_NAMED_IAM --profile health-platform
```

The command creates the role name **amplifyconsole-healthplatform-backend-role** that will be used on the next step.

## Step 2: Deploy Amplify Website

Ensure you are logged into your AWS account and click the Deploy To Amplify Console button to begin the website deployment.

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/UBC-CIC/health-platform/tree/main)

The following page will appear after clicking the button. Ensure the correct region us-west-2 (Oregon) is selected. Click the connect to Github button and connect to your Github account.

![alt text](/docs/images/deployment_guide/amplify_1.PNG)

After connecting your Github account this window should appear. Click save and deploy to begin the deployment.

![alt text](/docs/images/deployment_guide/amplify_2.PNG)

Next, click general in the sidebar and click edit in the top right corner. Open the Service Role dropdown menu and select the **amplifyconsole-healthplatform-backend-role** that aws created in [Step 1](#step-1-create-amplify-iam-role). Finish by clicking save.

![alt text](/docs/images/deployment_guide/amplify_6.PNG)

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

