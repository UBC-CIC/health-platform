import { Hub, HubCallback } from '@aws-amplify/core';
import { AuthState, onAuthUIStateChange, TOAST_AUTH_ERROR_EVENT, UI_AUTH_CHANNEL } from '@aws-amplify/ui-components';
import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';
import { Alert, createTheme, ThemeProvider } from '@mui/material';
import React from 'react';
import './App.css';
import { Navigation } from './components/nav/Navigation';
import UserContext from './context/UserContext';

declare module '@mui/material/styles' {
    interface Theme {
        status: {
            danger: string;
        };
    }
    // allow configuration using `createTheme`
    interface ThemeOptions {
        status?: {
            danger?: string;
        };
    }
}

function App() {

    const [authState, setAuthState] = React.useState<AuthState>();
    const { user, setUser } = React.useContext(UserContext);
    const [alertMessage, setAlertMessage] = React.useState('');

    const theme = createTheme({
        palette: {
          primary: {
            light: '#4f83cc',
            main: '#01579b',
            dark: '#002f6c',
            contrastText: '#fff',
          },
          secondary: {
            light: '#fa5788',
            main: '#c2185b',
            dark: '#8c0032',
            contrastText: '#fff',
          },
        },
      });

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
        <ThemeProvider theme={theme}>
            <div className="App">
                <Navigation userName={user.attributes.email} authState={authState} />
            </div>
        </ThemeProvider>
    ) : (
        <div slot="sign-in" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'white'
        }}>
            {alertMessage && (<Alert className="authenticator-toast" severity="error" onClose={() => setAlertMessage("")}>{alertMessage}</Alert>)}
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
