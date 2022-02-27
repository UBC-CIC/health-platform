import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AuthState } from "@aws-amplify/ui-components";
import { Dashboard } from "../dashboard/Dashboard";
import { Events } from "../events/Events";
import { AppAuthStateProps } from "../../types/propTypes";
import ResponsiveAppBar from "./ResponsiveAppBar";
import Patients from "../patients/Patients";
import Users from "../users/Users";

export const Navigation = (props: AppAuthStateProps) => {
    return (
        <BrowserRouter>
            {/* <Header userName={props.userName} authState={props.authState} /> */}
            <ResponsiveAppBar {...props} />
            {props.authState === AuthState.SignedIn ? (
                <Switch>
                    <Route path="/" exact component={() => <Dashboard userName={props.userName} userId={props.userId} />} />
                    <Route path="/dashboard" component={() => <Dashboard userName={props.userName} userId={props.userId} />} />
                    <Route path="/events" component={() => <Events userName={props.userName} />} />
                    <Route path="/patients" component={() => <Patients userName={props.userName} userId={props.userId} />} />
                    <Route path="/users" component={() => <Users userName={props.userName} />} />
                </Switch>
            ) : (
                <div />
            )}
        </BrowserRouter>
    );
};
