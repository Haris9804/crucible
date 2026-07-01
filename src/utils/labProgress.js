const LAB_PROGRESS_KEY = "cyber-learning-lab-progress";

export function getAllLabProgress() {
  try {
    const savedProgress = localStorage.getItem(LAB_PROGRESS_KEY);

    if (!savedProgress) {
      return {};
    }

    const parsedProgress = JSON.parse(savedProgress);

    return parsedProgress && typeof parsedProgress === "object"
      ? parsedProgress
      : {};
  } catch (error) {
    console.error("Unable to read lab progress:", error);
    return {};
  }
}

export function getLabProgress(labId) {
  const allProgress = getAllLabProgress();

  return (
    allProgress[String(labId)] || {
      completedPhases: [],
      totalPhases: 0,
      completed: false
    }
  );
}

export function saveLabProgress(
  labId,
  completedPhases,
  totalPhases
) {
  try {
    const allProgress = getAllLabProgress();

    const validCompletedPhases = [
      ...new Set(completedPhases)
    ].filter(
      (phaseIndex) =>
        Number.isInteger(phaseIndex) &&
        phaseIndex >= 0 &&
        phaseIndex < totalPhases
    );

    const completed =
      totalPhases > 0 &&
      validCompletedPhases.length === totalPhases;

    const updatedProgress = {
      ...allProgress,

      [String(labId)]: {
        completedPhases: validCompletedPhases,
        totalPhases,
        completed,
        updatedAt: new Date().toISOString()
      }
    };

    localStorage.setItem(
      LAB_PROGRESS_KEY,
      JSON.stringify(updatedProgress)
    );

    window.dispatchEvent(
      new CustomEvent("lab-progress-updated", {
        detail: {
          labId: String(labId),
          completed
        }
      })
    );

    return updatedProgress[String(labId)];
  } catch (error) {
    console.error("Unable to save lab progress:", error);
    return null;
  }
}