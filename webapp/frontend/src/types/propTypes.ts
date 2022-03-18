import { AuthState } from '@aws-amplify/ui-components';
import { PatientsDetail, UsersDetail } from '../common/types/API';

export type AppAuthStateProps = {
    userName?: string;
    userId?: string;
    authState?: AuthState;
    userDetail: UsersDetail;
    patients: PatientsDetail[];
}