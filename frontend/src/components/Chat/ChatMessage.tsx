import React, { Dispatch, SetStateAction, useRef } from "react";
import Typewriter, { LinkRenderer } from "../Typewriter/Typewriter";
import PersonIcon from "../Icons/PersonIcon";
import AIIcon from "../Icons/AIIcon";
import DataSource from "./DataSource";
import DSIcon from "../Icons/DSIcon";
import Markdown from "react-markdown";

interface ChatMessageProps {
  isUser: boolean;
  text: string;
  ds: string[];
  shouldAnimate: boolean;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  isUser,
  text,
  ds,
  shouldAnimate,
  setIsTyping,
}) => {
  const dsRef = useRef<null | HTMLDivElement>(null);

  const renderDataSources = () => {
    if (ds && ds.length > 0) {
      return (
        <div className="flex items-center mt-6 gap-2">
          <DSIcon />
          <p>Data Source:</p>
          {ds.map((d: string, index: number) => {
            return <DataSource key={index} text={d} />;
          })}
        </div>
      );
    }
  };
  return (
    <div
      className={`flex flex-row ${
        isUser ? "justify-end" : "justify-start"
      } items-start mb-[20px]`}
    >
      {!isUser && (
        <AIIcon className="mx-2 mt-[10px]" width="30px" height="30px" />
      )}
      <div
        className={`max-w-[80%] sm:max-w-[70%] p-[10px] rounded-2xl ${
          isUser ? "bg-[#047274]" : "bg-transparent"
        } text-white leading-relaxed text-wrap`}
      >
        {!isUser && shouldAnimate ? (
          <>
            <Typewriter
              text={text}
              delay={10}
              dsRef={dsRef}
              setIsTyping={setIsTyping}
            />
            <div ref={dsRef}>{renderDataSources()}</div>
          </>
        ) : (
          <span className="chatMessage">
            <Markdown components={{ a: LinkRenderer }}>{text}</Markdown>
            <div ref={dsRef}>{renderDataSources()}</div>
          </span>
        )}
      </div>
      {isUser && (
        <PersonIcon className="mx-2 mt-[10px]" width="30px" height="30px" />
      )}
    </div>
  );
};

export default ChatMessage;
