// Update the interface to include onStepAmountChange
interface PolyTrackProps {
  currentStep: number;
  stepAmount: number;
  onStepAmountChange?: (steps: number) => void;
}