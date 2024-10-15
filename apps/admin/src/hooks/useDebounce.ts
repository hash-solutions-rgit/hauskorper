import { useEffect, useState } from "react";

type Props = {
  value: string;
  delay: number;
};

function useDebounce({ delay = 500, value }: Props) {
  // local state
  const [debouncedValue, setDebouncedValue] = useState(value);

  //   side effects
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(id);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
