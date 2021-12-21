import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AuthState } from "@aws-amplify/ui-components";
import { Dashboard } from "../dashboard/Dashboard";
import { AppAuthStateProps } from "../../types/propTypes";
import ResponsiveAppBar from "./ResponsiveAppBar";

export const Navigation = (props: AppAuthStateProps) => {
  return (
    <BrowserRouter>
      {/* <Header userName={props.userName} authState={props.authState} /> */}
      <ResponsiveAppBar />
      {props.authState === AuthState.SignedIn ? (
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
        </Switch>
      ) : (
        <div/>
      )}
    </BrowserRouter>
  );
};
