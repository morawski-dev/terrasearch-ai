type Props = {
  icon: any;
  label: string;
  onClickFunction: () => void;
};

const ExampleQuestion = ({ icon, label, onClickFunction }: Props) => {
  return (
    <div
      onClick={onClickFunction}
      className="sm:max-w-[22%] h-[50%] sm:h-auto flex flex-col justify-between items-start border-2 border-[#02aaa1] p-3 gap-2 cursor-pointer hover:scale-105 transition ease-in-out"
    >
      {icon}
      {label}
    </div>
  );
};

export default ExampleQuestion;
