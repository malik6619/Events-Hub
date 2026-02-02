import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Ticket, Users, BarChart3, QrCode, CreditCard, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Index() {
  const navigate = useNavigate();
  const supabaseConfigured = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">EventHub</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/login')}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Supabase Configuration Alert */}
      {!supabaseConfigured && (
        <div className="container mx-auto px-4 pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Supabase Not Configured</AlertTitle>
            <AlertDescription>
              Please click the Supabase button in the top-right corner to connect your database. 
              After connecting, execute the SQL schema from <code className="bg-gray-100 px-1 rounded">supabase_schema.sql</code> in your Supabase SQL Editor.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Create Amazing Events,
          <br />
          <span className="text-indigo-600">Sell Tickets Effortlessly</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The complete event management and ticketing platform. From creation to check-in, manage everything in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/login')} className="text-lg px-8">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            View Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Run Events</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Ticket className="h-10 w-10 text-indigo-600" />}
            title="Flexible Ticketing"
            description="Create free, paid, donation, and tiered tickets with capacity management and pricing options."
          />
          <FeatureCard
            icon={<CreditCard className="h-10 w-10 text-indigo-600" />}
            title="Secure Payments"
            description="Accept payments with Stripe integration. Instant payouts and comprehensive fee management."
          />
          <FeatureCard
            icon={<QrCode className="h-10 w-10 text-indigo-600" />}
            title="QR Code Check-in"
            description="Fast attendee check-in with QR codes. Mobile-friendly interface for event staff."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-indigo-600" />}
            title="Attendee Management"
            description="Search, edit, and manage attendees. Process refunds and send bulk messages."
          />
          <FeatureCard
            icon={<BarChart3 className="h-10 w-10 text-indigo-600" />}
            title="Real-time Analytics"
            description="Track sales, revenue, and attendee metrics with beautiful dashboards and reports."
          />
          <FeatureCard
            icon={<Calendar className="h-10 w-10 text-indigo-600" />}
            title="Custom Event Pages"
            description="Create branded event pages with SEO tools and embeddable ticket widgets."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Create Your First Event?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of event organizers using EventHub</p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="text-lg px-8">
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 EventHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}