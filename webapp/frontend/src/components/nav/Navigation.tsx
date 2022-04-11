import { AuthState } from "@aws-amplify/ui-components";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { AppAuthStateProps } from "../../types/propTypes";
import { Dashboard } from "../dashboard/Dashboard";
import { Events } from "../events/Events";
import Patients from "../patients/Patients";
import Simulate from "../simulate/Simulate";
import Users from "../users/Users";
import ResponsiveAppBar from "./ResponsiveAppBar";

export const Navigation = (props: AppAuthStateProps) => {

    return (
        <BrowserRouter>
            {/* <Header userName={props.userName} authState={props.authState} /> */}
            <ResponsiveAppBar {...props} />
            {props.authState === AuthState.SignedIn ? (
                <Switch>
                    {props.userDetail && (
                        <>
                            <Route path="/" exact component={() => <Redirect to="/dashboard" />} />
                            <Route path="/dashboard" component={() => <Dashboard userName={props.userName} userId={props.userId} userDetail={props.userDetail} patients={props.patients} />} />
                            <Route path="/events" component={() => <Events userName={props.userName} userId={props.userId} userDetail={props.userDetail} patients={props.patients} />} />
                            <Route path="/patients" component={() => <Patients userDetail={props.userDetail} userName={props.userName} userId={props.userId} />} />
                            {
                                (props.userDetail.user_type === "ADMIN") && <Route path="/users" component={() => <Users userName={props.userName} userId={props.userId} userDetail={props.userDetail}  />} />
                            }
                            <Route path="/simulate" component={() => <Simulate userName={props.userName} userId={props.userId} userDetail={props.userDetail} patients={props.patients} />} />
                        </>
                    )}
                </Switch>
            ) : (
                <div />
            )}
        </BrowserRouter>
    );
};
