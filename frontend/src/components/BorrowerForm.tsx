import { BadgeCheck } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { ApplicantPayload } from "../types";

type BorrowerFormProps = {
  applicant: ApplicantPayload;
  loading?: boolean;
  onChange: (payload: ApplicantPayload) => void;
  onSubmit: () => void;
};

const educationOptions = ["High School", "Bachelor's", "Master's", "PhD"] as const;
const employmentOptions = ["Full-time", "Part-time", "Self-employed", "Unemployed"] as const;
const maritalOptions = ["Single", "Married", "Divorced"] as const;
const yesNoOptions = ["No", "Yes"] as const;
const purposeOptions = ["Auto", "Business", "Education", "Home", "Other"] as const;

export function BorrowerForm({ applicant, loading, onChange, onSubmit }: BorrowerFormProps) {
  const [emptyFields, setEmptyFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const update = <K extends keyof ApplicantPayload>(key: K, value: ApplicantPayload[K]) => {
    onChange({ ...applicant, [key]: value });
  };

  const setFieldEmpty = useCallback((field: string, label: string, isEmpty: boolean) => {
    setEmptyFields((current) => {
      if (isEmpty && current[field] === label) {
        return current;
      }
      if (!isEmpty && !current[field]) {
        return current;
      }

      const next = { ...current };
      if (isEmpty) {
        next[field] = label;
      } else {
        delete next[field];
      }
      return next;
    });
    if (!isEmpty) {
      setFormError("");
    }
  }, []);

  const handleSubmit = () => {
    const missing = Object.values(emptyFields);
    if (!applicant.applicant_id.trim()) {
      missing.unshift("Applicant ID");
    }

    if (missing.length) {
      setFormError(`Fill in ${missing.join(", ")} before scoring.`);
      return;
    }

    setFormError("");
    onSubmit();
  };

  return (
    <section className="panel borrower-panel">
      <div className="panel-title">
        <BadgeCheck size={21} />
        <div>
          <h2>Borrower Information</h2>
        </div>
      </div>

      <div className="form-grid">
        <Field label="Applicant ID">
          <input value={applicant.applicant_id} onChange={(event) => update("applicant_id", event.target.value)} />
        </Field>
        <NumberField field="Age" label="Age" value={applicant.Age} onChange={(value) => update("Age", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="Income" label="Income (Annual)" value={applicant.Income} onChange={(value) => update("Income", value)} onEmptyChange={setFieldEmpty} prefix="$" />
        <NumberField field="LoanAmount" label="Loan Amount" value={applicant.LoanAmount} onChange={(value) => update("LoanAmount", value)} onEmptyChange={setFieldEmpty} prefix="$" />
        <NumberField field="CreditScore" label="Credit Score" value={applicant.CreditScore} onChange={(value) => update("CreditScore", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="MonthsEmployed" label="Months Employed" value={applicant.MonthsEmployed} onChange={(value) => update("MonthsEmployed", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="NumCreditLines" label="Credit Lines" value={applicant.NumCreditLines} onChange={(value) => update("NumCreditLines", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="InterestRate" label="Interest Rate (%)" value={applicant.InterestRate} onChange={(value) => update("InterestRate", value)} onEmptyChange={setFieldEmpty} step={0.1} />
        <NumberField field="LoanTerm" label="Loan Term" value={applicant.LoanTerm} onChange={(value) => update("LoanTerm", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="DTIRatio" label="DTI Ratio" value={applicant.DTIRatio} onChange={(value) => update("DTIRatio", value)} onEmptyChange={setFieldEmpty} step={0.01} />
        <SelectField label="Employment Type" value={applicant.EmploymentType} options={employmentOptions} onChange={(value) => update("EmploymentType", value)} />
        <SelectField label="Education" value={applicant.Education} options={educationOptions} onChange={(value) => update("Education", value)} />
        <SelectField label="Marital Status" value={applicant.MaritalStatus} options={maritalOptions} onChange={(value) => update("MaritalStatus", value)} />
        <SelectField label="Loan Purpose" value={applicant.LoanPurpose} options={purposeOptions} onChange={(value) => update("LoanPurpose", value)} />
        <SelectField label="Has Mortgage" value={applicant.HasMortgage} options={yesNoOptions} onChange={(value) => update("HasMortgage", value)} />
        <SelectField label="Has Dependents" value={applicant.HasDependents} options={yesNoOptions} onChange={(value) => update("HasDependents", value)} />
        <SelectField label="Has Co-Signer" value={applicant.HasCoSigner} options={yesNoOptions} onChange={(value) => update("HasCoSigner", value)} />
      </div>

      <button className="primary-button" type="button" onClick={handleSubmit} disabled={loading}>
        <BadgeCheck size={18} />
        <span>{loading ? "Scoring..." : "Score Applicant"}</span>
      </button>
      {formError && <p className="form-error">{formError}</p>}
      <p className="form-note">All fields are required for scoring</p>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function NumberField({
  field,
  label,
  value,
  prefix,
  step = 1,
  onChange,
  onEmptyChange
}: {
  field: string;
  label: string;
  value: number;
  prefix?: string;
  step?: number;
  onChange: (value: number) => void;
  onEmptyChange: (field: string, label: string, isEmpty: boolean) => void;
}) {
  const [draftValue, setDraftValue] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused && draftValue.trim() !== "") {
      setDraftValue(String(value));
      onEmptyChange(field, label, false);
    }
  }, [draftValue, field, focused, label, onEmptyChange, value]);

  const handleChange = (nextValue: string) => {
    setDraftValue(nextValue);

    const isEmpty = nextValue.trim() === "";
    onEmptyChange(field, label, isEmpty);
    if (isEmpty) {
      return;
    }

    const numericValue = Number(nextValue);
    if (Number.isFinite(numericValue)) {
      onChange(numericValue);
    }
  };

  return (
    <Field label={label}>
      <span className="input-shell">
        {prefix && <b>{prefix}</b>}
        <input
          type="number"
          step={step}
          value={draftValue}
          onBlur={() => setFocused(false)}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={() => setFocused(true)}
        />
      </span>
    </Field>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}
