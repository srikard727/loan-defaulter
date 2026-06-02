import { BadgeCheck } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { ApplicantPayload } from "../types";

type BorrowerFormProps = {
  applicant: ApplicantPayload;
  loaners?: ApplicantPayload[];
  loading?: boolean;
  selectedLoaner?: string;
  onChange: (payload: ApplicantPayload) => void;
  onLoanerSelect?: (loanerName: string) => void;
  onSubmit: () => void;
};

const educationOptions = ["High School", "Bachelor's", "Master's", "PhD"] as const;
const employmentOptions = ["Full-time", "Part-time", "Self-employed", "Unemployed"] as const;
const maritalOptions = ["Single", "Married", "Divorced"] as const;
const yesNoOptions = ["No", "Yes"] as const;
const purposeOptions = ["Auto", "Business", "Education", "Home", "Other"] as const;

export function BorrowerForm({
  applicant,
  loaners,
  loading,
  selectedLoaner,
  onChange,
  onLoanerSelect,
  onSubmit
}: BorrowerFormProps) {
  const [emptyFields, setEmptyFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const hasLoaner = Boolean(applicant.applicant_id.trim());
  const fieldsDisabled = !hasLoaner;

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
      missing.unshift("Loaner Name");
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
        {loaners && onLoanerSelect && (
          <Field label="Current Loaner">
            <select
              disabled={!loaners.length}
              value={selectedLoaner ?? applicant.applicant_id}
              onChange={(event) => onLoanerSelect(event.target.value)}
            >
              {!loaners.length && <option value="">No loaners yet</option>}
              {loaners.map((loaner) => (
                <option key={loaner.applicant_id} value={loaner.applicant_id}>
                  {loaner.applicant_id}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Loaner Name">
          <input value={applicant.applicant_id} readOnly disabled={fieldsDisabled} />
        </Field>
        <NumberField field="Age" label="Age" value={applicant.Age} disabled={fieldsDisabled} onChange={(value) => update("Age", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="Income" label="Income (Annual)" value={applicant.Income} disabled={fieldsDisabled} onChange={(value) => update("Income", value)} onEmptyChange={setFieldEmpty} prefix="$" />
        <NumberField field="LoanAmount" label="Loan Amount" value={applicant.LoanAmount} disabled={fieldsDisabled} onChange={(value) => update("LoanAmount", value)} onEmptyChange={setFieldEmpty} prefix="$" />
        <NumberField field="CreditScore" label="Credit Score" value={applicant.CreditScore} disabled={fieldsDisabled} onChange={(value) => update("CreditScore", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="MonthsEmployed" label="Months Employed" value={applicant.MonthsEmployed} disabled={fieldsDisabled} onChange={(value) => update("MonthsEmployed", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="NumCreditLines" label="Credit Lines" value={applicant.NumCreditLines} disabled={fieldsDisabled} onChange={(value) => update("NumCreditLines", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="InterestRate" label="Interest Rate (%)" value={applicant.InterestRate} disabled={fieldsDisabled} onChange={(value) => update("InterestRate", value)} onEmptyChange={setFieldEmpty} step={0.1} />
        <NumberField field="LoanTerm" label="Loan Term" value={applicant.LoanTerm} disabled={fieldsDisabled} onChange={(value) => update("LoanTerm", value)} onEmptyChange={setFieldEmpty} />
        <NumberField field="DTIRatio" label="DTI Ratio" value={applicant.DTIRatio} disabled={fieldsDisabled} onChange={(value) => update("DTIRatio", value)} onEmptyChange={setFieldEmpty} step={0.01} />
        <SelectField label="Employment Type" value={applicant.EmploymentType} disabled={fieldsDisabled} options={employmentOptions} onChange={(value) => update("EmploymentType", value)} />
        <SelectField label="Education" value={applicant.Education} disabled={fieldsDisabled} options={educationOptions} onChange={(value) => update("Education", value)} />
        <SelectField label="Marital Status" value={applicant.MaritalStatus} disabled={fieldsDisabled} options={maritalOptions} onChange={(value) => update("MaritalStatus", value)} />
        <SelectField label="Loan Purpose" value={applicant.LoanPurpose} disabled={fieldsDisabled} options={purposeOptions} onChange={(value) => update("LoanPurpose", value)} />
        <SelectField label="Has Mortgage" value={applicant.HasMortgage} disabled={fieldsDisabled} options={yesNoOptions} onChange={(value) => update("HasMortgage", value)} />
        <SelectField label="Has Dependents" value={applicant.HasDependents} disabled={fieldsDisabled} options={yesNoOptions} onChange={(value) => update("HasDependents", value)} />
        <SelectField label="Has Co-Signer" value={applicant.HasCoSigner} disabled={fieldsDisabled} options={yesNoOptions} onChange={(value) => update("HasCoSigner", value)} />
      </div>

      <button className="primary-button" type="button" onClick={handleSubmit} disabled={loading || !hasLoaner}>
        <BadgeCheck size={18} />
        <span>{loading ? "Scoring..." : "Score Loaner"}</span>
      </button>
      {formError && <p className="form-error">{formError}</p>}
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
  disabled,
  prefix,
  step = 1,
  onChange,
  onEmptyChange
}: {
  field: string;
  label: string;
  value: number;
  disabled?: boolean;
  prefix?: string;
  step?: number;
  onChange: (value: number) => void;
  onEmptyChange: (field: string, label: string, isEmpty: boolean) => void;
}) {
  const [draftValue, setDraftValue] = useState(disabled ? "" : String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (disabled) {
      setDraftValue("");
      onEmptyChange(field, label, false);
      return;
    }

    if (!focused) {
      setDraftValue(String(value));
      onEmptyChange(field, label, false);
    }
  }, [disabled, field, focused, label, onEmptyChange, value]);

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
          disabled={disabled}
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
  disabled,
  options,
  onChange
}: {
  label: string;
  value: T;
  disabled?: boolean;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  if (disabled) {
    return (
      <Field label={label}>
        <input disabled value="" />
      </Field>
    );
  }

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
