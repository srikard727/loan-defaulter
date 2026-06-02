import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";

type AddLoanerProps = {
  addingLoaner: boolean;
  onAddLoaner: (name: string) => Promise<void>;
};

export function AddLoaner({ addingLoaner, onAddLoaner }: AddLoanerProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formError, setFormError] = useState("");

  const handleAddLoaner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    if (!cleanFirstName || !cleanLastName) {
      setFormError("First and last name are required.");
      return;
    }

    setFormError("");
    try {
      await onAddLoaner(`${cleanFirstName} ${cleanLastName}`);
      setFirstName("");
      setLastName("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not add loaner.");
    }
  };

  return (
    <div className="page-stack add-loaner-page">
      <section className="panel add-loaner-panel">
        <div className="panel-title add-loaner-title">
          <span className="brand-mark">
            <UserPlus size={21} />
          </span>
          <h2>Add New Loaner</h2>
        </div>
        <form className="add-loaner-form" onSubmit={handleAddLoaner}>
          <div className="name-grid">
            <label className="field stacked-field">
              <span>First Name</span>
              <input autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </label>
            <label className="field stacked-field">
              <span>Last Name</span>
              <input autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </label>
          </div>
          <button className="primary-button compact-primary-button" type="submit" disabled={addingLoaner}>
            <UserPlus size={18} />
            <span>{addingLoaner ? "Adding..." : "Add Loaner"}</span>
          </button>
          {formError && <p className="form-error">{formError}</p>}
        </form>
      </section>
    </div>
  );
}
