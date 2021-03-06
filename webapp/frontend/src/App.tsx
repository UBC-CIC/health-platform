import { Hub, HubCallback } from '@aws-amplify/core';
import { AuthState, onAuthUIStateChange, TOAST_AUTH_ERROR_EVENT, UI_AUTH_CHANNEL } from '@aws-amplify/ui-components';
import { AmplifyAuthenticator, AmplifySignUp } from '@aws-amplify/ui-react';
import { Alert, createTheme, Grid, ThemeProvider } from '@mui/material';
import { API } from 'aws-amplify';
import React from 'react';
import './App.css';
import { getPatientsDetail, getUsersDetail } from './common/graphql/queries';
import { PatientsDetail, UsersDetail } from './common/types/API';
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
    const [isLoading, setIsLoading] = React.useState<any>(true);
    const [userDetail, setUserDetail] = React.useState<UsersDetail>({} as UsersDetail);
    const [patients, setPatients] = React.useState<PatientsDetail[]>([] as PatientsDetail[]);

    async function loadUserDetails(userId: string) {
        try {
            const response: any = await API.graphql({
                query: getUsersDetail,
                variables: {
                    userId: userId,
                },
            });
            console.log("getUsersDetail response:", response);
            const userDetail: UsersDetail = response["data"]["getUsersDetail"];

            setUserDetail(userDetail)
            console.log("Is User Admin? ", userDetail.user_type === "ADMIN")

            const patientDetails: PatientsDetail[] = [];
            if (userDetail.patient_ids) {
                for (const patient_id of userDetail.patient_ids) {
                    const patientDetailObj: any = await API.graphql({
                        query: getPatientsDetail,
                        variables: {
                            patientId: patient_id,
                        }
                    });
                    const patientDetail: PatientsDetail = patientDetailObj["data"]["getPatientsDetail"];
                    patientDetails.push(patientDetail);
                }
            }
            setPatients(patientDetails);

            setIsLoading(false);
        } catch (e) {
            console.log('getUsersDetail errors:', e);
        }
    }

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
        return onAuthUIStateChange((nextAuthState: any, authData: any) => {
            // Initial splash screen
            console.log("onAuthUIStateChange");

            // Called when user logs in
            //
            setAuthState(nextAuthState);

            // Don't log this as it contains sensitive data
            console.log(authData);

            if (authData) {
                // Note that the `attributes` object only exists during a normal login flow
                if (authData.attributes && authData.attributes.email) {
                    setUser({
                        username: authData.attributes.email,
                        userId: authData.username,
                    });
                    loadUserDetails(authData.username);
                } else {
                    // When user first signs up, the `attributes` object does not exist
                    setUser({
                        username: authData.username,
                        userId: authData.username,
                    });
                }
            }
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
            <UserContext.Provider value={user}>
                <div className="App">
                    <Navigation isLoading={isLoading} userName={user.username} userId={user.userId} userDetail={userDetail} patients={patients} authState={authState} />
                </div>
            </UserContext.Provider>
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
