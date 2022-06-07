import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Amplify from "aws-amplify";
import stack from './aws-exports.json';
import { UserProvider } from './context/UserContext';

// const Cognito = stack['HealthPlatformCognito']
// const AppSync = stack['HealthPlatformAppSync']

const config = {
    aws_project_region: "us-west-2",
    oauth: {},
    // Cognito
    aws_cognito_identity_pool_id: process.env.REACT_APP_IDENTITYPOOLID,
    aws_cognito_region: "us-west-2",
    aws_user_pools_id: process.env.REACT_APP_USERPOOLID,
    aws_user_pools_web_client_id: process.env.REACT_APP_USERPOOLCLIENTID,
    // AppSync
    aws_appsync_graphqlEndpoint: process.env.REACT_APP_GRAPHQLENDPOINT,
    aws_appsync_region: "us-west-2",
    aws_appsync_authenticationType: "AMAZON_COGNITO_USER_POOLS",
    aws_appsync_dangerously_connect_to_http_endpoint_for_testing: true
}

Amplify.configure(config)

ReactDOM.render(
//   <React.StrictMode>
//     <UserProvider>
//       <App />
//     </UserProvider>
//   </React.StrictMode>,
    <UserProvider>
      <App />
    </UserProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
