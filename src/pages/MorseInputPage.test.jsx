import { act, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MorseInputPage from "./MorseInputPage";
import { renderWithRouter } from "../test/test-utils";

describe("MorseInputPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      value: vi.fn(),
    });
    window.AudioContext = vi.fn(() => ({
      createOscillator: () => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 0 },
        type: "sine",
      }),
      createGain: () => ({
        connect: vi.fn(),
        gain: { value: 0 },
      }),
      currentTime: 0,
      destination: {},
    }));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("removes the current signal buffer on the first backspace press", async () => {
    renderWithRouter(<MorseInputPage />);
    const pad = screen.getByRole("button", { name: /signal input pad/i });
    const backspace = screen.getByRole("button", { name: /backspace/i });
    const liveBuffer = screen.getByTestId("live-input-buffer");

    act(() => {
      fireEvent.mouseDown(pad);
      fireEvent.mouseUp(pad);
    });

    expect(liveBuffer).toHaveTextContent(".");

    act(() => {
      fireEvent.click(backspace);
    });

    expect(liveBuffer).toHaveTextContent("");
    expect(screen.getByText(/removed last signal/i)).toBeInTheDocument();
  });

  it("commits a letter only after the configured next-letter timeout", () => {
    renderWithRouter(<MorseInputPage />);
    const pad = screen.getByRole("button", { name: /signal input pad/i });
    const letterSlider = screen.getByRole("slider", {
      name: /next letter timeout/i,
    });

    act(() => {
      fireEvent.change(letterSlider, { target: { value: "1200" } });
      fireEvent.mouseDown(pad);
      fireEvent.mouseUp(pad);
    });

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByTestId("decoded-output")).toHaveValue("");

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByTestId("decoded-output")).toHaveValue("E");
  });

  it("does not auto-insert a space after a committed letter on a long pause", () => {
    renderWithRouter(<MorseInputPage />);
    const pad = screen.getByRole("button", { name: /signal input pad/i });

    act(() => {
      fireEvent.mouseDown(pad);
      fireEvent.mouseUp(pad);
    });

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByTestId("decoded-output")).toHaveValue("E");
  });

  it("uses the press timeout slider to switch between dot and dash", () => {
    renderWithRouter(<MorseInputPage />);
    const pad = screen.getByRole("button", { name: /signal input pad/i });
    const pressSlider = screen.getByRole("slider", {
      name: /press break timeout/i,
    });

    act(() => {
      fireEvent.change(pressSlider, { target: { value: "500" } });
      fireEvent.mouseDown(pad, { timeStamp: 0 });
      fireEvent.mouseUp(pad, { timeStamp: 350 });
    });
    expect(screen.getByTestId("live-input-buffer")).toHaveTextContent(".");

    act(() => {
      fireEvent.change(pressSlider, { target: { value: "200" } });
      fireEvent.mouseDown(pad, { timeStamp: 0 });
    });
    act(() => {
      vi.advanceTimersByTime(220);
    });
    act(() => {
      fireEvent.mouseUp(pad, { timeStamp: 220 });
    });
    expect(screen.getByTestId("live-input-buffer")).toHaveTextContent(".-");
  });

  it("copies decoded output when clipboard is available", async () => {
    renderWithRouter(<MorseInputPage />);
    const pad = screen.getByRole("button", { name: /signal input pad/i });
    const copy = screen.getByRole("button", { name: /^copy$/i });

    act(() => {
      fireEvent.mouseDown(pad);
      fireEvent.mouseUp(pad);
    });
    act(() => {
      vi.advanceTimersByTime(800);
    });

    await act(async () => {
      fireEvent.click(copy);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("E");
  });

  it("deletes the character before the cursor in the decoded output field", () => {
    renderWithRouter(<MorseInputPage />);
    const output = screen.getByTestId("decoded-output");
    const backspace = screen.getByRole("button", { name: /backspace/i });

    act(() => {
      fireEvent.change(output, { target: { value: "TEST" } });
    });
    output.focus();
    output.setSelectionRange(2, 2);

    act(() => {
      fireEvent.select(output);
      fireEvent.click(backspace);
    });

    expect(output).toHaveValue("TST");
  });

  it("adds a space from the dedicated button near the input pad", () => {
    renderWithRouter(<MorseInputPage />);
    const addSpace = screen.getByRole("button", { name: /add space/i });
    const output = screen.getByTestId("decoded-output");

    act(() => {
      fireEvent.click(addSpace);
    });

    expect(output).toHaveValue(" ");
  });
});
