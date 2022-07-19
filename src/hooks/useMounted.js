import * as React from "react";

function useMounted() {
  const [isMounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  return isMounted;
}

export default useMounted;