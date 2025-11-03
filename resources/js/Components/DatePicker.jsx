import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";
import "flatpickr/dist/themes/material_blue.css";

const baseClasses =
  "rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 " +
  "dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-indigo-600 dark:focus:ring-indigo-600";

export default forwardRef(function DatePicker(
  { className = "", name, options = {}, onChange, value, ...props },
  ref
) {
  const inputRef = useRef(null);
  const pickerRef = useRef(null);
  const optionsOnChangeRef = useRef(options?.onChange);
  const propOnChangeRef = useRef(onChange);

  useImperativeHandle(ref, () => inputRef.current);

  useEffect(() => {
    propOnChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    optionsOnChangeRef.current = options?.onChange;
  }, [options?.onChange]);

  const appendTarget = useMemo(() => {
    if (options?.appendTo) {
      return options.appendTo;
    }
    if (typeof document !== "undefined") {
      return document.body;
    }
    return undefined;
  }, [options?.appendTo]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!inputRef.current) {
      return;
    }

    const instance = flatpickr(inputRef.current, {
      dateFormat: "Y-m-d",
      allowInput: true,
      disableMobile: true,
      clickOpens: !(props.readOnly || props.disabled),
      ...((options && typeof options === "object" ? { ...options } : {})),
      appendTo: appendTarget,
      onChange: (selectedDates, dateStr, fpInstance) => {
        if (typeof optionsOnChangeRef.current === "function") {
          optionsOnChangeRef.current(selectedDates, dateStr, fpInstance);
        }
        if (typeof propOnChangeRef.current === "function") {
          propOnChangeRef.current({
            target: {
              name,
              value: dateStr,
            },
          });
        }
      },
    });

    pickerRef.current = instance;

    if (value) {
      instance.setDate(value, false);
    } else {
      instance.clear();
    }

    return () => {
      instance.destroy();
      pickerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appendTarget]);

  useEffect(() => {
    if (pickerRef.current) {
      if (value) {
        pickerRef.current.setDate(value, false);
      } else {
        pickerRef.current.clear();
      }
    } else if (inputRef.current) {
      inputRef.current.value = value ?? "";
    }
  }, [value]);

  useEffect(() => {
    if (pickerRef.current) {
      pickerRef.current.set("clickOpens", !(props.readOnly || props.disabled));
    }
  }, [props.disabled, props.readOnly]);

  useEffect(() => {
    if (pickerRef.current && options) {
      const { onChange: _onChange, appendTo: _appendTo, ...rest } =
        options ?? {};
      if (Object.keys(rest).length > 0) {
        pickerRef.current.set(rest);
      }
    }
  }, [options]);

  const handleNativeChange = (event) => {
    const dateStr = event.target.value;
    if (pickerRef.current) {
      pickerRef.current.setDate(dateStr, false);
    }
    if (typeof optionsOnChangeRef.current === "function") {
      optionsOnChangeRef.current([], dateStr, pickerRef.current);
    }
    if (typeof propOnChangeRef.current === "function") {
      propOnChangeRef.current({
        target: {
          name,
          value: dateStr,
        },
      });
    }
  };

  if (typeof window === "undefined") {
    return (
      <input
        {...props}
        ref={inputRef}
        type="date"
        name={name}
        value={value ?? ""}
        className={`${baseClasses} ${className}`.trim()}
        onChange={handleNativeChange}
      />
    );
  }

  return (
    <input
      {...props}
      ref={inputRef}
      name={name}
      className={`${baseClasses} ${className}`.trim()}
      defaultValue={value ?? ""}
      autoComplete="off"
      onChange={handleNativeChange}
    />
  );
});
