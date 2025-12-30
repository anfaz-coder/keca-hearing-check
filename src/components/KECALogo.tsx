import { Headphones } from "lucide-react";

interface KECALogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

const KECALogo = ({ size = "md", showTagline = false }: KECALogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
  };

  return (
    <div className="flex items-center gap-2">
      <div className="keca-gradient rounded-xl p-2 shadow-keca">
        <Headphones className="text-primary-foreground" size={iconSizes[size]} />
      </div>
      <div className="flex flex-col">
        <span className={`font-bold text-foreground ${sizeClasses[size]}`}>
          KECA
        </span>
        {showTagline && (
          <span className="text-body-sm text-muted-foreground">
            Trusted Hearing Care
          </span>
        )}
      </div>
    </div>
  );
};

export default KECALogo;
