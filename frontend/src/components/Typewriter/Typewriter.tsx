import { useState, useEffect, SetStateAction, Dispatch } from "react";
import Markdown from "react-markdown";

type Props = {
  text: string;
  delay: number;
  dsRef: any;
  setIsTyping: Dispatch<SetStateAction<boolean>>;
};

export const LinkRenderer = (props: any) => {
  return (
    <a href={props.href} target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
};

const Typewriter = ({ text, delay, dsRef, setIsTyping }: Props) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setIsTyping(true);
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [currentIndex, delay, text]);

  useEffect(() => {
    if(dsRef.current){
      dsRef.current.scrollIntoView(false)
    }
  }, [currentText])

  return (
    <span className="chatMessage">
      <Markdown components={{ a: LinkRenderer }}>{currentText}</Markdown>
    </span>
  );
};

export default Typewriter;
