import { useEffect, useState } from "react";

const useLocalStorage = (key: string, initialValue: any) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      setValue(JSON.parse(item));
    }
  }, [key]);

  const setLocalStorage = (value: any) => {
    window.localStorage.setItem(key, JSON.stringify(value));
    setValue(value);
    console.log("value", value)
  };

  return [value, setLocalStorage];
};

export default useLocalStorage;
