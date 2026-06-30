import { Check, X } from "lucide-react";

const PasswordChecklist = ({ password, touched }) => {
  const rules = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", valid: /[a-z]/.test(password) },
    { label: "One number (0-9)", valid: /\d/.test(password) },
    {
      label: "One special character (e.g. @, $, !, %)",
      valid: /[\W_]/.test(password),
    },
  ];

  if (!touched) return null;

  return (
    <div className="p-3 mt-2 space-y-1.5 text-xs border rounded-2xl bg-surface-secondary/40 border-border/50">
      <p className="font-medium text-muted">Password requirements:</p>
      {rules.map((rule, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {rule.valid ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <X className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={rule.valid ? "text-emerald-500/90" : "text-muted"}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordChecklist;
