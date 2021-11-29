import { BrowserRouter, Route, Switch } from "react-router-dom";
import { AuthState } from "@aws-amplify/ui-components";
import { Header } from "./Header";
import { Dashboard } from "../dashboard/Dashboard";
import { Settings } from "../settings/Settings";
import { Search } from "../search/Search";
import { CallHistory } from "../history/CallHistory";
import { AppAuthStateProps } from "../../types/propTypes";
import { CallNotification } from '../notifications/Notification';

export const Navigation = (props: AppAuthStateProps) => {
  return (
    <BrowserRouter>
      <CallNotification />
      <Header userName={props.userName} authState={props.authState} />
      {props.authState === AuthState.SignedIn ? (
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/history" component={CallHistory} />
          <Route path="/search" component={Search} />
          <Route path="/settings" component={Settings} />
        </Switch>
      ) : (
        <div/>
      )}
    </BrowserRouter>
  );
};
