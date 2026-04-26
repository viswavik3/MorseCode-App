import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ReferencePage from "./ReferencePage";
import { renderWithRouter } from "../test/test-utils";

describe("ReferencePage", () => {
  it("filters the reference list by search term", () => {
    renderWithRouter(<ReferencePage />);

    fireEvent.change(screen.getByLabelText(/search characters or morse/i), {
      target: { value: "..---" },
    });

    expect(screen.getAllByText("2").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("A")).toHaveLength(0);
  });
});
