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

    pad.setPointerCapture = vi.fn();

    act(() => {
      fireEvent.pointerDown(pad, { pointerId: 1, pointerType: "mouse" });
      fireEvent.pointerUp(pad, { pointerId: 1, pointerType: "mouse" });
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

    pad.setPointerCapture = vi.fn();

    act(() => {
      fireEvent.change(letterSlider, { target: { value: "1200" } });
      fireEvent.pointerDown(pad, { pointerId: 1, pointerType: "mouse" });
      fireEvent.pointerUp(pad, { pointerId: 1, pointerType: "mouse" });
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

    pad.setPointerCapture = vi.fn();

    act(() => {
      fireEvent.pointerDown(pad, { pointerId: 1, pointerType: "mouse" });
      fireEvent.pointerUp(pad, { pointerId: 1, pointerType: "mouse" });
    });

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.getByTestId("decoded-output")).toHaveValue("E");
  });

  it("does not steal focus to the output field when auto-committing a letter", () => {
    renderWithRouter(<MorseInputPage />);
    const pad = screen.getByRole("button", { name: /signal input pad/i });
    const output = screen.getByTestId("decoded-output");

    pad.setPointerCapture = vi.fn();

    act(() => {
      fireEvent.pointerDown(pad, { pointerId: 1, pointerType: "touch" });
      fireEvent.pointerUp(pad, { pointerId: 1, pointerType: "touch" });
      vi.advanceTimersByTime(800);
    });

    expect(output).toHaveValue("E");
    expect(document.activeElement).not.toBe(output);
  });

  it("uses the press timeout slider to switch between dot and dash", () => {
    renderWithRouter(<MorseInputPage />);
    const pad = screen.getByRole("button", { name: /signal input pad/i });
    const pressSlider = screen.getByRole("slider", {
      name: /press break timeout/i,
    });

    pad.setPointerCapture = vi.fn();

    act(() => {
      fireEvent.change(pressSlider, { target: { value: "500" } });
      fireEvent.pointerDown(pad, { pointerId: 1, pointerType: "mouse", timeStamp: 0 });
      fireEvent.pointerUp(pad, { pointerId: 1, pointerType: "mouse", timeStamp: 350 });
    });
    expect(screen.getByTestId("live-input-buffer")).toHaveTextContent(".");

    act(() => {
      fireEvent.change(pressSlider, { target: { value: "200" } });
      fireEvent.pointerDown(pad, { pointerId: 2, pointerType: "mouse", timeStamp: 0 });
    });
    act(() => {
      vi.advanceTimersByTime(220);
    });
    act(() => {
      fireEvent.pointerUp(pad, { pointerId: 2, pointerType: "mouse", timeStamp: 220 });
    });
    expect(screen.getByTestId("live-input-buffer")).toHaveTextContent(".-");
  });

  it("copies decoded output when clipboard is available", async () => {
    renderWithRouter(<MorseInputPage />);
    const pad = screen.getByRole("button", { name: /signal input pad/i });
    const copy = screen.getByRole("button", { name: /^copy$/i });

    pad.setPointerCapture = vi.fn();

    act(() => {
      fireEvent.pointerDown(pad, { pointerId: 1, pointerType: "mouse" });
      fireEvent.pointerUp(pad, { pointerId: 1, pointerType: "mouse" });
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

  it("does not double-enter a dot on touch devices when compatibility mouse events follow", () => {
    renderWithRouter(<MorseInputPage />);
    const pad = screen.getByRole("button", { name: /signal input pad/i });

    pad.setPointerCapture = vi.fn();

    act(() => {
      fireEvent.pointerDown(pad, { pointerId: 9, pointerType: "touch" });
      fireEvent.pointerUp(pad, { pointerId: 9, pointerType: "touch" });
      fireEvent.mouseDown(pad);
      fireEvent.mouseUp(pad);
    });

    expect(screen.getByTestId("live-input-buffer")).toHaveTextContent(".");
  });
});
