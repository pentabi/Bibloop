import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";

export const useDateChange = () => {
  const [showRestartAlert, setShowRestartAlert] = useState(false);

  // Use device local time instead of UTC
  const getDeviceDateString = () => {
    const today = new Date();
    return (
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  };

  const lastCheckDate = useRef(getDeviceDateString());

  // Get current chapter date from Redux
  const reduxChapterDate = useSelector(
    (state: RootState) => state.todaysChapter.chapter?.date
  );

  const getTodayDateString = () => {
    const today = new Date();
    return (
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  };

  const checkDateChange = () => {
    const today = getTodayDateString();

    // Check if the actual date has changed
    const dateHasChanged = lastCheckDate.current !== today;

    // Check if Redux has outdated data
    const reduxIsOutdated = reduxChapterDate && reduxChapterDate !== today;

    if (dateHasChanged || reduxIsOutdated) {
      console.log("📅 Date mismatch detected!");
      console.log(`Previous: ${lastCheckDate.current}, Current: ${today}`);
      console.log(`Redux: ${reduxChapterDate} vs Today: ${today}`);

      lastCheckDate.current = today;
      setShowRestartAlert(true);
    }
  };

  // Check for date changes every minute
  useEffect(() => {
    const interval = setInterval(checkDateChange, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [reduxChapterDate]);

  const dismissAlert = () => {
    setShowRestartAlert(false);
  };

  return {
    showRestartAlert,
    dismissAlert,
  };
};
