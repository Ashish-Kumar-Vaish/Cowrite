import { useEffect, useRef } from "react";

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    // Keep the latest handler without recreating the event listener
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    function handleEvent(event: WindowEventMap[K]) {
      // Use the latest handler when the event listener is triggered
      savedHandler.current(event);
    }

    window.addEventListener(eventName, handleEvent);

    return () => {
      window.removeEventListener(eventName, handleEvent);
    };
  }, [eventName]);
}
