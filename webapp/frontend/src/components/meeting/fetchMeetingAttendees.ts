import { GraphQLResult } from "@aws-amplify/api";
import { API } from "aws-amplify";
import { getMeetingDetail } from "../../common/graphql/queries";
import { GetMeetingDetailQuery } from "../../common/types/API";

const fetchMeetingAttendees = async (options: {meeting_id: string}): Promise<GraphQLResult<GetMeetingDetailQuery>> =>
  API.graphql({
    query: getMeetingDetail, 
    variables: {
        meetingId: options.meeting_id,
    },
}) as GraphQLResult<GetMeetingDetailQuery>;

export default fetchMeetingAttendees;
