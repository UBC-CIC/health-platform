import React from 'react';
import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { Navigation } from './components/nav/Navigation';
import { Hub, HubCallback } from '@aws-amplify/core';
import {
    UI_AUTH_CHANNEL, TOAST_AUTH_ERROR_EVENT
} from '@aws-amplify/ui-components';
import './App.css';
import { Alert } from 'react-bootstrap';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme, MeetingProvider } from 'amazon-chime-sdk-component-library-react';
import UserContext from './context/UserContext';

function App() {

    const [authState, setAuthState] = React.useState<AuthState>();
    const {user, setUser} = React.useContext(UserContext);
    const [alertMessage, setAlertMessage] = React.useState('');

    React.useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            setAuthState(nextAuthState);
            setUser(authData)
        });
    }, []);

    const handleToastErrors: HubCallback = ({ payload }) => {
        if (payload.event === TOAST_AUTH_ERROR_EVENT && payload.message) {
            setAlertMessage(payload.message);
        }
    };

    React.useEffect(() => {
        Hub.listen(UI_AUTH_CHANNEL, handleToastErrors);
        return () => Hub.remove(UI_AUTH_CHANNEL, handleToastErrors);
    });

    return authState === AuthState.SignedIn && user ? (
        <div className="App">
            <ThemeProvider theme={lightTheme}>
                <MeetingProvider>
                    <Navigation userName={user.username} authState={authState} />
                </MeetingProvider>
            </ThemeProvider>
        </div>
    ) : (
        <div slot="sign-in" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'white'
        }}>
            <Navigation />
            {alertMessage && (<Alert className="authenticator-toast" variant="danger" onClose={() => setAlertMessage("")} dismissible>{alertMessage}</Alert>)}
            <AmplifyAuthenticator hideToast>
                <AmplifySignUp
                    slot="sign-up"
                    headerText="Create New Account"
                    formFields={[
                        {
                            type: "name",
                            label: "Full Name",
                            placeholder: "Full Name",
                            required: true,
                        },
                        {
                            type: "username",
                            label: "User Name",
                            placeholder: "User Name",
                            required: true,
                        },
                        {
                            type: "email",
                            label: "Email",
                            placeholder: "Email Address",
                            required: true,
                        },
                        {
                            type: "password",
                            label: "Password",
                            placeholder: "Password (at least eight characters)",
                            required: true,
                        },
                        {
                            type: "phone_number",
                            label: "Phone Number",
                            placeholder: "Phone Number",
                            required: true,
                        },
                    ]}
                />
            </AmplifyAuthenticator>
        </div>
    );
}

export default App;
