type Props = {
  message: string;
  type: "success" | "error" | "warning";
  closeFunction: any;
};

const Toast = ({ message, type = "success", closeFunction }: Props) => {
  const typeStyles: any = {
    success: "bg-green-700",
    error: "bg-red-500",
    warning: "bg-yellow-500",
  };

  return (
    <div
      className={`fixed top-5 right-5 max-w-xs w-full p-4 rounded-lg shadow-lg text-white ${typeStyles[type]} transition-all duration-300 shadow-2xl`}
    >
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button className="ml-4 hover:scale-125" onClick={() => closeFunction(false)}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default Toast;
