import { AuthState } from "@aws-amplify/ui-components";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AppAuthStateProps } from "../../types/propTypes";
import { Dashboard } from "../dashboard/Dashboard";
import { Events } from "../events/Events";
import Patients from "../patients/Patients";
import Users from "../users/Users";
import ResponsiveAppBar from "./ResponsiveAppBar";

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
                    <Route path="/patients" component={() => <Patients isAdmin={props.isAdmin} userName={props.userName} userId={props.userId} />} />
                    {
                        props.isAdmin && <Route path="/users" component={() => <Users userName={props.userName} userId={props.userId} />} />
                    }
                </Switch>
            ) : (
                <div />
            )}
        </BrowserRouter>
    );
};
