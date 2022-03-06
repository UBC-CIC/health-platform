import { AuthState } from '@aws-amplify/ui-components';

export type AppAuthStateProps = {
    userName?: string;
    userId?: string;
    authState?: AuthState;
    isAdmin: boolean;
}