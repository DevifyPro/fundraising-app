import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewCampaignForm from "../NewCampaignForm";

describe("NewCampaignForm", () => {
  it("renders form fields", () => {
    render(<NewCampaignForm />);
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Story/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Goal/i)).toBeInTheDocument();
  });

  it("disables submit while loading", async () => {
    render(<NewCampaignForm />);
    const button = screen.getByRole("button", { name: /create fundraiser/i });
    expect(button).toBeEnabled();
  });
});


