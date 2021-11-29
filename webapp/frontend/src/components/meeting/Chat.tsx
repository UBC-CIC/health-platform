import {
  ChatBubble,
  ChatBubbleContainer,
  formatTime,
  MessageAttachment,
  Textarea,
  useAudioVideo,
} from "amazon-chime-sdk-component-library-react";
import { AudioVideoFacade } from "amazon-chime-sdk-js";
import React, {
  ChangeEvent,
  ReactElement,
  useEffect,
  useReducer,
  useState,
} from "react";
import ScrollableFeed from "react-scrollable-feed";
import Colors from "../styling/Colors";
import byteSize from "byte-size";
import { useTheme } from "styled-components";
import "./Chat.css";

type ChatReducerState = {
  messages: Message[];
};

export type Message = {
  senderId: string;
  body: string;
  url?: string;
  meetingId?: string;
  size?: number;
  name?: string;
  createdTimestamp: string;
};

const initialState = { messages: [] as Message[] };

function reducer(state: ChatReducerState, action: any) {
  switch (action.type) {
    case "set":
      return { messages: action.payload };
    case "add":
      return { messages: [...state.messages, action.payload] };
    default:
      return state;
  }
}

function useMessageSubscription(audioVideo: AudioVideoFacade) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (audioVideo) {
      audioVideo?.realtimeSubscribeToReceiveDataMessage("chat", (message) => {
        const createdTimestamp = new Date().toString();
        console.log(message.data);
        const messageData = JSON.parse(
          Buffer.from(message.data).toString()
        ) as Message;
        messageData.createdTimestamp = createdTimestamp;
        dispatch({ type: "add", payload: messageData });
      });
    }
    return () => audioVideo?.realtimeUnsubscribeFromReceiveDataMessage("chat");
  }, [audioVideo]);

  const { messages }: { messages: Message[] } = state;
  return { messages, dispatch };
}

const Chat = ({
  attendeeId,
  attendees,
  meetingId
}: {
  attendeeId?: string;
  attendees?: any;
  meetingId: string;
}): ReactElement => {
  const audioVideo = useAudioVideo();
  const { messages, dispatch } = useMessageSubscription(
    audioVideo as AudioVideoFacade
  );
  const [currMessage, setCurrMessage] = useState("");

  const handleSendMessage = (body: string) => {
    const message: Message = {
      body,
      senderId: attendeeId as string,
      meetingId,
      createdTimestamp: new Date().toString(),
    };
    audioVideo?.realtimeSendDataMessage("chat", message);
    dispatch({ type: "add", payload: message });
    setCurrMessage("");
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!currMessage) return;
    if (e.key !== "Enter") return;
    handleSendMessage(currMessage);
  };

  if (!audioVideo) {
    return (
      <div
        className="flex column align"
        style={{ width: "100%", color: Colors.theme.platinum }}
      >
        Chat not available
      </div>
    );
  }

  return (
    <div className="chatContainer">
      <ScrollableFeed className="messageContainer">
        {messages.map((message, index) => {
          const type =
            message.senderId === attendeeId ? "outgoing" : "incoming";
          
            let name: string;
          
          if (!attendees || !attendees[message.senderId]) {
            name = "User";
          } else {
            const sender = attendees[message.senderId];
            name = sender.name;
          }
          
          if (type === "outgoing") name = "Me";

          const { name: fileName, size, url } = message;

          return (
            <ChatBubbleContainer
              timestamp={formatTime(message.createdTimestamp)}
              key={`message${index.toString()}`}
              css="margin: 0.5rem;"
            >
              <ChatBubble
                variant={type}
                senderName={name}
                className={`${type} message`}
                css="margin: 0.25rem;"
              >
                {message?.body}
                {url && (
                  <div className="attachment">
                    <MessageAttachment
                      name={fileName || "Attachment"}
                      size={`${byteSize(size)}`}
                      downloadUrl={url as string}
                    />
                  </div>
                )}
              </ChatBubble>
            </ChatBubbleContainer>
          );
        })}
      </ScrollableFeed>
      <Textarea
        placeholder="Start typing to send a message"
        label="Start typing to send a message"
        value={currMessage}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setCurrMessage(e.target.value)
        }
        onKeyUp={(e) => handleSubmit(e)}
      />
    </div>
  );
};

export default Chat;
