import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function APIDocumentationSection() {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      toast({
        title: "Copied to clipboard",
        description: "Code example has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const authExample = `{
  "email": "user@example.com",
  "password": "securePassword123",
  "provider": "auth0"
}`;

  const authResponse = `{
  "user": {
    "id": "auth0|6475a2b...",
    "email": "user@example.com",
    "walletAddress": "0x742d3...",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJSUzI1NiIs..."
}`;

  const walletResponse = `{
  "address": "0x742d35Cc6C...",
  "balance": {
    "ETH": "2.45",
    "MATIC": "1250.30",
    "USDC": "500.00"
  },
  "network": "ethereum",
  "lastUpdated": "2024-01-15T10:45:00Z"
}`;

  const walletHeaders = `Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json`;

  return (
    <Card className="mb-8" data-testid="card-api-documentation">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            API Documentation & Examples
          </CardTitle>
          <div className="flex space-x-2">
            <Badge variant="default" className="bg-primary/20 text-primary">
              REST API
            </Badge>
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              GraphQL
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Example */}
          <div>
            <h3 className="text-lg font-medium mb-3">User Authentication</h3>
            <div className="code-block p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">POST /auth/signup</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(authExample, 'auth-request')}
                  data-testid="button-copy-auth-request"
                >
                  {copiedCode === 'auth-request' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <pre className="text-sm text-foreground font-mono overflow-x-auto">
                <code>{authExample}</code>
              </pre>
            </div>
            
            <div className="mt-4 code-block p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="bg-green-400/20 text-green-400 text-xs">
                  Response 201
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(authResponse, 'auth-response')}
                  data-testid="button-copy-auth-response"
                >
                  {copiedCode === 'auth-response' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <pre className="text-sm text-foreground font-mono overflow-x-auto">
                <code>{authResponse}</code>
              </pre>
            </div>
          </div>
          
          {/* Wallet Operations Example */}
          <div>
            <h3 className="text-lg font-medium mb-3">Wallet Operations</h3>
            <div className="code-block p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">GET /wallet/:id</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(walletHeaders, 'wallet-headers')}
                  data-testid="button-copy-wallet-headers"
                >
                  {copiedCode === 'wallet-headers' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <pre className="text-sm text-foreground font-mono overflow-x-auto">
                <code>{walletHeaders}</code>
              </pre>
            </div>
            
            <div className="mt-4 code-block p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="bg-green-400/20 text-green-400 text-xs">
                  Response 200
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(walletResponse, 'wallet-response')}
                  data-testid="button-copy-wallet-response"
                >
                  {copiedCode === 'wallet-response' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <pre className="text-sm text-foreground font-mono overflow-x-auto">
                <code>{walletResponse}</code>
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
