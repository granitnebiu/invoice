import React from "react";

export default function Input({
  id,
  type,
  name,
  value,
  onChange,
  required,
  label,
  styles = null,
  showHelperText = false,
}) {
  return (
    <div className="group relative z-0 mb-6 w-full">
      <input
        type={type}
        name={name}
        id={id}
        className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-gray-100 py-2.5 px-0  pl-3 text-sm font-medium text-gray-900 focus:border-red-600 focus:outline-none focus:ring-0  "
        placeholder=" "
        autoComplete="off"
        required={required}
        value={value}
        onChange={onChange}
        style={styles}
      />
      <label
        htmlFor={name}
        className="absolute top-1 z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-red-600  "
      >
        {label}
      </label>
      {showHelperText === true && (
        <p className="pt-1 text-[10px] text-gray-400">
          example: 62123123, no zero, no prefix, no plus
        </p>
      )}
    </div>
  );
}
