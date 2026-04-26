import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ReversePage from "./ReversePage";
import { renderWithRouter } from "../test/test-utils";

describe("ReversePage", () => {
  it("converts supported text to morse output", () => {
    renderWithRouter(<ReversePage />);

    fireEvent.change(screen.getByLabelText(/source text/i), {
      target: { value: "SOS 2?" },
    });

    expect(screen.getAllByText("...")).toHaveLength(2);
    expect(screen.getByText("---")).toBeInTheDocument();
    expect(screen.getByText("..---")).toBeInTheDocument();
    expect(screen.getByText("..--..")).toBeInTheDocument();
    expect(screen.getByText("/")).toBeInTheDocument();
  });
});
