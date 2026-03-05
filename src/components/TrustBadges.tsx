import { ShieldCheck, Users, Lock } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: ShieldCheck,
      label: "Audiologist Inspired",
    },
    {
      icon: Lock,
      label: "100% Confidential",
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-soft"
        >
          <badge.icon className="h-4 w-4 text-primary" />
          <span className="text-body-sm font-medium text-foreground">
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TrustBadges;
