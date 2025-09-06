import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SecurityFeaturesSection() {
  const securityFeatures = [
    {
      title: "Authentication",
      description: "Secure JWT-based authentication with social login support and multi-factor authentication.",
      icon: Shield,
      color: "green",
    },
    {
      title: "Encrypted Storage",
      description: "Private keys are encrypted using AES-256 before storage. Public addresses only stored in database.",
      icon: Lock,
      color: "blue",
    },
    {
      title: "Input Validation",
      description: "Comprehensive validation middleware protects against injection attacks and malformed requests.",
      icon: CheckCircle2,
      color: "purple",
    },
  ];

  return (
    <Card data-testid="card-security-features">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Security & Compliance Features
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center p-6 bg-muted rounded-lg"
              data-testid={`security-feature-${index}`}
            >
              <div className={`w-12 h-12 bg-${feature.color}-500/20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className={`text-${feature.color}-500 text-xl`} />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="text-yellow-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-foreground">Security Best Practices</p>
              <p className="text-sm text-muted-foreground mt-1">
                This platform implements industry-standard security measures including rate limiting, 
                request signing, webhook verification, and comprehensive audit logging.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
