import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import KECALogo from "./KECALogo";
import { FileText, Shield, Phone, Mail } from "lucide-react";

interface LeadCaptureProps {
  onSubmit: (data: LeadData) => void;
}

export interface LeadData {
  mobile: string;
  email: string;
  whatsappConsent: boolean;
}

const LeadCapture = ({ onSubmit }: LeadCaptureProps) => {
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [errors, setErrors] = useState<{ mobile?: string; email?: string }>({});

  const validateForm = () => {
    const newErrors: { mobile?: string; email?: string } = {};

    // Mobile validation (basic)
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[6-9]\d{9}$/.test(mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        mobile: mobile.replace(/\D/g, ""),
        email: email.trim(),
        whatsappConsent,
      });
    }
  };

  return (
    <div className="min-h-screen keca-gradient-soft">
      {/* Header */}
      <header className="container flex items-center justify-center py-6">
        <KECALogo size="md" />
      </header>

      <main className="container pb-12">
        <div className="mx-auto max-w-md">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="animate-float rounded-full bg-card p-8 shadow-elevated">
              <FileText className="h-20 w-20 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-heading text-foreground">
            Your KECA Hearing Report is Ready!
          </h1>

          {/* Description */}
          <p className="mb-8 text-center text-body-lg text-muted-foreground">
            Enter your details to view your personalized results.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile */}
            <div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className={`h-14 pl-12 text-body ${
                    errors.mobile ? "border-destructive" : ""
                  }`}
                />
              </div>
              {errors.mobile && (
                <p className="mt-1 text-body-sm text-destructive">{errors.mobile}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-14 pl-12 text-body ${
                    errors.email ? "border-destructive" : ""
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-body-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* WhatsApp Consent */}
            <div className="flex items-start gap-3 rounded-xl bg-card p-4 shadow-soft">
              <Checkbox
                id="whatsapp"
                checked={whatsappConsent}
                onCheckedChange={(checked) => setWhatsappConsent(checked as boolean)}
                className="mt-0.5"
              />
              <label
                htmlFor="whatsapp"
                className="cursor-pointer text-body-sm text-muted-foreground"
              >
                Send my results and hearing health tips via WhatsApp
              </label>
            </div>

            {/* Submit Button */}
            <Button variant="cta" size="xl" type="submit" className="w-full">
              View My KECA Hearing Report
            </Button>
          </form>

          {/* Trust Copy */}
          <div className="mt-6 flex items-center justify-center gap-2 text-body-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>KECA respects your privacy. No spam. Your data is safe.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeadCapture;
