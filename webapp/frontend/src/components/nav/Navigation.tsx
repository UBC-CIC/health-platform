import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AuthState } from "@aws-amplify/ui-components";
import { Dashboard } from "../dashboard/Dashboard";
import { Events } from "../events/Events";
import { AppAuthStateProps } from "../../types/propTypes";
import ResponsiveAppBar from "./ResponsiveAppBar";

export const Navigation = (props: AppAuthStateProps) => {
    return (
        <BrowserRouter>
            {/* <Header userName={props.userName} authState={props.authState} /> */}
            <ResponsiveAppBar {...props} />
            {props.authState === AuthState.SignedIn ? (
                <Switch>
                    <Route path="/" exact component={() => <Dashboard userName={props.userName} />} />
                    <Route path="/dashboard" component={() => <Dashboard userName={props.userName} />} />
                    <Route path="/events" component={() => <Events userName={props.userName} />} />
                </Switch>
            ) : (
                <div />
            )}
        </BrowserRouter>
    );
};
