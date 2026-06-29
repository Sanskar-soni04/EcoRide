import React from "react";

/**
 * FloatingInput - lightweight floating label input
 * No external icon dependency; accepts optional `addon` prop for emoji/SVG.
 */
export default function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  max,
  step,
  addon, // small element (emoji or svg)
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || " "}
        required={required}
        min={min}
        max={max}
        step={step}
        className="peer w-full bg-transparent border border-gray-700/40 rounded-xl px-4 pt-5 pb-2 text-sm outline-none transition focus:border-blue-400 focus:shadow-md text-gray-100"
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-3 text-xs text-gray-300 peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all pointer-events-none"
      >
        {label}
      </label>

      {addon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300">
          {addon}
        </div>
      )}
    </div>
  );
}
