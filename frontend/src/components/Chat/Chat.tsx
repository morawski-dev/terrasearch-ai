import { ReactElement, useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import SendIcon from "../Icons/SendIcon";
import Loader from "../Loader/Loader";
import ExampleQuestion from "./ExampleQuestion";
import CrossIcon from "../Icons/CrossIcon";
import { exampleSearches } from "../../model/exampleData";
import Toast from "../Toast/Toast";

const Chat = () => {
  const [searchId, setSearchId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [toast, setToast] = useState<ReactElement<any, any>>();
  const [isTyping, setIsTyping] = useState(false);
  const textAreaRef = useRef(null);
  const backendApiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    //focus on text area after every rerender to make chat more fluent
    //@ts-ignore
    textAreaRef.current.focus();
  });

  useEffect(() => {
    //@ts-ignore
    const isFirefox = typeof InstallTrigger !== "undefined";
    const handleBeforeUnload = (event: any) => {
      if (searchId !== "") {
        if (!isFirefox) {
          fetch(`${backendApiUrl}/${searchId}`, {
            method: "DELETE",
            keepalive: true,
          });
        } else {
          deleteConversationAndClearHistory();
          event.preventDefault();
          event.returnValue = "";
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  });

  const checkInputMsgValid = () => {
    return (inputMessage && inputMessage.length > 1) || false;
  };

  const renderToast = (
    message: string,
    type: "success" | "error" | "warning",
    delay: number
  ) => {
    setTimeout(() => {
      setToast(undefined);
    }, delay);
    setToast(
      <Toast
        message={message}
        type={type}
        closeFunction={() => setToast(undefined)}
      />
    );
  };

  const handleSend = async (message?: string) => {
    setIsLoading(true);
    let currentSearchId = searchId;
    let currentMessage = message || inputMessage;
    if (searchId === "") {
      try {
        const response = await fetch(backendApiUrl, {
          method: "POST",
        });
        const data = await response.json();
        if (response.ok) {
          currentSearchId = data.search_id;
          setSearchId(currentSearchId);
          console.log("Received search ID:", currentSearchId);
        } else {
          renderToast(`Error fetching search ID: ${data}`, "error", 3000);
          console.error("Error fetching search ID:", data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    const apiUrl = `${backendApiUrl}/${currentSearchId}`;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: currentMessage }),
      });

      const data = await response.json();
      if (response.status === 200) {
        setChatHistory(data.response);
        setInputMessage("");
      }
      if (response.status === 408 || response.status === 504) {
        renderToast(
          `Request took longer than expected, please try again.`,
          "error",
          3000
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };

  const deleteConversationAndClearHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendApiUrl}/${searchId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSearchId("");
        setChatHistory([]);
        setInputMessage("");
        console.log("Search ended successfully.");
      } else {
        console.error("Error ending the search.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsLoading(false);
  };

  const renderHeading = () => {
    return (
      <section className="relative w-[40vw] min-w-[300px] sm:min-w-[500px] lg:min-w-[900px] flex items-center justify-center py-12 gap-12">
        <a className="text-2xl text-white cursor-pointer font-semibold text-center">
          Browse Data
        </a>
        <div className="relative inline-block py-4">
          <h2 className="text-2xl bg-[#01decd] bg-clip-text text-transparent font-semibold text-center">
            Explore with AI
          </h2>
          <span className="absolute right-0 bottom-0 w-full h-1 bg-gradient-to-r from-[#00fee4] to-[#0763aa]"></span>
        </div>
      </section>
    );
  };

  const renderTitle = () => {
    return (
      <section className="relative w-[40vw] min-w-[300px] sm:min-w-[500px] lg:min-w-[900px] flex flex-col gap-8 justify-center items-center sm:mb-24">
        <span className="inline w-full text-justify flex justify-center lg:gap-3">
          <h2 className="inline w-full text-3xl lg:text-[48px] font-semibold text-center">
            Explore Earth Observation content with{" "}
            <span className="inline text-3xl lg:text-[48px] bg-gradient-to-r from-[#01decd] to-[#0664a4] bg-clip-text text-transparent">
              TerraSearch AI
            </span>
          </h2>
        </span>
        <p className="text-base text-center">
          Browse through thousands of datasets from multiple data providers with
          AI powered search.
        </p>
      </section>
    );
  };

  const renderExample = () => {
    return (
      <section
        className={`relative w-[40vw] min-w-[300px] sm:min-w-[500px] lg:min-w-[900px] flex flex-col gap-4 justify-center items-center`}
      >
        <p className="text-xl mr-auto bg-[#01decd] bg-clip-text text-transparent">
          Get started with an example below:
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 justify-between">
          {exampleSearches.map((el) => {
            return (
              <ExampleQuestion
                key={el.id}
                icon={el.icon}
                label={el.label}
                onClickFunction={() => handleSend(el.question)}
              />
            );
          })}
        </div>
      </section>
    );
  };

  const renderChat = () => {
    return (
      <section className="relative w-[40vw] min-w-[300px] sm:min-w-[500px] lg:min-w-[900px] bg-transparent flex flex-col justify-center mb-4">
        <div className="max-h-[400px] overflow-auto mb-2 grow scrollbar">
          {chatHistory.map((msg, index) => (
            <ChatMessage
              key={index}
              isUser={msg.role === "human"}
              text={msg.content}
              ds={msg.datasource || null}
              shouldAnimate={index === chatHistory.length - 1 ? true : false}
              setIsTyping={setIsTyping}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <textarea
            ref={textAreaRef}
            autoFocus
            onKeyDown={(event: any) => {
              if (event.keyCode === 13 && event.shiftKey === false) {
                handleSend();
              }
            }}
            maxLength={500}
            cols={10}
            rows={4}
            style={{ resize: "none", outline: "none" }}
            className="w-full border-solid bg-transparent p-4 border-2 border-solid border-[#3c719c]"
            placeholder={
              chatHistory.length === 0
                ? "Ask TerraSearch AI ..."
                : "Reply to TerraSearch AI ..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading || isTyping}
          />
          {isLoading ? (
            <Loader style="ml-auto" />
          ) : (
            <div className="flex w-full ">
              {searchId !== "" && (
                <button
                  className="mr-auto hover:scale-125 transition ease-in-out flex"
                  onClick={deleteConversationAndClearHistory}
                >
                  <CrossIcon color="#5da4dc" width="1.5em" height="1.5em" />
                </button>
              )}
              <button
                disabled={!checkInputMsgValid()}
                className={`ml-auto ${
                  checkInputMsgValid()
                    ? "hover:scale-125 transition ease-in-out cursor-pointer"
                    : "cursor-default"
                }`}
                onClick={() => handleSend()}
              >
                <SendIcon
                  color={checkInputMsgValid() ? "#00ffe4" : "#6f706f"}
                  width="1.5em"
                  height="1.5em"
                />
              </button>
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="font-esa h-full w-full flex items-center justify-start flex-col gap-6 bg-[url(/assets/bg.png)] bg-no-repeat bg-cover overflow-x-hidden">
      {renderHeading()}
      {renderTitle()}
      {!searchId && renderExample()}
      {renderChat()}
      {toast}
    </div>
  );
};

export default Chat;
