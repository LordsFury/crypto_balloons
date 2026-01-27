const ChangeItem = ({ label, value }) => {
  const isValidNumber = typeof value === "number" && !isNaN(value);
  const isPositive = isValidNumber && value >= 0;

  return (
    <div className="flex flex-col items-center justify-center py-2 rounded-xl bg-gray-200 backdrop-blur-md shadow-sm w-24">
      {/* Label */}
      <span className="text-xl font-semibold tracking-wide text-gray-600">
        {label}
      </span>

      {/* Value */}
      <span
        className={`text-lg font-bold flex items-center gap-1 ${
          isValidNumber
            ? isPositive
              ? "text-green-600"
              : "text-red-600"
            : "text-gray-500"
        }`}
      >

        {isValidNumber ? `${Math.abs(value).toFixed(2)}%` : "–"}
      </span>
    </div>
  );
};

export default ChangeItem;
