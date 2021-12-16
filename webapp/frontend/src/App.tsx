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
import UserContext from './context/UserContext';

function App() {

    const [authState, setAuthState] = React.useState<AuthState>();
    const {user, setUser} = React.useContext(UserContext);
    const [alertMessage, setAlertMessage] = React.useState('');

    React.useEffect(() => {
        return onAuthUIStateChange((nextAuthState, authData) => {
            setAuthState(nextAuthState);
            console.log(authData);
            setUser(authData);
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
            <Navigation userName={user.attributes.email} authState={authState} />
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
                    usernameAlias="email"
                    formFields={[
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
                    ]}
                />
            </AmplifyAuthenticator>
        </div>
    );
}

export default App;
