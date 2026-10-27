import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginView } from "./LoginView";

describe("LoginView", () => {
  it("submits trimmed credentials and supports password visibility", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue(true);
    render(<LoginView onLogin={onLogin} loading={false} error="" />);

    const password = screen.getByLabelText(/^Password/);
    expect(password).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");

    await user.type(screen.getByLabelText(/^Username/), "  demo  ");
    await user.type(password, "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onLogin).toHaveBeenCalledWith("demo", "secret");
  });

  it("shows a local error when fields are empty", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue(true);
    render(<LoginView onLogin={onLogin} loading={false} error="" />);

    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Enter your username and password");
  });

  it("preserves fields and shows a recoverable server error", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn().mockResolvedValue(false);
    const { rerender } = render(<LoginView onLogin={onLogin} loading={false} error="" />);

    await user.type(screen.getByLabelText(/^Username/), "demo");
    await user.type(screen.getByLabelText(/^Password/), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    rerender(<LoginView onLogin={onLogin} loading={false} error="Invalid username or password." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid username or password.");
    expect(screen.getByLabelText(/^Username/)).toHaveValue("demo");
    expect(screen.getByLabelText(/^Password/)).toHaveValue("wrong");
  });

  it("disables the form while signing in", () => {
    render(<LoginView onLogin={vi.fn()} loading error="" />);
    expect(screen.getByLabelText(/^Username/)).toBeDisabled();
    expect(screen.getByLabelText(/^Password/)).toBeDisabled();
    expect(screen.getByRole("button", { name: /Signing in/ })).toBeDisabled();
  });
});

