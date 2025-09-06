import { Wallet, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Wallet className="text-primary-foreground text-sm" />
              </div>
              <span className="text-xl font-bold">CryptoWallet API</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">API Online</span>
              </div>
              <Button 
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="gradient-mesh py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Secure Crypto Wallet
            <span className="block text-primary">Management API</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Build powerful crypto applications with our secure, production-ready API. 
            Generate wallets, process transactions, and manage balances with enterprise-grade security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              data-testid="button-documentation"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need for crypto wallet management
            </h2>
            <p className="text-xl text-muted-foreground">
              Production-ready features with enterprise-grade security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="text-blue-500 text-xl" />
                </div>
                <CardTitle>Wallet Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Auto-generate secure Ethereum & Polygon compatible wallets with encrypted private key storage.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-green-500 text-xl" />
                </div>
                <CardTitle>Secure Authentication</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  JWT-based authentication with social logins, multi-factor authentication, and encrypted storage.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-yellow-500 text-xl" />
                </div>
                <CardTitle>Fast Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Send tokens, ETH, and MATIC with real-time balance tracking and transaction history.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="text-purple-500 text-xl" />
                </div>
                <CardTitle>Multi-Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Support for Ethereum and Polygon networks with real-time price data from CoinGecko.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Example */}
      <section className="py-20 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Simple, Powerful API
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started with just a few API calls
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-3 text-foreground">Generate Wallet</h3>
              <div className="code-block p-4 rounded-lg">
                <pre className="text-sm text-foreground font-mono overflow-x-auto">
                  <code>{`POST /api/wallets/generate
{
  "network": "ethereum"
}

// Response
{
  "walletId": "wallet_abc123",
  "address": "0x742d35Cc6C...",
  "network": "ethereum"
}`}</code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 text-foreground">Send Transaction</h3>
              <div className="code-block p-4 rounded-lg">
                <pre className="text-sm text-foreground font-mono overflow-x-auto">
                  <code>{`POST /api/wallets/send
{
  "walletId": "wallet_abc123",
  "toAddress": "0x1234...",
  "amount": "0.1",
  "currency": "ETH",
  "network": "ethereum"
}

// Response
{
  "transactionHash": "0x789...",
  "status": "pending"
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to build the future of crypto?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join developers who trust our secure, scalable crypto wallet infrastructure
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-3"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-cta-start"
          >
            Start Building Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Wallet className="text-primary-foreground text-xs" />
              </div>
              <span className="font-semibold">CryptoWallet API</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 CryptoWallet API. Built with enterprise-grade security.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
