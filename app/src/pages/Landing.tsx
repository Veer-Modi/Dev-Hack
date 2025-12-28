import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Clock, Users, Radio, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { mockIncidents } from '@/data/mockData';

export default function Landing() {
  const activeIncidents = mockIncidents.filter((i) => i.status !== 'resolved').length;
  const ongoingResponses = mockIncidents.filter((i) => i.status === 'in-progress').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-info blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-critical blur-3xl" />
        </div>
        
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground backdrop-blur-sm animate-fade-in">
              <Radio className="h-4 w-4 animate-pulse-slow" />
              Real-time Emergency Coordination Platform
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl md:text-6xl animate-slide-up">
              Report Emergencies.
              <br />
              <span className="text-info">Enable Faster Response.</span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/80 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              A unified platform connecting citizens with emergency responders. Report incidents in real-time, 
              track response progress, and help your community stay safe.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="xl" variant="emergency" asChild className="w-full sm:w-auto">
                <Link to="/report" className="gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Report an Incident
                </Link>
              </Button>
              <Button size="xl" variant="heroOutline" asChild className="w-full sm:w-auto">
                <Link to="/login" className="gap-2">
                  <Shield className="h-5 w-5" />
                  Login (Responder / Admin)
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="border-b border-border bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-critical/10">
                <AlertTriangle className="h-7 w-7 text-critical" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Incidents</p>
                <p className="text-3xl font-bold">{activeIncidents}</p>
              </div>
              <div className="ml-auto h-2 w-2 animate-pulse-slow rounded-full bg-critical" />
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-warning/10">
                <Clock className="h-7 w-7 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ongoing Responses</p>
                <p className="text-3xl font-bold">{ongoingResponses}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success/10">
                <Users className="h-7 w-7 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Responders Active</p>
                <p className="text-3xl font-bold">24</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Our platform streamlines emergency reporting and response coordination, 
              ensuring help reaches where it's needed most.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: AlertTriangle,
                title: 'Report Instantly',
                description: 'Citizens can quickly report emergencies with location, photos, and detailed descriptions.',
                color: 'critical',
              },
              {
                icon: Shield,
                title: 'Verify & Prioritize',
                description: 'Responders verify reports and prioritize based on severity, location, and resources.',
                color: 'info',
              },
              {
                icon: CheckCircle,
                title: 'Coordinate Response',
                description: 'Real-time updates keep everyone informed from incident report to resolution.',
                color: 'success',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-${feature.color}/10`}>
                  <feature.icon className={`h-7 w-7 text-${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Make a Difference?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of citizens helping to keep their communities safe through 
              rapid incident reporting and coordination.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/citizen" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/feed">View Live Feed</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4 text-primary-foreground"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-semibold">RapidResponse</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Help</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 RapidResponse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
