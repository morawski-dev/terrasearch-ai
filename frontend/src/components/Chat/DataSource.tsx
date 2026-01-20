import WorldCerealIcon from "../Icons/WorldCerealIcon";

type Props = {
  text: string;
};

const DataSource = ({ text }: Props) => {
  return (
    <div className="rounded-sm bg-[#06243c] bg-opacity-90 px-3 flex items-center gap-2">
      <p className="capitalize">{text}</p>
      {text.toLowerCase() === "worldcereal" && <WorldCerealIcon />}
      {text.toLowerCase() === "agrostac" && (
        <img
          src="assets/agrostac.png"
          style={{
            height: "20px",
            width: "auto",
          }}
        />
      )}
      {text.toLowerCase() === "agame" && (
        <img
          src="assets/agame.png"
          style={{
            height: "20px",
            width: "auto",
          }}
        />
      )}
      {text.toLowerCase() === "terra" && (
        <img
          src="assets/terra.png"
          style={{
            height: "20px",
            width: "auto",
          }}
        />
      )}
    </div>
  );
};

export default DataSource;
