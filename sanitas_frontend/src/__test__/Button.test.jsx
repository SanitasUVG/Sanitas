import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import Button from "../components/Button.jsx";

describe("Button Component", () => {
  test("Renders Button Correctly", () => {
    render(<Button />);
  });

  test("renders button with correct text", () => {
    const buttonText = "Click me";
    const handleClick = vi.fn(); // Changed from jest.fn() to vi.fn()
    const { getByText } = render(<Button text={buttonText} onClick={handleClick} />);
    const buttonElement = getByText(buttonText);
    expect(buttonElement).toBeInTheDocument();
  });

  test("calls onClick when button is clicked", () => {
    const handleClick = vi.fn(); // Changed from jest.fn() to vi.fn()
    const { getByText } = render(<Button text="Click me" onClick={handleClick} />);
    const buttonElement = getByText("Click me");

    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
