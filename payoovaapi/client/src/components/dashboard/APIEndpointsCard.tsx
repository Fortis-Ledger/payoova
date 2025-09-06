import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const endpoints = [
  {
    method: "POST",
    path: "/auth/signup",
    uptime: "99.9%",
    status: "operational",
  },
  {
    method: "GET",
    path: "/wallet/:id", 
    uptime: "99.8%",
    status: "operational",
  },
  {
    method: "POST",
    path: "/wallet/send",
    uptime: "99.7%",
    status: "operational",
  },
  {
    method: "GET",
    path: "/transactions/:id",
    uptime: "99.9%",
    status: "operational",
  },
];

export default function APIEndpointsCard() {
  return (
    <Card data-testid="card-api-endpoints">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">API Endpoints</CardTitle>
          <Badge variant="secondary" className="bg-green-500/20 text-green-500">
            All Systems Operational
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <div 
              key={`${endpoint.method}-${endpoint.path}`}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
              data-testid={`endpoint-${index}`}
            >
              <div className="flex items-center space-x-3">
                <Badge 
                  variant={endpoint.method === "POST" ? "default" : "secondary"}
                  className={`${
                    endpoint.method === "POST" 
                      ? "bg-blue-500 text-white" 
                      : "bg-green-500 text-white"
                  } font-mono text-xs`}
                >
                  {endpoint.method}
                </Badge>
                <span className="font-mono text-sm">{endpoint.path}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{endpoint.uptime}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
